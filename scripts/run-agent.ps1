
# Autonomous Master Agent - Premium Intelligence v3
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

Write-Host "--- PREMIUM AGENT ONLINE ---"

while($true) {
    $nowMs = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    Write-Host "Cycle Start: $(Get-Date)"
    
    $queries = @(
        @{ q = 'upcoming web3 hackathons 2024 global'; type = 'hackathon' },
        @{ q = 'major blockchain crypto news events 2024'; type = 'news' }
    )

    foreach ($queryObj in $queries) {
        try {
            $searchBody = @{ q = $queryObj.q; num = 5 } | ConvertTo-Json
            $searchResp = Invoke-RestMethod -Uri 'https://google.serper.dev/search' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
            
            foreach ($res in $searchResp.organic) {
                Write-Host "Processing: $($res.title)..."
                
                # 1. Scrape full content
                $scraped = $res.snippet 
                try {
                    $jinaUrl = "https://r.jina.ai/" + $res.link
                    $scraped = (Invoke-WebRequest -Uri $jinaUrl -UseBasicParsing -TimeoutSec 15).Content
                } catch { }

                try {
                    if ($scraped.Length -gt 15000) { $scraped = $scraped.Substring(0, 15000) }
                    
                    $prompt = "Act as a premium Web3 journalist. 
                    SOURCE: $scraped
                    
                    Create a high-quality $($queryObj.type) entry.
                    Output ONLY valid JSON.
                    
                    REQUIREMENTS:
                    - title: Professional headline.
                    - content: (For news) 600-word humanized detailed article.
                    - description: (For hackathons) 400-word comprehensive guide.
                    - start_date (ms): Start timestamp.
                    - end_date (ms): End timestamp (MUST BE IN FUTURE).
                    - image_url: A high-resolution image URL. If not found, use a crypto-relevant Unsplash URL.
                    - registration_link: $($res.link)
                    "

                    $aiBody = @{ contents = @(@{ parts = @(@{ text = $prompt }) }) } | ConvertTo-Json -Depth 10
                    $url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=$googleAiKey"
                    $aiResp = Invoke-RestMethod -Uri $url -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody

                    if (!$aiResp) { continue }

                    $rawText = $aiResp.candidates[0].content.parts[0].text.Trim()
                    $rawJson = $rawText -replace '```json|```', ''
                    $extracted = $rawJson.Trim() | ConvertFrom-Json
                    
                    if ($extracted.end_date -and $extracted.end_date -lt $nowMs) { continue }

                    $tbl = if ($queryObj.type -eq 'hackathon') { "hackathons" } else { "news" }
                    $name = if ($extracted.name) { $extracted.name } else { $extracted.title }
                    $slug = (($name.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    
                    $dbData = @{ slug = $slug; is_published = $true; is_approved = $true; created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') }
                    $extracted.PSObject.Properties | ForEach-Object { $dbData[$_.Name] = $_.Value }
                    
                    # Ensure image_url is high quality
                    if (!$dbData['image_url']) { $dbData['image_url'] = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200" }
                    if ($tbl -eq "hackathons") { $dbData['title'] = $name; $dbData['registration_link'] = $res.link }
                    if ($tbl -eq "news") { $dbData['author'] = "Global AI Analyst" }

                    Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                    Log-To-DB "Published Premium Content: $name" "publish" "success"

                } catch { }
            }
        } catch { }
    }
    Write-Host "Cycle Complete. Resting 20m..."
    Start-Sleep -Seconds 1200
}
