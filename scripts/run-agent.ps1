
# Autonomous Master Agent - Premium & Upcoming Only
$supabaseUrl = 'https://yjgjfurrvyvhncjxqcre.supabase.co'
$serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4OTM2NCwiZXhwIjoyMDk0MjY1MzY0fQ.PYPJCngMS_p3pJNoLYqUCqoVg3Wmdtjif2-EKQXQDns'
$googleAiKey = 'AIzaSyAOH0U-UXTpXynDzv4ihsc-2GkCsHMlN8w'
$searchApiKey = '6d439c2291cab92cd77ef2dd0f3ebfa36ed2cbad'

$headers = @{ 'Authorization' = "Bearer $serviceRoleKey"; 'apikey' = $serviceRoleKey; 'Content-Type' = 'application/json' }

function Log-To-DB ($msg, $type, $status) {
    try {
        $body = @{ action_type = $type; message = $msg; status = $status; timestamp = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds()) } | ConvertTo-Json -Depth 10
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/autonomous_agent_logs" -Method Post -Headers $headers -Body $body
    } catch { Write-Host "Log failed" }
}

Write-Host "--- PREMIUM AGENT STARTING (UPCOMING WEB3 ONLY) ---"
Log-To-DB "Agent Mode: Upcoming Web3 Discovery Activated" "info" "success"

while($true) {
    $nowMs = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    Write-Host "Cycle Start: $(Get-Date)"
    
    $queries = @(
        @{ q = 'upcoming web3 hackathons 2024 2025 registration open'; type = 'hackathon' },
        @{ q = 'latest blockchain events global 2024'; type = 'event' },
        @{ q = 'breaking web3 news technology trends'; type = 'news' }
    )

    foreach ($queryObj in $queries) {
        try {
            $searchBody = @{ q = $queryObj.q; num = 5 } | ConvertTo-Json
            $searchResp = Invoke-RestMethod -Uri 'https://google.serper.dev/search' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
            
            foreach ($res in $searchResp.organic) {
                Write-Host "Discovered: $($res.title). Analyzing..."
                
                # 1. SCRAPE
                $scraped = $res.snippet 
                try {
                    $jinaUrl = "https://r.jina.ai/" + $res.link
                    $scraped = (Invoke-WebRequest -Uri $jinaUrl -UseBasicParsing -TimeoutSec 15).Content
                } catch { Write-Host "Scrape error" }

                try {
                    if ($scraped.Length -gt 15000) { $scraped = $scraped.Substring(0, 15000) }
                    
                    $prompt = "Act as a specialized Web3 Data Analyst. 
                    SOURCE: $scraped
                    
                    TASK: Create a PREMIUM $($queryObj.type) entry. 
                    CRITICAL: If the event/hackathon is ALREADY FINISHED or EXPIRED, return 'EXPIRED'.
                    ONLY focus on Blockchain, Crypto, and Web3 content.
                    
                    Output ONLY valid JSON or 'EXPIRED'.
                    
                    JSON Fields:
                    - title: Professional headline.
                    - content: (For news) 500-word humanized detailed article.
                    - description: (For events/hackathons) 300-word detailed guide.
                    - start_date (ms): Start timestamp.
                    - end_date (ms): End timestamp. MUST BE IN THE FUTURE.
                    - image_url: High-quality relevant image URL.
                    - registration_link: $($res.link)"

                    $aiBody = @{ contents = @(@{ parts = @(@{ text = $prompt }) }) } | ConvertTo-Json -Depth 10
                    
                    $aiResp = $null
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$googleAiKey"
                    try {
                        $aiResp = Invoke-RestMethod -Uri $url -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody
                    } catch { 
                        $urlV1 = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=$googleAiKey"
                        try { $aiResp = Invoke-RestMethod -Uri $urlV1 -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody } catch {}
                    }

                    if (!$aiResp) { continue }

                    $rawText = $aiResp.candidates[0].content.parts[0].text.Trim()
                    if ($rawText -eq "EXPIRED") { 
                        Write-Host "Skipping: Event is expired."
                        continue 
                    }

                    $rawJson = $rawText -replace '```json|```', ''
                    $extracted = $rawJson.Trim() | ConvertFrom-Json
                    
                    # Double check date in script
                    if ($extracted.end_date -and $extracted.end_date -lt $nowMs) {
                        Write-Host "Skipping: End date $($extracted.end_date) is in the past."
                        continue
                    }

                    $tbl = if ($queryObj.type -eq 'hackathon') { "hackathons" } elseif ($queryObj.type -eq 'event') { "events" } else { "news" }
                    $name = if ($extracted.name) { $extracted.name } else { $extracted.title }
                    $slug = (($name.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    
                    $dbData = @{ slug = $slug; is_published = $true; is_approved = $true; created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') }
                    $extracted.PSObject.Properties | ForEach-Object { $dbData[$_.Name] = $_.Value }
                    
                    if ($tbl -eq "news") { $dbData['author'] = "Web3 Intelligence Agent" }
                    if (!$dbData['registration_link']) { $dbData['registration_link'] = $res.link }

                    Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                    Write-Host "PUBLISHED PREMIUM: $name to $tbl"
                    Log-To-DB "Published Upcoming Web3 Content: $name" "publish" "success"

                } catch { Write-Host "AI/Processing Error" }
            }
        } catch { Write-Host "Search Error" }
    }
    Write-Host "Cycle Complete. Resting 30m..."
    Start-Sleep -Seconds 1800
}
