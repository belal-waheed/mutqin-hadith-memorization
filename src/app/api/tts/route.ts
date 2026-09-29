import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  if (!text) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  // We can let the frontend pass the voice if needed, but default to Salma
  const voice = req.nextUrl.searchParams.get("voice") || "ar-EG-SalmaNeural";

  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`;

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Create native WebSocket (available in Edge runtime)
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    // 1. Send Config
    const configMsg = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
    ws.send(configMsg);

    // 2. Send SSML
    const requestId = crypto.randomUUID().replace(/-/g, "");
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ar-EG'><voice name='${voice}'><prosody pitch='+0Hz' rate='0.9' volume='+0%'>${text}</prosody></voice></speak>`;
    const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
    ws.send(ssmlMsg);
  };

  ws.onmessage = async (event) => {
    if (typeof event.data === "string") {
      if (event.data.includes("Path:turn.end")) {
        // Done generating audio
        ws.close();
        writer.close();
      }
    } else {
      // Binary data (Blob in standard fetch/edge APIs)
      const buffer = await (event.data as Blob).arrayBuffer();
      const view = new Uint8Array(buffer);

      // Search for the \r\n\r\n separator that ends the text header
      let headerEnd = -1;
      for (let i = 0; i < view.length - 3; i++) {
        if (
          view[i] === 0x0d &&
          view[i + 1] === 0x0a &&
          view[i + 2] === 0x0d &&
          view[i + 3] === 0x0a
        ) {
          headerEnd = i + 4;
          break;
        }
      }

      if (headerEnd !== -1) {
        // Write only the audio payload to the stream
        const audioData = view.slice(headerEnd);
        writer.write(audioData);
      }
    }
  };

  ws.onerror = (error) => {
    console.error("Edge TTS WebSocket error:", error);
    writer.abort(error);
  };

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
