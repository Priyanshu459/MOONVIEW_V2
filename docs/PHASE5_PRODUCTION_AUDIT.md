# Moonview Phase 5 Production Audit

This document details the local environment audit required before moving to Oracle Cloud production deployment.

## Current Local Versions

| Component | Version |
|---|---|
| Jellyfin Docker Image | `jellyfin/jellyfin:10.11.11` (Pinned) |
| jellyfin-web | `10.11.11` (Pinned) |
| Node.js | `v22.14.0` (Node 22 LTS) |
| npm | `10.9.2` |
| Docker Engine | `29.7.2` |
| Docker Compose | `v5.4.0` |
| FFmpeg | Bundled with Jellyfin image (`jellyfin-ffmpeg`) |

## Directory Paths & Mounts

The local `docker-compose.yml` mounts the following paths:

*   **Persistent Config**: `../../runtime/jellyfin-config` -> `/config`
*   **Cache**: `../../runtime/jellyfin-cache` -> `/cache`
*   **Transcodes**: `../../runtime/jellyfin-transcodes` -> `/config/transcodes`
*   **Media**: `../../media-dev/movies` -> `/media/movies` and `../../media-dev/series` -> `/media/series`
*   **Custom Web UI**: `../../moonview-web/dist` -> `/moonview-web:ro` (Read-only mount)

## Environment Variables

*   `JELLYFIN_WEB_DIR=/moonview-web` : Overrides the default Jellyfin web UI with our custom Moonview build.

## Helper Scripts

The project includes PowerShell scripts for local development lifecycle, which will be translated to bash scripts (`.sh`) for the Oracle Cloud deployment:
*   `start-local.ps1`
*   `stop-local.ps1`
*   `health.ps1`
*   `logs.ps1`

## Security Considerations for Production Migration

*   Production environment variables (e.g., in `.env`) must not be committed to Git.
*   Production paths will shift from relative (e.g. `../../runtime`) to absolute structural mounts (e.g., `/opt/moonview/config`).
*   Scripts need to be migrated to POSIX-compliant bash.
