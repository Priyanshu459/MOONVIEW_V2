#!/bin/bash
set -euo pipefail

echo "Moonview Production Health Check"
echo "--------------------------------"

# 1. Docker check
echo -n "Docker Engine: "
if docker info > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL"
    exit 1
fi

# 2. Jellyfin Container Check
echo -n "Jellyfin Container: "
STATUS=$(docker compose -f /opt/moonview/deploy/docker-compose.prod.yml ps --format '{{.State}}' jellyfin 2>/dev/null || echo "")
if [[ "$STATUS" == *"running"* ]]; then
    echo "PASS"
else
    echo "FAIL (Status: $STATUS)"
    exit 1
fi

# 3. Jellyfin Port Responding
echo -n "Jellyfin HTTP (127.0.0.1:8096): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8096)
if [ "$HTTP_CODE" == "200" ]; then
    echo "PASS"
else
    echo "FAIL ($HTTP_CODE)"
    exit 1
fi

# 4. Nginx Check
echo -n "Nginx Service: "
if systemctl is-active --quiet nginx; then
    echo "PASS"
else
    echo "FAIL (Not active)"
    exit 1
fi

# 5. Disk Check
echo -n "Host Disk Space (/opt): "
DISK_USE=$(df -h /opt | awk 'NR==2 {print $5}')
echo "PASS ($DISK_USE used)"
