#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/moonview/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="moonview-backup-$TIMESTAMP.tar.gz"
ARCHIVE_PATH="$BACKUP_DIR/$ARCHIVE_NAME"
COMPOSE_DIR="/opt/moonview/deploy"

echo "Starting Moonview Backup: $ARCHIVE_NAME"
echo "Backup Start Time: $(date)"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Stopping Jellyfin for database consistency..."
STOP_START=$(date +%s)
cd "$COMPOSE_DIR" && docker compose stop jellyfin
STOP_END=$(date +%s)
echo "Jellyfin stopped (took $((STOP_END - STOP_START)) seconds)."

# Use a trap to ensure Jellyfin starts even if the backup command fails
trap 'echo "Restarting Jellyfin in trap handler..."; cd "$COMPOSE_DIR" && docker compose start jellyfin; echo "Restart result: $?"; exit' ERR

cd /opt/moonview
echo "Archiving config and deployment files..."
tar -czf "$ARCHIVE_PATH" \
    --exclude='jellyfin/cache' \
    --exclude='jellyfin/transcodes' \
    jellyfin/config \
    deploy

echo "Archive generation finished."

echo "Starting Jellyfin..."
cd "$COMPOSE_DIR" && docker compose start jellyfin
echo "Restart result: 0"

# Remove the error trap since we restarted normally
trap - ERR

if [ -f "$ARCHIVE_PATH" ] && [ -s "$ARCHIVE_PATH" ]; then
    echo "Backup successfully created at $ARCHIVE_PATH (Size: $(du -sh "$ARCHIVE_PATH" | cut -f1))"
else
    echo "Error: Backup archive was not created or is empty."
    exit 1
fi

echo "Backup End Time: $(date)"

# Retention (Keep last 14 Moonview backups to simulate ~2 weeks of daily)
echo "Pruning old backups (keeping latest 14)..."
ls -tp "$BACKUP_DIR"/moonview-backup-*.tar.gz 2>/dev/null | grep -v '/$' | tail -n +15 | xargs -I {} rm -- {} 2>/dev/null || true

# Strict permissions on backup files
chmod 600 "$BACKUP_DIR"/moonview-backup-*.tar.gz 2>/dev/null || true

echo "Backup complete."
