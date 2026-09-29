# Test with tashkeel text and longer hadith
$hadithText = 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ'
$encodedText = [System.Uri]::EscapeDataString($hadithText)
$url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=$encodedText"

Write-Host "Text length: $($hadithText.Length) chars"
Write-Host "URL length: $($url.Length) chars"
Write-Host "Requesting..."

try {
    $response = Invoke-WebRequest -Uri $url -OutFile 'scratch/test_hadith_tts.mp3' -PassThru -UserAgent 'Mozilla/5.0'
    Write-Host "Status: $($response.StatusCode)"
    $fi = Get-Item 'scratch/test_hadith_tts.mp3'
    Write-Host "File size: $($fi.Length) bytes"
    Write-Host "Content-Type: $($response.Headers['Content-Type'])"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)"
}

# Test 2: Very long text (200+ char limit test)
Write-Host ""
Write-Host "--- Test 2: Very long text ---"
$longText = 'حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ قَالَ حَدَّثَنَا سُفْيَانُ قَالَ حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الأَنْصَارِيُّ قَالَ أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ يَقُولُ سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ قَالَ سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى'
$encodedLong = [System.Uri]::EscapeDataString($longText)
$urlLong = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=$encodedLong"
Write-Host "Text length: $($longText.Length) chars"
Write-Host "URL length: $($urlLong.Length) chars"

try {
    $response2 = Invoke-WebRequest -Uri $urlLong -OutFile 'scratch/test_hadith_long.mp3' -PassThru -UserAgent 'Mozilla/5.0'
    Write-Host "Status: $($response2.StatusCode)"
    $fi2 = Get-Item 'scratch/test_hadith_long.mp3'
    Write-Host "File size: $($fi2.Length) bytes"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)"
}
