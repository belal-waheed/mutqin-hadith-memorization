import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Limit text length to prevent abuse (hadiths are typically <1000 chars)
  if (text.length > 2000) {
    return NextResponse.json({ error: 'Text too long' }, { status: 400 });
  }

  let tts: MsEdgeTTS | null = null;
  try {
    tts = new MsEdgeTTS();
    await tts.setMetadata(
      'ar-SA-HamedNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );

    const { audioStream } = tts.toStream(text, { rate: 0.9 });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => resolve());
      audioStream.on('error', (err: Error) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);

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
    console.error('TTS generation failed:', message);
    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 500 }
    );
  } finally {
    tts?.close();
  }
}
