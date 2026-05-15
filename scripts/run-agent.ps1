
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4OTM2NCwiZXhwIjoyMDk0MjY1MzY0fQ.PYPJCngMS_p3pJNoLYqUCqoVg3Wmdtjif2-EKQXQDns"
$apiUrl = "https://yjgjfurrvyvhncjxqcre.supabase.co/functions/v1/autonomous-master-agent"

Write-Host "Starting Autonomous Super Agent background loop..."

while($true) {
    try {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] Triggering Agent Cycle..."
        
        $headers = @{ "Authorization" = "Bearer $serviceRoleKey" }
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers
        
        $msg = $response.message
        $scanned = $response.scanned
        $published = $response.published
        
        Write-Host "[$timestamp] Cycle Result: $msg | Scanned: $scanned | Published: $published"
    } catch {
        Write-Error "[$timestamp] Agent cycle failed: $_"
    }
    
    # Wait for 5 minutes before next cycle
    Write-Host "Waiting 5 minutes for next cycle..."
    Start-Sleep -Seconds 300
}
