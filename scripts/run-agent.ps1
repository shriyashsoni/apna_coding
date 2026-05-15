
# Autonomous Master Agent - Social Broadcasting v8.1
$supabaseUrl = 'https://yjgjfurrvyvhncjxqcre.supabase.co'
$serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4OTM2NCwiZXhwIjoyMDk0MjY1MzY0fQ.PYPJCngMS_p3pJNoLYqUCqoVg3Wmdtjif2-EKQXQDns'
$googleAiKey = 'AIzaSyAOH0U-UXTpXynDzv4ihsc-2GkCsHMlN8w'
$searchApiKey = '6d439c2291cab92cd77ef2dd0f3ebfa36ed2cbad'

# Social Config
$telegramToken = '8959520809:AAH-3P59fMDvzkyVLb6jH-Ebsd5JZ88_Eak'
$telegramChatId = '@ApnaCoding_Updates' # Using the official channel name from legacy code

$headers = @{ 'Authorization' = "Bearer $serviceRoleKey"; 'apikey' = $serviceRoleKey; 'Content-Type' = 'application/json' }

function Log-To-DB ($msg, $type, $status) {
    try {
        $body = @{ action_type = $type; message = $msg; status = $status; timestamp = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds()) } | ConvertTo-Json -Depth 10
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/autonomous_agent_logs" -Method Post -Headers $headers -Body $body
    } catch { }
}

function Broadcast-Social ($title, $type, $link) {
    try {
        $msg = "🚀 *New Web3 Opportunity Identified!*\n\n"
        $msg += "📌 *Type:* " + $type.ToUpper() + "\n"
        $msg += "🔥 *Title:* $title\n\n"
        $msg += "🔗 [View on Platform]($link)"
        
        $tgUrl = "https://api.telegram.org/bot$telegramToken/sendMessage"
        $tgBody = @{ chat_id = $telegramChatId; text = $msg; parse_mode = "Markdown" } | ConvertTo-Json
        Invoke-RestMethod -Uri $tgUrl -Method Post -Headers @{"Content-Type"="application/json"} -Body $tgBody
        Write-Host "BROADCASTED TO TELEGRAM: $title"
    } catch { Write-Host "Telegram Broadcast Failed: $($_.Exception.Message)" }
}

Write-Host "--- AGENT v8.1: SOCIAL BROADCASTING ACTIVE ---"

while($true) {
    $now = [DateTimeOffset]::Now
    $nowMs = $now.ToUnixTimeMilliseconds()
    $todayStr = $now.ToString("MMMM dd, yyyy")
    
    Write-Host "Cycle Start: $(Get-Date)"
    
    $queries = @(
        @{ q = 'new web3 hackathons 2024 global'; type = 'hackathon' },
        @{ q = 'upcoming blockchain conferences 2024'; type = 'event' }
    )

    foreach ($queryObj in $queries) {
        try {
            $searchBody = @{ q = $queryObj.q; num = 5 } | ConvertTo-Json
            $searchResp = Invoke-RestMethod -Uri 'https://google.serper.dev/search' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
            
            foreach ($res in $searchResp.organic) {
                Write-Host "Analyzing: $($res.title)..."
                
                $scraped = $res.snippet 
                try {
                    $jinaUrl = "https://r.jina.ai/" + $res.link
                    $scrapedContent = (Invoke-WebRequest -Uri $jinaUrl -UseBasicParsing -TimeoutSec 15).Content
                    if ($scrapedContent.Length -gt 15000) { $scrapedContent = $scrapedContent.Substring(0, 15000) }
                    $scraped = $scrapedContent
                } catch { }

                try {
                    $prompt = "Analyze: $scraped. 
                    Decide if HACKATHON or EVENT. Return JSON:
                    {
                      'is_hackathon': true/false,
                      'title': '...',
                      'description': '...',
                      'start_date_ms': ...,
                      'end_date_ms': ...,
                      'is_expired': true/false
                    }"

                    $aiPayload = @{ contents = @(@{ parts = @(@{ text = $prompt }) }) }
                    $aiBody = $aiPayload | ConvertTo-Json -Depth 20 -Compress
                    $aiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$googleAiKey"
                    $aiResp = Invoke-RestMethod -Uri $aiUrl -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody

                    $rawText = $aiResp.candidates[0].content.parts[0].text -replace '```json|```', ''
                    $extracted = $rawText.Trim() | ConvertFrom-Json
                    
                    if ($extracted.is_expired -or ($extracted.end_date_ms -and $extracted.end_date_ms -lt $nowMs)) { continue }

                    $tbl = if ($extracted.is_hackathon) { "hackathons" } else { "events" }
                    $slug = (($extracted.title.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    
                    $dbData = @{
                        slug = $slug; title = $extracted.title; description = $extracted.description;
                        image_url = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";
                        registration_link = $res.link; is_published = $true; is_approved = $true; created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ');
                    }

                    if ($tbl -eq "hackathons") {
                        $dbData['name'] = $extracted.title; $dbData['start_date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}; $dbData['end_date'] = if($extracted.end_date_ms){$extracted.end_date_ms}else{$nowMs + 604800000}
                    } else {
                        $dbData['date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}
                    }

                    $check = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/${tbl}?slug=eq.$slug&select=id" -Method Get -Headers $headers
                    if ($check.Count -eq 0) {
                        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                        Write-Host "PUBLISHED: $($extracted.title)"
                        Log-To-DB "Published & Broadcasting: $($extracted.title)" "publish" "success"
                        
                        Broadcast-Social $extracted.title $tbl "https://apnacoding.com/$tbl/$slug"
                    }
                } catch { }
            }
        } catch { }
    }
    Write-Host "Cycle Complete. Resting 30m..."
    Start-Sleep -Seconds 1800
}
