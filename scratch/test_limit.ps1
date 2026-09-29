# Find the exact character limit for Google Translate TTS
$baseUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q="

# Binary search for the limit
$testChars = @(100, 150, 180, 200, 220, 250, 300)
$sampleWord = 'بسم '  # 4 chars each

foreach ($targetLen in $testChars) {
    $repeatCount = [Math]::Ceiling($targetLen / $sampleWord.Length)
    $text = ($sampleWord * $repeatCount).Substring(0, [Math]::Min($targetLen, $sampleWord.Length * $repeatCount))
    $encoded = [System.Uri]::EscapeDataString($text)
    $url = "$baseUrl$encoded"
    
    try {
        $null = Invoke-WebRequest -Uri $url -OutFile 'scratch/limit_test.mp3' -UserAgent 'Mozilla/5.0' -ErrorAction Stop
        $size = (Get-Item 'scratch/limit_test.mp3').Length
        Write-Host "OK  - $($text.Length) chars, URL=$($url.Length) chars, MP3=$size bytes"
    } catch {
        Write-Host "FAIL - $($text.Length) chars, URL=$($url.Length) chars, Error=$($_.Exception.Response.StatusCode)"
    }
}
