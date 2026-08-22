$ComposeDir = Join-Path $PSScriptRoot "..\infrastructure\docker"

Write-Host "Stopping Jellyfin local stack safely..."
Set-Location $ComposeDir
docker compose down

Write-Host "Containers stopped. Persistent data in runtime/ remains safe."
