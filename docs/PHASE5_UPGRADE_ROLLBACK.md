# Moonview Phase 5 Upgrade & Rollback Workflow

This document dictates the procedure for upgrading both Jellyfin and Moonview Web, alongside rollback plans for failure recovery.

## Upgrade Strategy

### Jellyfin Core
The Jellyfin Docker image version is strictly pinned (currently `10.11.11`). Unattended automatic upgrades (e.g., using `latest`) are forbidden.
**Workflow:**
1.  Review Jellyfin release notes for breaking changes.
2.  Update the version locally and verify Moonview Web API compatibility.
3.  Execute a full manual backup on the production server (`scripts/backup.sh`).
4.  Update the `docker-compose.prod.yml` image tag.
5.  Run `docker compose pull && docker compose up -d` to restart the container with the new version.
6.  Execute the Production QA Matrix.

### Moonview Web
Moonview Web tracks a pinned upstream branch/tag. Upgrading the UI involves pulling upstream changes, resolving merge conflicts with Moonview overrides, and producing a new static build.
**Workflow:**
1.  Rebase/Merge upstream changes locally.
2.  Run `npm run build:production`.
3.  Deploy the built static bundle to the production server.
4.  The `deploy-web.sh` script will place the new build into `/opt/moonview/web/releases/<timestamp>` and switch the `current` symlink.
5.  Execute the Production QA Matrix.

## Rollback Strategy

Before any upgrade, backups and old states are preserved.

### Moonview Web Rollback
If a Web deployment fails QA:
1.  Run the rollback script (e.g. `scripts/rollback-web.sh`) to instantly redirect the `current` symlink back to the previous release folder in `/opt/moonview/web/releases/`.
2.  Hard refresh the browser to verify.

### Jellyfin Core Rollback
If a Jellyfin Server upgrade causes failure:
1.  Identify the exact failure (Database migration error vs. API change).
2.  Stop the stack: `docker compose down`.
3.  Restore the `/config` backup taken immediately prior to the upgrade (to revert any DB schema migrations).
4.  Revert the `docker-compose.prod.yml` tag back to the known-stable version.
5.  Restart the stack: `docker compose up -d`.
