# Jellyfin Upstream Strategy

Moonview Web and Server maintain a clean, stable synchronization strategy with upstream Jellyfin releases.

## Version Pinning
Moonview v2 builds on specific, stable Jellyfin versions.
- **Current Jellyfin Server Baseline:** `v10.11.11`
- **Current Jellyfin Web Baseline:** `v10.11.11`

## Branching Strategy
Moonview's codebase forks from official tagged releases rather than tracking rolling main branches to ensure maximum stability.
1. The `moonview-web` repository is a Git clone of `jellyfin-web`.
2. The `upstream` remote is retained.
3. The `moonview/main` branch is cut from the pristine tag (e.g. `v10.11.11`).
4. Custom branding, UI tokens, and cinematic overrides are committed onto `moonview/main`.

## Maintenance
When upgrading to a new Jellyfin release:
1. Fetch `upstream`.
2. Rebase `moonview/main` onto the new stable tag.
3. Resolve any styling/customization conflicts.
4. Perform Moonview's regression testing suite.
