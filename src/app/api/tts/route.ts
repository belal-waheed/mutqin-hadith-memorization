import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: 'Text too long' }, { status: 400 });
  }

  let tts: MsEdgeTTS | null = null;
  try {
    console.log('[TTS] Initializing MsEdgeTTS...');
    tts = new MsEdgeTTS({ enableLogger: true });

    console.log('[TTS] Setting metadata (timeout 7s)...');
    const metaPromise = tts.setMetadata(
      'ar-SA-HamedNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MsEdgeTTS setMetadata timeout (7s) - connection dropped or blocked by upstream')), 7000)
    );

    await Promise.race([metaPromise, timeoutPromise]);
    console.log('[TTS] Metadata set successfully!');

    console.log('[TTS] Creating stream...');
    const { audioStream } = tts.toStream(text, { rate: 0.9 });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const streamTimeout = setTimeout(() => reject(new Error('Audio stream timeout (10s)')), 10000);
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => {
        clearTimeout(streamTimeout);
        resolve();
      });
      audioStream.on('error', (err: Error) => {
        clearTimeout(streamTimeout);
        reject(err);
      });
    });

    const audioBuffer = Buffer.concat(chunks);
    console.log(`[TTS] Audio generated successfully! Size: ${audioBuffer.length} bytes`);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TTS] Generation failed:', message);
    return NextResponse.json(
      { error: 'TTS generation failed', details: message },
      { status: 502 }
    );
  } finally {
    tts?.close();
  }
}
