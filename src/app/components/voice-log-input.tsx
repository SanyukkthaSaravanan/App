import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Mic, MicOff, Sparkles, RotateCcw } from 'lucide-react';
import { useWhisper } from '../../hooks/useWhisper';
import { nlp, type ParsedLog } from '../../lib/api';

interface VoiceLogInputProps {
  /** Short example prompt shown to the user */
  hint?: string;
  /** Called with the structured, category-routed result once processed */
  onParsed: (parsed: ParsedLog) => void;
}

/**
 * Reusable voice-logging control:
 *   record → Whisper transcript → editable review → NLP parse → onParsed().
 *
 * Falls back to the browser's Web Speech API if the Whisper endpoint is
 * unavailable (handled inside useWhisper).
 */
export function VoiceLogInput({ hint, onParsed }: VoiceLogInputProps) {
  const [phase, setPhase] = useState<'idle' | 'review' | 'parsing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const whisper = useWhisper({
    onTranscript: (text) => {
      setTranscript((prev) => (prev ? prev + ' ' : '') + text);
      setPhase('review');
    },
    onError: (e) => setError(e),
  });

  const recording = whisper.state === 'recording';
  const transcribing = whisper.state === 'processing';

  const handleParse = async () => {
    if (!transcript.trim()) return;
    setError(null);
    setPhase('parsing');
    try {
      const result = await nlp.parseLog(transcript.trim());
      onParsed(result);
      setTranscript('');
      setPhase('idle');
    } catch (e: any) {
      setError(e.message ?? 'Could not process that. Please try again.');
      setPhase('review');
    }
  };

  const reRecord = () => {
    setTranscript('');
    setError(null);
    setPhase('idle');
    whisper.start();
  };

  return (
    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F2EEDA' }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Quick voice entry</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? "Record and we'll fill in the details"}
          </p>
        </div>
        {phase !== 'review' && (
          <Button
            variant={recording ? 'destructive' : 'default'}
            size="sm"
            onClick={() => whisper.toggle()}
            disabled={transcribing || phase === 'parsing'}
            style={!recording ? { backgroundColor: '#7293BB' } : undefined}
          >
            {transcribing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Transcribing…
              </>
            ) : recording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start voice input
              </>
            )}
          </Button>
        )}
      </div>

      {recording && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm mt-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-blue-800">Listening… speak clearly, then press Stop.</span>
        </div>
      )}

      {phase === 'review' && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Here's what we heard — edit if needed, then process it:
          </p>
          <Textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your note…"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              style={{ backgroundColor: '#7293BB' }}
              onClick={handleParse}
              disabled={!transcript.trim()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={reRecord}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Re-record
            </Button>
          </div>
        </div>
      )}

      {phase === 'parsing' && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm mt-2">
          <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-800">Understanding your note…</span>
        </div>
      )}

      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
}
