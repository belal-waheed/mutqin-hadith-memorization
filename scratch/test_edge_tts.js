// Quick test of msedge-tts to see if it can generate Arabic audio
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

async function test() {
  console.log('Creating TTS instance...');
  const tts = new MsEdgeTTS();
  
  console.log('Setting voice metadata (ar-SA-HamedNeural)...');
  try {
    await tts.setMetadata(
      'ar-SA-HamedNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );
  } catch (err) {
    console.error('setMetadata failed:', err.message);
    // Try alternative approach
    console.log('Trying alternative...');
    try {
      await tts.setMetadata(
        'ar-EG-ShakirNeural', 
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
      );
    } catch (err2) {
      console.error('Alternative also failed:', err2.message);
      process.exit(1);
    }
  }
  
  const testText = 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى';
  console.log('Generating audio for:', testText.substring(0, 50) + '...');
  
  try {
    const { audioStream } = tts.toStream(testText);
    
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('end', () => resolve());
      audioStream.on('error', (err) => reject(err));
    });
    
    const buffer = Buffer.concat(chunks);
    const outPath = path.join(__dirname, 'test_edge_tts.mp3');
    fs.writeFileSync(outPath, buffer);
    console.log('SUCCESS! Audio saved:', outPath);
    console.log('File size:', buffer.length, 'bytes');
  } catch (err) {
    console.error('toStream failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
