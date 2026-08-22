#!/bin/bash
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 10.11.12"
    exit 1
fi

VERSION="$1"
COMPOSE_FILE="/opt/moonview/deploy/docker-compose.prod.yml"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be explicitly pinned (e.g., 10.11.12). 'latest' or wildcards are not allowed."
    exit 1
fi

CURRENT_VERSION=$(grep 'image: jellyfin/jellyfin:' "$COMPOSE_FILE" | awk -F':' '{print $3}')
echo "Updating Jellyfin from version: $CURRENT_VERSION to version: $VERSION"

echo "WARNING: A Jellyfin server downgrade may not be safe after database/schema migrations."
echo "If this upgrade fails, rolling back the image tag alone might not be enough."
echo "You may also need to restore the pre-upgrade config/database backup."

# 1. Backup current state
echo "Creating pre-update safety backup..."
/opt/moonview/deploy/scripts/backup.sh

# 2. Update Compose file
echo "Updating docker-compose.prod.yml to use tag $VERSION..."
sed -i "s|image: jellyfin/jellyfin:.*|image: jellyfin/jellyfin:$VERSION|g" "$COMPOSE_FILE"

# 3. Pull and recreate
echo "Pulling exact image and recreating container..."
cd /opt/moonview/deploy
docker compose pull jellyfin
docker compose up -d

# 4. Health Check
echo "Running health check..."
if ./scripts/health.sh; then
    echo "Update complete."
else
    echo "WARNING: Health check failed after update!"
fi
