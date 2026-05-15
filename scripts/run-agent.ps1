
# Autonomous Master Agent - Persistent Background Task
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

Write-Host "--- AGENT STARTING (FINAL SCHEMA MAPPING) ---"
Log-To-DB "Master Agent Online - Production Mode" "info" "success"

while($true) {
    Write-Host "Cycle Start..."
    $queries = @(
        @{ q = 'upcoming web3 hackathons 2024'; type = 'hackathon' },
        @{ q = 'remote blockchain developer jobs'; type = 'job' },
        @{ q = 'latest crypto blockchain news'; type = 'news' },
        @{ q = 'web3 events india 2024'; type = 'event' }
    )

    foreach ($queryObj in $queries) {
        try {
            $searchBody = @{ q = $queryObj.q; num = 5 } | ConvertTo-Json
            $searchResp = Invoke-RestMethod -Uri 'https://google.serper.dev/search' -Method Post -Headers @{'X-API-KEY' = $searchApiKey; 'Content-Type' = 'application/json'} -Body $searchBody
            
            foreach ($res in $searchResp.organic) {
                Write-Host "Analyzing: $($res.title)"
                $dbData = @{
                    slug = (($res.title.ToLower() -replace '[^a-z0-9]+', '-') + "-" + ([DateTimeOffset]::Now.ToUnixTimeSeconds()))
                    is_published = $true
                    is_approved = $true
                    is_featured = $false
                    created_at = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
                }

                if ($queryObj.type -eq 'hackathon') {
                    $dbData['name'] = $res.title
                    $dbData['title'] = $res.title
                    $dbData['description'] = $res.snippet
                    $dbData['registration_link'] = $res.link
                    $dbData['start_date'] = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
                    $dbData['end_date'] = (Get-Date).AddDays(30).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
                    $dbData['location'] = "Online/Global"
                    $tbl = "hackathons"
                } elseif ($queryObj.type -eq 'job') {
                    $dbData['title'] = $res.title
                    $dbData['company'] = "Web3 Ecosystem"
                    $dbData['description'] = $res.snippet
                    $dbData['link'] = $res.link
                    $dbData['location'] = "Remote"
                    $dbData['type'] = "full-time"
                    $tbl = "jobs"
                } elseif ($queryObj.type -eq 'event') {
                    $dbData['title'] = $res.title
                    $dbData['description'] = $res.snippet
                    $dbData['registration_link'] = $res.link
                    $dbData['date'] = (Get-Date).AddDays(14).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
                    $dbData['location'] = "India/Global"
                    $tbl = "events"
                } else {
                    $dbData['title'] = $res.title
                    $dbData['content'] = $res.snippet + " (Source: " + $res.link + ")"
                    $dbData['excerpt'] = $res.snippet
                    $dbData['category'] = "industry"
                    $tbl = "news"
                }
                
                $checkUrl = "$supabaseUrl/rest/v1/${tbl}?slug=eq.$($dbData.slug)&select=id"
                $existing = Invoke-RestMethod -Uri $checkUrl -Method Get -Headers $headers
                
                if ($null -eq $existing -or $existing.Count -eq 0) {
                    Write-Host "Publishing to ${tbl}: $($res.title)"
                    try {
                        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tbl" -Method Post -Headers $headers -Body ($dbData | ConvertTo-Json -Depth 10)
                        Log-To-DB "Auto-Published: $($res.title)" "publish" "success"
                    } catch { Write-Host "DB Insert Failed for ${tbl}" }
                }
            }
        } catch { Write-Host "Search Error" }
    }
    Write-Host "Cycle Complete. Sleeping 15m..."
    Start-Sleep -Seconds 900
}
