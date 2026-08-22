#!/bin/bash
set -euo pipefail

# Moonview Web Atomic Deployment Script
# Usage: ./deploy-web.sh /path/to/new/dist

if [ -z "${1:-}" ]; then
    echo "Usage: $0 /path/to/new/dist"
    exit 1
fi

NEW_DIST="$1"
WEB_ROOT="/opt/moonview/web"
RELEASES_DIR="$WEB_ROOT/releases"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_PATH="$RELEASES_DIR/$TIMESTAMP"
CURRENT_LINK="$WEB_ROOT/current"

# 1. Validate source artifact
if [ ! -f "$NEW_DIST/index.html" ]; then
    echo "Error: $NEW_DIST does not contain a valid Moonview build (missing index.html)."
    exit 1
fi

# 2. Create release directory and copy
mkdir -p "$RELEASES_DIR"
echo "Deploying release to $RELEASE_PATH..."
cp -a "$NEW_DIST" "$RELEASE_PATH"

# 3. Atomically update current symlink
ln -sfn "$RELEASE_PATH" "$CURRENT_LINK"
echo "Updated current symlink to point to $TIMESTAMP."

# 4. Restart Jellyfin to ensure cache invalidation of the root path
# Since Jellyfin caches its web directory resolution, we must restart it.
echo "Restarting Jellyfin container..."
cd /opt/moonview/deploy
docker compose restart jellyfin

# 5. Health Check
echo "Running health check..."
if ./scripts/health.sh; then
    echo "Deployment successful."
else
    echo "Health check failed after deployment! You may need to run ./scripts/rollback.sh."
    exit 1
fi
