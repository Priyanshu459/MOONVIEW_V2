# Moonview Phase 5 Security Plan

This document outlines the security procedures and hardening strategies applied to the Moonview Oracle VM and Jellyfin deployment.

## Server Hardening (Oracle Linux / Ubuntu ARM64)
1. **Firewall (UFW / Iptables)**: Expose only necessary external ports:
    *   `22` (SSH)
    *   `80` (HTTP)
    *   `443` (HTTPS)
2. **SSH Access**:
    *   Use Key-based authentication only.
    *   Disable password authentication in `/etc/ssh/sshd_config` (after validating keys).
    *   Disable `root` login.
3. **Privilege Execution**: 
    *   The deployment will run under a non-root standard user.
    *   Avoid running containers with `--privileged`.
    *   Use least privilege file permissions (e.g., `chmod 777` is strictly prohibited).

## Docker Security
*   **Networking**: Jellyfin will not publish port `8096` to `0.0.0.0` but will instead bind to `127.0.0.1:8096`, forcing all external traffic to funnel through the secure Nginx proxy.
*   **File Mounts**: Moonview Web builds (`/moonview-web`) and media directories will be mounted as read-only (`:ro`) unless write capability is explicitly required (e.g. metadata saving).

## Jellyfin Configuration Security
*   **Admin Access**: No anonymous admin access allowed.
*   **Viewer Accounts**: Regular viewers will have standard non-admin roles without permissions to manage the server, libraries, users, or delete media.
*   **Public Access**: Public signups and password resets will be disabled.

## HTTPS & Web Security
*   **TLS Setup**: Strict full SSL with HSTS enabled (only after validation).
*   **Security Headers**: Apply conservative headers via Nginx (`X-Content-Type-Options`, `Referrer-Policy`) ensuring no conflict with Jellyfin's Web UI/WebSockets.
*   **Rate Limiting**: Light rate limiting applied purely to login endpoints via Nginx to mitigate brute force attacks, without hindering normal API or streaming activity.

## Secret Management
*   No secrets (Passwords, API Tokens, Cloudflare Keys, TLS Certs) will be stored in Git.
*   Deployment relies on a non-versioned `.env` file (`.env.example` will be provided for structure).
