/**
 * Flaire STT Service — OpenAI Whisper
 *
 * Accepts raw audio buffer + MIME type, sends to OpenAI Whisper API,
 * returns the transcript and a rough confidence score.
 */

import OpenAI from 'openai';
import { toFile } from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment variables.');
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export interface STTResult {
  transcript: string;
  language: string;
  durationSeconds: number | null;
}

/**
 * Transcribe audio using OpenAI Whisper.
 * @param buffer  Raw audio data (webm, mp4, wav, ogg, etc.)
 * @param mimeType  e.g. "audio/webm" or "audio/wav"
 */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string
): Promise<STTResult> {
  const client = getClient();

  // Derive a file extension from the MIME type so Whisper knows the codec
  const ext = mimeType.split('/')[1]?.split(';')[0] ?? 'webm';
  const filename = `recording.${ext}`;

  const file = await toFile(buffer, filename, { type: mimeType });

  const response = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    response_format: 'verbose_json',
    language: 'en',
  });

  return {
    transcript: (response as any).text ?? '',
    language: (response as any).language ?? 'en',
    durationSeconds: (response as any).duration ?? null,
  };
}
