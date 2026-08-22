Write-Host "Moonview Local Health Check"
Write-Host "---------------------------"

# Docker Check
Write-Host -NoNewline "Docker Engine: "
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PASS" -ForegroundColor Green
    } else {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host $dockerInfo
    }
} catch {
    Write-Host "FAIL" -ForegroundColor Red
}

# Container Check
Write-Host -NoNewline "Jellyfin Container: "
$containerStatus = docker ps --filter "name=jellyfin" --format "{{.Status}}"
if ($containerStatus -match "^Up") {
    Write-Host "PASS ($containerStatus)" -ForegroundColor Green
} else {
    Write-Host "FAIL (Not running)" -ForegroundColor Red
}

# HTTP Check
Write-Host -NoNewline "Jellyfin HTTP (8096): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8096" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "PASS (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "WARN ($($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL ($($_.Exception.Message))" -ForegroundColor Red
}

# Host Resources
$ram = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
$freeRam = Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty FreePhysicalMemory
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"

Write-Host "---"
Write-Host "Host RAM: $([math]::Round($freeRam / 1MB, 2)) GB Free / $([math]::Round($ram.Sum / 1GB, 2)) GB Total"
Write-Host "Host Disk (C:): $([math]::Round($disk.FreeSpace / 1GB, 2)) GB Free"
