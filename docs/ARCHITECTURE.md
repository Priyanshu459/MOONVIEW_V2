# Moonview v2 Architecture

This document describes the current and target architecture of Moonview v2. Moonview relies entirely on Jellyfin as the central source of truth for media, metadata, playback progress, and authentication.

## Current Architecture

```text
                    JELLYFIN SERVER
                          │
             Central Source of Truth
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
         MOONVIEW WEB        MOONVIEW ANDROID
```

### Local Phase 2.5 Development Architecture

```text
LOCAL DEVELOPMENT

Browser
   ↓
http://localhost:8096
   ↓
Jellyfin Server 10.11.11
   │
   ├── Jellyfin API
   └── mounted Moonview Web dist
```

### Future Production Deployment (Target)

```text
PRODUCTION

Cloudflare
   ↓
Nginx
   ↓
Moonview Web + Jellyfin
   ↓
Oracle ARM64
```

## Catalog Model

The media catalog is managed by administrators strictly at the storage/server level. Moonview is a read-centric product for end users.

```text
Administrator adds media to server storage
                 ↓
Jellyfin scans it
                 ↓
Content enters Moonview catalog
                 ↓
Users consume that catalog
```

**Normal Users:**
- CAN: Browse, Search, Watch, Resume, Favorite / My List
- CANNOT: Upload media, Manage libraries, Edit metadata, Administer server
