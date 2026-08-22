# Local Development Guide

## Prerequisites
- **Docker Desktop** installed and running on Windows.
- **Node.js** (v22 LTS) for building the custom web client.
- **PowerShell** for executing local helper scripts.

## Project Structure
- `infrastructure/docker/docker-compose.yml`: Main container definitions.
- `runtime/`: Persistent Jellyfin data (`/config`, `/cache`, `/transcodes`). Do not commit to source control.
- `media-dev/`: Local media for testing. Contains `movies/` and `series/`.

## Running the Development Environment (Phase 2.5+)
To start the Jellyfin backend locally, which also natively serves our custom Moonview Web client via Docker volumes:
```powershell
.\scripts\start-dev.ps1
```
This script will ensure Docker is running, check that `moonview-web/dist` exists, bring up the Docker Compose stack, and wait until the server is ready before printing the URL.

## Stopping the Server
```powershell
.\scripts\stop-local.ps1
```
This will safely stop the containers without destroying the persistent `runtime/` volumes.

## URLs & Access
- Moonview Web (Local Dev): `http://localhost:8096`

## Logs & Diagnostics
To view server logs in real-time:
```powershell
.\scripts\logs.ps1
```
To run a health check against the local environment:
```powershell
.\scripts\health.ps1
```

## First Time Setup
1. Run `.\scripts\start-local.ps1`.
2. Open `http://localhost:8096`.
3. Complete the manual setup wizard (Create an admin account, add libraries for Movies and Series pointing to `/media/movies` and `/media/series`).
4. Wait for the initial media scan to complete.
