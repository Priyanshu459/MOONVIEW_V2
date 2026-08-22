#!/bin/bash
set -euo pipefail
cd /opt/moonview/deploy
docker compose -f docker-compose.prod.yml restart
./scripts/health.sh
