import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const HF_SPACE_URL = 'https://innoai-edge-tts-text-to-speech.hf.space';
const MALE_VOICE = 'ar-SA-HamedNeural - ar-SA (Male)';

async function synthesizeViaHFSpace(text: string): Promise<Buffer> {
  const callRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/tts_interface`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [text, MALE_VOICE, 0, 0],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!callRes.ok) {
    throw new Error(`HF Space call initiation failed with status ${callRes.status}`);
  }

  const { event_id } = await callRes.json();
  if (!event_id) {
    throw new Error('No event_id returned from HF Space');
  }

  const sseRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/tts_interface/${event_id}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (!sseRes.ok) {
    throw new Error(`HF Space SSE failed with status ${sseRes.status}`);
  }

  const sseText = await sseRes.text();
  let audioUrl: string | null = null;

  for (const line of sseText.split('\n')) {
    if (line.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(line.substring(6));
        if (Array.isArray(parsed) && parsed[0]?.url) {
          audioUrl = parsed[0].url;
          break;
        }
      } catch {
        // ignore non-json data lines
      }
    }
  }

  if (!audioUrl) {
    throw new Error('No audio URL found in HF Space SSE stream');
  }

  const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(10000) });
  if (!audioRes.ok) {
    throw new Error(`Failed to download audio file: status ${audioRes.status}`);
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: 'Text too long' }, { status: 400 });
  }

  try {
    const audioBuffer = await synthesizeViaHFSpace(text.trim());

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TTS] Generation error:', message);
    return NextResponse.json(
      { error: 'TTS generation failed', details: message },
      { status: 502 }
    );
  }
}
