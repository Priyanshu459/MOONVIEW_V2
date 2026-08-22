#!/bin/bash
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 /path/to/backup.tar.gz"
    echo "Restore is destructive. An explicit archive is required."
    exit 1
fi

ARCHIVE="$1"

if [ ! -f "$ARCHIVE" ]; then
    echo "Error: Archive $ARCHIVE not found."
    exit 1
fi

# Path traversal check
if tar -tf "$ARCHIVE" | grep -qE '^\.\./|^/'; then
    echo "Error: Archive contains absolute or parent directory paths. Aborting restore for safety."
    exit 1
fi

echo "Archive $ARCHIVE validated. Size: $(du -sh "$ARCHIVE" | cut -f1)"

echo "WARNING: This will overwrite current Jellyfin config and deployment files."
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo "1. Taking safety backup of current state..."
/opt/moonview/deploy/scripts/backup.sh || true

echo "2. Stopping services..."
cd /opt/moonview/deploy && docker compose stop jellyfin || true

echo "3. Extracting archive..."
cd /opt/moonview
tar -xzf "$ARCHIVE"

echo "4. Starting services..."
cd /opt/moonview/deploy && docker compose start jellyfin

echo "5. Running health check..."
if ./scripts/health.sh; then
    echo "Restore completed and health check passed."
else
    echo "WARNING: Health check failed after restore."
    echo "Your safety backup from before the restore is still available in /opt/moonview/backups/."
    exit 1
fi
