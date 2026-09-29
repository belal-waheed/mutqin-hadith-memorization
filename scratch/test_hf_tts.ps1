# Test Hugging Face free inference API (no auth token)
$text = 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى'

# Try facebook/mms-tts-ara
$body = @{ inputs = $text } | ConvertTo-Json -Compress
$url = "https://api-inference.huggingface.co/models/facebook/mms-tts-ara"

Write-Host "Testing Hugging Face mms-tts-ara (no auth)..."
try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType 'application/json' -OutFile 'scratch/test_hf.wav' -PassThru
    Write-Host "Status: $($response.StatusCode)"
    $fi = Get-Item 'scratch/test_hf.wav'
    Write-Host "File size: $($fi.Length) bytes"
    Write-Host "Content-Type: $($response.Headers['Content-Type'])"
} catch {
    Write-Host "Error (no auth): $($_.Exception.Message)"
    # Try reading the response body for error details
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response body: $errorBody"
    } catch {}
}

# Try with HF token if available
$hfToken = $env:HF_TOKEN
if ($hfToken) {
    Write-Host ""
    Write-Host "Testing with HF_TOKEN..."
    try {
        $headers = @{ Authorization = "Bearer $hfToken" }
        $response2 = Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType 'application/json' -Headers $headers -OutFile 'scratch/test_hf_auth.wav' -PassThru
        Write-Host "Status: $($response2.StatusCode)"
        $fi2 = Get-Item 'scratch/test_hf_auth.wav'
        Write-Host "File size: $($fi2.Length) bytes"
    } catch {
        Write-Host "Error (with auth): $($_.Exception.Message)"
    }
} else {
    Write-Host ""
    Write-Host "No HF_TOKEN env var found, skipping authenticated test"
}
