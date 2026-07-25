/**
 * useWhisper — advanced speech-to-text hook
 *
 * Strategy:
 *   1. Tries to record via MediaRecorder (all modern browsers) and sends the
 *      audio to the backend Whisper endpoint for high-accuracy transcription.
 *   2. Falls back to the browser's Web Speech API if MediaRecorder is
 *      unavailable OR if the backend returns 503 (no API key configured).
 *   3. Falls back to a mock transcript if neither is available.
 */

import { useRef, useState, useCallback } from 'react';
import { stt } from '../lib/api';

export type RecordingState = 'idle' | 'recording' | 'processing';

export interface UseWhisperOptions {
  /** Called when a final transcript is ready */
  onTranscript: (text: string) => void;
  /** Called if something goes wrong */
  onError?: (err: string) => void;
}

export function useWhisper({ onTranscript, onError }: UseWhisperOptions) {
  const [state, setState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Web Speech API fallback ─────────────────────────────────────────────────
  const startWebSpeech = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript ?? '';
      if (text) onTranscript(text);
    };
    recognition.onerror = (e: any) => {
      setState('idle');
      onError?.(e.error ?? 'Speech recognition error');
    };
    recognition.onend = () => setState('idle');

    try {
      recognition.start();
      setState('recording');
    } catch {
      setState('idle');
    }
  }, [onTranscript, onError]);

  // ── Start recording via MediaRecorder ──────────────────────────────────────
  const start = useCallback(async () => {
    if (state !== 'idle') return;

    // Try MediaRecorder path first
    if (typeof MediaRecorder === 'undefined') {
      startWebSpeech();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Pick a supported MIME type
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        // Stop all tracks so the browser mic indicator goes away
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        chunksRef.current = [];

        setState('processing');

        try {
          const result = await stt.transcribe(blob);
          onTranscript(result.transcript);
        } catch (err: any) {
          // If backend is unavailable (no API key), fall back to Web Speech API
          if (err.message?.includes('unavailable') || err.message?.includes('503')) {
            startWebSpeech();
            return;
          }
          onError?.(err.message ?? 'Transcription failed');
        } finally {
          setState('idle');
        }
      };

      mr.start();
      setState('recording');
    } catch (err: any) {
      // Mic permission denied → try Web Speech API as fallback
      startWebSpeech();
    }
  }, [state, onTranscript, onError, startWebSpeech]);

  // ── Stop recording ──────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      // state transitions to 'processing' inside onstop handler
    } else {
      setState('idle');
    }
  }, []);

  // ── Toggle (start/stop) ────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (state === 'idle') start();
    else if (state === 'recording') stop();
    // If 'processing', do nothing — wait for it to finish
  }, [state, start, stop]);

  return { state, toggle, start, stop };
}
