// Test msedge-tts with a FULL hadith including chain of narrators + tashkeel
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');

async function test() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('ar-SA-HamedNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  
  // Full hadith with isnad chain (475 chars, same text that failed Google TTS)
  const longText = 'حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ قَالَ حَدَّثَنَا سُفْيَانُ قَالَ حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الأَنْصَارِيُّ قَالَ أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ يَقُولُ سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ قَالَ سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى';
  
  console.log('Text length:', longText.length, 'chars');
  console.log('Generating full hadith audio...');
  
  const start = Date.now();
  const { audioStream } = tts.toStream(longText);
  
  const chunks = [];
  await new Promise((resolve, reject) => {
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('end', () => resolve());
    audioStream.on('error', (err) => reject(err));
  });
  
  const buffer = Buffer.concat(chunks);
  const elapsed = Date.now() - start;
  
  fs.writeFileSync('scratch/test_full_hadith.mp3', buffer);
  console.log('SUCCESS!');
  console.log('File size:', buffer.length, 'bytes');
  console.log('Generation time:', elapsed, 'ms');
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
