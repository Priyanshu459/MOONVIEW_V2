# Moonview Phase 5 Backup & Recovery Strategy

This document details how Moonview configuration, database, and deployments are backed up and restored.

## Backup Scope
**What is backed up:**
*   Jellyfin Configuration (`/opt/moonview/config`)
*   Deployment configurations (`docker-compose.yml`, `.env`, `nginx/`)
*   Moonview Web UI static builds
*   Automated deployment scripts

**What is EXCLUDED (not backed up):**
*   Media Library (backed up independently due to massive size requirements)
*   Jellyfin Transcodes (`/opt/moonview/transcodes`)
*   Jellyfin Caches (`/opt/moonview/cache`)
*   Docker image layers

## Automated Backup Script
A backup script (`deploy/scripts/backup.sh`) will automatically run on a schedule (e.g., via cron) to:
1.  Target the designated backup scope.
2.  Package it into a compressed, timestamped archive (e.g. `moonview-backup-2026-08-22.tar.gz`).
3.  Preserve permissions inside the archive.
4.  Log success or failure natively.

## Retention Policy
Due to Oracle Free Tier storage constraints, the retention script will keep a rolling window:
*   7 Daily backups
*   4 Weekly backups
*   3 Monthly backups
Old backups will be pruned automatically to avoid exhausting disk space.

## Recovery Workflow
A step-by-step restore guide is detailed in `docs/RESTORE_GUIDE.md` (to be created), and generally follows:
1.  **Stop Services**: `docker compose down` and `sudo systemctl stop nginx`
2.  **Extract Archive**: Unpack the backup over the existing `/opt/moonview` config and deploy directories.
3.  **Restore Permissions**: Ensure the deployment user regains correct ownership.
4.  **Restart Services**: Bring up Docker and Nginx.
5.  **Validation**: Test UI, verify media scanning hasn't corrupted, and confirm user progress is intact.
