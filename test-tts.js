
const crypto = require('crypto');
const fs = require('fs');

async function testEdgeTTS(text) {
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
  const ws = new WebSocket(wsUrl);

  const fileStream = fs.createWriteStream('test-audio.mp3');

  ws.on('open', () => {
    console.log('Connected');
    const configMsg = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
    ws.send(configMsg);

    const requestId = crypto.randomUUID().replace(/-/g, '');
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ar-EG'><voice name='ar-EG-SalmaNeural'><prosody pitch='+0Hz' rate='0.9' volume='+0%'>${text}</prosody></voice></speak>`;
    const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
    ws.send(ssmlMsg);
  });

  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      const msg = data.toString();
      if (msg.includes('Path:turn.end')) {
        console.log('Done receiving audio');
        fileStream.end();
        ws.close();
      }
    } else {
      // The first few bytes are the header (ends with \r\n\r\n -> 0x0d 0x0a 0x0d 0x0a)
      let headerEnd = -1;
      for (let i = 0; i < data.length - 3; i++) {
        if (data[i] === 0x0d && data[i+1] === 0x0a && data[i+2] === 0x0d && data[i+3] === 0x0a) {
          headerEnd = i + 4;
          break;
        }
      }
      
      if (headerEnd !== -1) {
        const audioData = data.slice(headerEnd);
        fileStream.write(audioData);
      }
    }
  });

  ws.on('error', (err) => {
    console.error('Error:', err);
  });
}

testEdgeTTS('إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.');
