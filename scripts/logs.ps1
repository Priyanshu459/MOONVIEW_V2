$ComposeDir = Join-Path $PSScriptRoot "..\infrastructure\docker"

Set-Location $ComposeDir
docker compose logs -f
