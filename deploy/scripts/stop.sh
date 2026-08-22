#!/bin/bash
set -euo pipefail
cd /opt/moonview/deploy
docker compose -f docker-compose.prod.yml down
