# Moonview v2 — Architecture & Environment Audit

## 1. Existing Moonview Architecture
- **Current State**: The `c:\Dev\moon_view_updated` directory is entirely empty.
- **Assessment**: There is no legacy code present in the workspace. This will be a greenfield implementation based entirely on a fresh fork of Jellyfin Web.

## 2. Existing Code That Should Be Retained
- **None**: As the directory is empty, there is no legacy code to retain.

## 3. Components Jellyfin Will Replace
Since we are starting from scratch, Jellyfin will natively provide the foundational components:
- User authentication and session management
- Media library scanning and metadata fetching
- Playback progression, resume state, and watch history
- Subtitles and multiple audio track selection
- Media transcoding and direct stream capabilities
- Administrative dashboards

## 4. Jellyfin Integration Strategy
- **Core Engine**: A stock Jellyfin server container will run unmodified as the media backend.
- **Frontend Layer**: We will create a specialized Moonview UI by forking the `jellyfin-web` repository.
- **API Communication**: The Moonview frontend will interface with the Jellyfin server via Jellyfin's official REST API and WebSocket connections.

## 5. Repository/Fork Strategy
- **Structure**: We will initialize a monorepo or standard folder structure containing `moonview-web`, `infrastructure`, and `scripts`.
- **Git Strategy**: We will clone `jellyfin-web`, add it as an `upstream` remote, and apply Moonview's custom branding, design system, and UX redesign on a new branch. This enables clean rebasing when Jellyfin releases security and feature updates.

## 6. ARM64 Compatibility Assessment
- **Jellyfin Server**: Officially supports `linux/arm64` via Docker.
- **Nginx**: Officially supports `linux/arm64` via Docker.
- **Node.js/NPM (Build environment)**: Officially supports ARM64.
- **Conclusion**: The entire stack is compatible with Oracle Cloud's Ampere ARM64 instances. We must ensure Docker compose files do not hardcode x86_64 images.

## 7. Docker Strategy
- **Local Dev**: Use Docker Compose to spin up `moonview-web` (served via dev server or Nginx) alongside a `jellyfin-server` container for testing.
- **Production**: A single `docker-compose.yml` defining `nginx` and `jellyfin` services. The custom Moonview frontend will be built as static assets and either mounted into Nginx or injected into a custom Jellyfin container.
- **Volumes**: Strict separation of `/config`, `/cache`, and `/media` directories to persistent host paths.

## 8. Oracle Cloud Resource Strategy
- **Constraints**: 2 OCPU, 12 GB RAM on the Free Tier ARM64 instance.
- **Optimization**: The JVM or heavy runtimes are avoided. Node.js is only used for building the static assets. Nginx and the .NET-based Jellyfin core will comfortably run within these limits, provided transcoding is strictly controlled.

## 9. Storage Strategy
- **Oracle Block Volume**: The OS and Jellyfin configuration will reside on the primary boot volume.
- **Media Expansion**: We must configure the server to mount object storage or an attached block volume for `/media`.
- **Transcode Cache**: Must be directed to a volume with a strict cleanup policy to avoid disk exhaustion on the Oracle free tier.

## 10. Transcoding Limitations
- **Hardware Acceleration**: Oracle Free Tier ARM64 lacks media GPUs (no QuickSync, NVENC, or VAAPI).
- **CPU Transcoding**: CPU-based transcoding will be heavily restricted. We will enforce a **Direct Play First** strategy.
- **Media Formats**: The system will strongly recommend H.264/AAC in MP4/MKV containers to ensure broad client compatibility and minimize transcode requests.

## 11. Security Risks
- **Local Findings**: The developer machine currently lacks Docker, meaning local testing cannot proceed securely or identically to production.
- **Production Risks**: Exposing Jellyfin directly to the internet is risky. It must sit behind Nginx and Cloudflare (if possible) with proper TLS termination and rate limiting.
- **Data Leaks**: API keys or server IPs must not be hardcoded in the frontend build.

## 12. Migration Strategy
- **N/A**: No previous data exists in the target directory to migrate. We will establish backup/restore scripts (`scripts/backup-moonview.sh`, `scripts/restore-moonview.sh`) to support future migrations.

## 13. Exact Implementation Phases
- **Phase 0**: Environment Audit (Completed).
- **Phase 1**: Jellyfin Foundation (Set up local Docker stack to prove media streaming works).
- **Phase 2**: Moonview Fork (Establish `jellyfin-web` fork and Git remotes).
- **Phase 3**: Brand Replacement (Remove Jellyfin logos, inject Moonview branding).
- **Phase 4**: Design System (Implement CSS variables, spacing, typography).
- **Phase 5**: Core UX Redesign (Home, Media detail, Search, Profile).
- **Phase 6**: Player Experience (Custom overlays, resume, subtitles).
- **Phase 7**: Production Infrastructure (Nginx, Docker Compose, scripts).
- **Phase 8-12**: Oracle Deployment, Cloudflare, Optimization, Security, Release.

## 14. Risks/Blockers
- **Critical Local Blocker**: The Windows local development environment is **missing Docker** (`docker` command not recognized). Docker Desktop for Windows must be installed before Phase 1 can begin, as Jellyfin relies heavily on containers for consistent behavior.
- **Performance Risk**: Relying purely on software transcoding on Oracle ARM64 may cause stream buffering if users upload HEVC/H.265 files but watch on incompatible devices.

## 15. Recommended First Implementation Step
1. **User Action Required**: Install Docker Desktop on the local Windows machine.
2. **Phase 1 (Jellyfin Foundation)**: Once Docker is verified, create the initial `docker-compose.yml` to spin up a stock Jellyfin server and prove the media engine functions locally before we begin writing frontend code.
