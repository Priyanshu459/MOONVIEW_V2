$ErrorActionPreference = "Stop"

Write-Host "Verifying Docker Engine..."
try {
    docker info > $null
} catch {
    Write-Error "Docker Engine is not running or not accessible. Please start Docker Desktop."
    exit 1
}

$ComposeDir = Join-Path $PSScriptRoot "..\infrastructure\docker"

Write-Host "Starting Jellyfin local stack..."
Set-Location $ComposeDir
docker compose up -d

Write-Host "`nJellyfin Server started successfully."
Write-Host "Local URL: http://localhost:8096"
