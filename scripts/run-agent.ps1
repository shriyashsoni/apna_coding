
# Autonomous Master Agent - Social Broadcasting v9.3
# SMARTER VERSION - ANTI-BOT DETECTION - IMPROVED FILTERING
$supabaseUrl = 'https://yjgjfurrvyvhncjxqcre.supabase.co'
$serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4OTM2NCwiZXhwIjoyMDk0MjY1MzY0fQ.PYPJCngMS_p3pJNoLYqUCqoVg3Wmdtjif2-EKQXQDns'
$googleAiKey = 'AIzaSyAOH0U-UXTpXynDzv4ihsc-2GkCsHMlN8w'
$searchApiKey = '6d439c2291cab92cd77ef2dd0f3ebfa36ed2cbad'

$telegramToken = '8959520809:AAH-3P59fMDvzkyVLb6jH-Ebsd5JZ88_Eak'
$telegramChatId = '@ApnaCoding_Updates' 

$headers = @{ 'Authorization' = "Bearer $serviceRoleKey"; 'apikey' = $serviceRoleKey; 'Content-Type' = 'application/json' }

function Log-To-DB ($msg, $type, $status) {
    try {
        $body = @{ action_type = $type; message = $msg; status = $status; timestamp = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds()) } | ConvertTo-Json -Depth 10
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/autonomous_agent_logs" -Method Post -Headers $headers -Body $body
    } catch { }
}

function Get-Image-For-Event ($query) {
    try {
        Start-Sleep -Seconds 2
        $searchBody = @{ q = $query; num = 1 } | ConvertTo-Json
        $resp = Invoke-RestMethod -Uri 'https://google.serper.dev/images' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
        if ($resp.images.Count -gt 0) {
            return $resp.images[0].imageUrl
        }
    } catch { }
    return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200"
}

function Broadcast-Social ($title, $type, $link) {
    try {
        $msg = "NEW WEB3 OPPORTUNITY (2026)`n`nTYPE: " + $type.ToUpper() + "`nTITLE: $title`n`nLINK: $link"
        $tgUrl = "https://api.telegram.org/bot$telegramToken/sendMessage"
        $tgBody = @{ chat_id = $telegramChatId; text = $msg } | ConvertTo-Json
        Invoke-RestMethod -Uri $tgUrl -Method Post -Headers @{"Content-Type"="application/json"} -Body $tgBody
    } catch { }
}

Write-Host "--- AGENT v9.3: 2026 SMART DISCOVERY ACTIVE ---"

while($true) {
    $nowMs = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    Write-Host "Cycle Start: $(Get-Date)"
    
    $queries = @(
        @{ q = 'new web3 hackathons 2026'; type = 'hackathon' },
        @{ q = 'upcoming crypto conferences June 2026'; type = 'event' },
        @{ q = 'blockchain events 2026 calendar'; type = 'event' }
    )

    foreach ($queryObj in $queries) {
        try {
            $searchBody = @{ q = $queryObj.q; num = 10 } | ConvertTo-Json
            $searchResp = Invoke-RestMethod -Uri 'https://google.serper.dev/search' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
            
            foreach ($res in $searchResp.organic) {
                # Bot detection / Noise filter
                if ($res.title -like "*Checking your browser*" -or $res.title -like "*Just a moment*" -or $res.title -like "*Access Denied*" -or $res.title -like "*403 Forbidden*") { continue }
                if ($res.title -like "*2024*" -or $res.title -like "*2025*") { continue } 
                
                Write-Host "Analyzing: $($res.title)..."
                
                $scraped = $res.snippet 
                try {
                    $jinaUrl = "https://r.jina.ai/" + $res.link
                    $scrapedContent = (Invoke-WebRequest -Uri $jinaUrl -UseBasicParsing -TimeoutSec 15).Content
                    if ($scrapedContent -like "*Checking your browser*" -or $scrapedContent -like "*Cloudflare*") {
                        Write-Host "SKIPPING: Bot detection triggered for $($res.link)"
                        continue
                    }
                    if ($scrapedContent.Length -gt 10000) { $scrapedContent = $scrapedContent.Substring(0, 10000) }
                    $scraped = $scrapedContent
                } catch { }

                try {
                    Start-Sleep -Seconds 3 # Stronger rate limit protection
                    $cleanScraped = $scraped -replace '[^\x20-\x7E]', '' # Remove non-ASCII
                    $prompt = "Return JSON ONLY for this 2026 event. Keys: is_hackathon (bool), title, description, start_date_ms, end_date_ms, is_expired (bool), image_url, search_keyword. Content: $cleanScraped"

                    $aiPayload = @{ contents = @(@{ parts = @(@{ text = $prompt }) }) }
                    $aiBody = $aiPayload | ConvertTo-Json -Depth 20 -Compress
                    $aiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$googleAiKey"
                    $aiResp = Invoke-RestMethod -Uri $aiUrl -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody

                    $rawText = $aiResp.candidates[0].content.parts[0].text -replace '```json|```', ''
                    $extracted = $rawText.Trim() | ConvertFrom-Json
                    
                    if ($extracted.is_expired -or ($extracted.end_date_ms -and $extracted.end_date_ms -lt $nowMs)) { continue }
                    if ($extracted.title -like "*Checking your browser*" -or $extracted.description -like "*Cloudflare*") { continue }

                    $imageUrl = $extracted.image_url
                    if (!$imageUrl -or $imageUrl -like "*placeholder*" -or $imageUrl -eq "...") {
                        $imageUrl = Get-Image-For-Event ($extracted.title + " 2026 event official")
                    }

                    $tbl = if ($extracted.is_hackathon) { "hackathons" } else { "events" }
                    $slug = (($extracted.title.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    
                    # Duplicate check by title
                    $check = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/${tbl}?title=eq.$($extracted.title -replace "'","''")&select=id" -Method Get -Headers $headers
                    if ($check.Count -eq 0) {
                        $dbData = @{
                            slug = $slug; title = $extracted.title; description = $extracted.description;
                            image_url = $imageUrl;
                            registration_link = $res.link; is_published = $true; is_approved = $true; created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ');
                        }

                        if ($tbl -eq "hackathons") {
                            $dbData['name'] = $extracted.title; $dbData['start_date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}; $dbData['end_date'] = if($extracted.end_date_ms){$extracted.end_date_ms}else{$nowMs + 604800000}
                        } else {
                            $dbData['date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}
                        }

                        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                        Write-Host "PUBLISHED: $($extracted.title) | Image: $imageUrl"
                        Log-To-DB "Published: $($extracted.title)" "publish" "success"
                        Broadcast-Social $extracted.title $tbl "https://apnacoding.com/$tbl/$slug"
                    }
                } catch { }
            }
        } catch { }
    }
    Write-Host "Cycle Complete. Resting 30m..."
    if ($env:CI_MODE -eq "true") { break }
    Start-Sleep -Seconds 1800
}
