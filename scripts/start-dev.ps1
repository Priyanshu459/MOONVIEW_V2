$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = (Resolve-Path "$ScriptDir\..").Path
$DistDir = "$ProjectDir\moonview-web\dist"
$SrcDir = "$ProjectDir\moonview-web\src"

Write-Host "--- Moonview Development Environment Setup ---" -ForegroundColor Cyan

# 1. Verify Docker Engine availability
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker engine not running."
    }
    Write-Host "[v] Docker engine is running." -ForegroundColor Green
} catch {
    Write-Host "[x] Docker is not running or not installed. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Verify moonview-web/dist exists
if (-Not (Test-Path -Path $DistDir)) {
    Write-Host "[x] Moonview Web production build is missing. Cannot serve UI." -ForegroundColor Red
    Write-Host "    Please run the build process: npm run build:production in moonview-web." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[v] Moonview Web distribution found." -ForegroundColor Green
}

# 3. Build Freshness Warning
if ((Test-Path -Path $SrcDir) -and (Test-Path -Path $DistDir)) {
    $LatestSrc = (Get-ChildItem -Path $SrcDir -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
    $LatestDist = (Get-ChildItem -Path $DistDir -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime

    if ($LatestSrc -gt $LatestDist) {
        Write-Host "[!] Warning: Moonview Web source may be newer than the current dist build." -ForegroundColor Yellow
        Write-Host "    Run the production build before QA if you have unbuilt UI changes." -ForegroundColor Yellow
    }
}

# 4. Start Jellyfin through existing Compose stack
Write-Host "Starting Moonview Server (Jellyfin backend) via Docker Compose..." -ForegroundColor Cyan
Set-Location -Path "$ProjectDir\infrastructure\docker"
docker-compose up -d

# 5. Wait until Jellyfin HTTP is responsive
Write-Host "Waiting for Jellyfin to become responsive..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$isReady = $false

while ($attempt -lt $maxAttempts -and -Not $isReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8096/system/info/public" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $isReady = $true
        }
    } catch {
        # Suppress errors while waiting
    }
    if (-Not $isReady) {
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "  Waiting... ($attempt/$maxAttempts)"
    }
}

if (-Not $isReady) {
    Write-Host "[x] Jellyfin failed to become responsive within 60 seconds." -ForegroundColor Red
    exit 1
}

# 6. Print startup success
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Moonview Web is ready and running locally!" -ForegroundColor Green
Write-Host "URL: http://localhost:8096" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green
