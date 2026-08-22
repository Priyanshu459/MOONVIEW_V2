# Moonview Phase 5 Deployment Architecture

This document describes the intended production architecture for Moonview running on Oracle Cloud (ARM64 Ubuntu Linux).

## High-Level Data Flow

```text
User 
  ↓ (HTTPS)
Cloudflare (DNS & Proxy)
  ↓ (HTTPS)
Oracle Cloud VM (Ubuntu ARM64)
  ↓
Nginx Reverse Proxy
  ↓ (HTTP on 127.0.0.1:8096)
Jellyfin Server (Docker Container)
  ↓
Moonview Web (Static read-only mount)
  ↓
Media Storage
```

## Directory Structure Strategy
The target production structure on the Oracle VM:
```text
/opt/moonview/
├── deploy/                # Deployment scripts and config
│   ├── docker-compose.prod.yml
│   ├── nginx/
│   │   └── moonview.conf
│   └── scripts/           # start.sh, stop.sh, backup.sh, health.sh
├── config/                # Persistent Jellyfin configuration (Backed up)
├── cache/                 # Persistent Jellyfin cache (Volatile, not backed up)
├── transcodes/            # Transient transcodes directory (Volatile, not backed up)
├── web/                   # Moonview web bundles
│   ├── releases/          # Timestamped/versioned builds
│   └── current/           # Symlink to active release
├── media/                 # Mounted media storage
├── backups/               # Local automated backups
└── logs/                  # System and container logs
```

## Nginx Reverse Proxy
Nginx will act as the single entry point for all external traffic, terminating HTTPS (using Cloudflare Origin Cert or Let's Encrypt), and forwarding requests to Jellyfin bound strictly to `127.0.0.1:8096`. This guarantees that Jellyfin is not exposed directly. It will be configured to handle websockets properly and pass through large streaming requests (or disable buffering for them) based on Jellyfin's official recommendations.

## Cloudflare Caching & SSL
*   **SSL Mode**: Full (strict)
*   **Cache Policy**: Static assets (like hashed JS and CSS) will be heavily cached. API endpoints and streaming data will bypass the CDN cache. User specific data and authentication requests will never be cached.

## Hardware Assumptions
*   **Target OS**: Ubuntu LTS (ARM64)
*   **GPU**: None assumed (CPU software transcoding fallback).
*   **Resources**: 4 ARM Cores, 24GB RAM (Oracle Free Tier Profile).

## Direct Play Priority
Moonview aims for direct playback by providing frontend compatibility with standard formats (H.264, AAC, MP4). Software transcoding on ARM64 without a GPU will be costly and thus limited.
