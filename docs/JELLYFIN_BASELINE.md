# Jellyfin Baseline Configuration

This document records the exact version of the official Jellyfin Server being used as the foundation for Moonview v2.

- **Jellyfin Server Version:** v10.11.11
- **Docker Image:** `jellyfin/jellyfin:10.11.11`
- **Date Selected:** 2026-08-21
- **amd64 Support:** Yes
- **arm64 Support:** Yes
- **Reason for Selection:** This is the current stable release identified via the official GitHub releases. Pinning to an exact version guarantees identical behavior across local Windows development (x64) and future Oracle Cloud deployment (ARM64), mitigating cross-platform image resolution risks and ensuring Moonview Web development occurs against a stable target.
