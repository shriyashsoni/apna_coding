
# Autonomous Master Agent - Temporal Precision v7
$supabaseUrl = 'https://yjgjfurrvyvhncjxqcre.supabase.co'
$serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4OTM2NCwiZXhwIjoyMDk0MjY1MzY0fQ.PYPJCngMS_p3pJNoLYqUCqoVg3Wmdtjif2-EKQXQDns'
$googleAiKey = 'AIzaSyAOH0U-UXTpXynDzv4ihsc-2GkCsHMlN8w'
$searchApiKey = '6d439c2291cab92cd77ef2dd0f3ebfa36ed2cbad'

$headers = @{ 'Authorization' = "Bearer $serviceRoleKey"; 'apikey' = $serviceRoleKey; 'Content-Type' = 'application/json' }

function Log-To-DB ($msg, $type, $status) {
    try {
        $body = @{ action_type = $type; message = $msg; status = $status; timestamp = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds()) } | ConvertTo-Json -Depth 10
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/autonomous_agent_logs" -Method Post -Headers $headers -Body $body
    } catch { }
}

Write-Host "--- AGENT v7: TEMPORAL PRECISION ACTIVE ---"

while($true) {
    $now = [DateTimeOffset]::Now
    $nowMs = $now.ToUnixTimeMilliseconds()
    $todayStr = $now.ToString("MMMM dd, yyyy")
    
    Write-Host "Cycle Start: $(Get-Date) | Filtering for events AFTER $todayStr"
    
    $queries = @(
        @{ q = 'new upcoming web3 hackathons starting next month'; type = 'hackathon' },
        @{ q = 'web3 conferences events calendar 2024 2025'; type = 'event' },
        @{ q = 'upcoming crypto blockchain meetups global'; type = 'event' }
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
                    $scraped = (Invoke-WebRequest -Uri $jinaUrl -UseBasicParsing -TimeoutSec 15).Content
                    if ($scraped.Length -gt 15000) { $scraped = $scraped.Substring(0, 15000) }
                } catch { }

                try {
                    $prompt = "You are a Web3 Intelligence Agent. Today is $todayStr.
                    Analyze this data: $scraped. 
                    
                    TASK:
                    1. CLASSIFY: Is this a HACKATHON or an EVENT?
                    2. VALIDATE: If the event has ALREADY PASSED or is OLD (before $todayStr), you MUST set 'is_expired': true.
                    3. EXTRACT: JSON format only.
                    
                    JSON Schema:
                    {
                      'is_hackathon': true/false,
                      'title': '...',
                      'description': '...',
                      'content': 'Long-form detailed article...',
                      'image_url': '...',
                      'start_date_ms': timestamp_ms,
                      'end_date_ms': timestamp_ms,
                      'location': '...',
                      'is_expired': true/false
                    }"

                    $aiPayload = @{ contents = @(@{ parts = @(@{ text = $prompt }) }) }
                    $aiBody = $aiPayload | ConvertTo-Json -Depth 20 -Compress
                    
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$googleAiKey"
                    $aiResp = Invoke-RestMethod -Uri $url -Method Post -Headers @{'Content-Type' = 'application/json'} -Body $aiBody

                    $rawText = $aiResp.candidates[0].content.parts[0].text -replace '```json|```', ''
                    $extracted = $rawText.Trim() | ConvertFrom-Json
                    
                    # DOUBLE CHECK TEMPORAL VALIDITY IN SCRIPT
                    $eventEnd = if($extracted.end_date_ms){$extracted.end_date_ms}else{$extracted.start_date_ms}
                    if ($extracted.is_expired -or ($eventEnd -and $eventEnd -lt $nowMs)) {
                        Write-Host "REJECTED: Expired or Old Content ($($extracted.title))"
                        continue
                    }

                    $tbl = if ($extracted.is_hackathon) { "hackathons" } else { "events" }
                    $slug = (($extracted.title.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    
                    $dbData = @{
                        slug = $slug
                        title = $extracted.title
                        description = $extracted.description
                        image_url = if ($extracted.image_url -and $extracted.image_url -like 'http*') { $extracted.image_url } else { "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200" }
                        registration_link = $res.link
                        is_published = $true
                        is_approved = $true
                        is_ai_generated = $true
                        created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
                        location = if($extracted.location){$extracted.location}else{"Global/Online"}
                    }

                    if ($tbl -eq "hackathons") {
                        $dbData['name'] = $extracted.title
                        $dbData['start_date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}
                        $dbData['end_date'] = if($extracted.end_date_ms){$extracted.end_date_ms}else{$nowMs + 604800000}
                    } else {
                        $dbData['date'] = if($extracted.start_date_ms){$extracted.start_date_ms}else{$nowMs}
                        $dbData['type'] = "Upcoming Event"
                    }

                    $check = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/${tbl}?slug=eq.$slug&select=id" -Method Get -Headers $headers
                    if ($check.Count -eq 0) {
                        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                        Write-Host "PUBLISHED (FRESH): $($extracted.title)"
                        Log-To-DB "Fresh Content Published (${tbl}): $($extracted.title)" "publish" "success"
                    }
                } catch { Write-Host "Processing Error" }
            }
        } catch { }
    }
    Write-Host "Cycle Complete. Resting 30m..."
    Start-Sleep -Seconds 1800
}
