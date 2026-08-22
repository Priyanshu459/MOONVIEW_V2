#!/bin/bash
set -euo pipefail

echo "Moonview Oracle Linux VM Bootstrap (Stage E Prep)"
# Check for root/sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (or with sudo)."
  exit 1
fi

echo "1. System Updates"
dnf update -y

echo "2. Install Docker & Nginx"
if ! command -v docker >/dev/null; then
    dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
    dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    usermod -aG docker $SUDO_USER
    systemctl enable --now docker
fi
dnf install -y nginx curl htop tar gzip

echo "3. Directory Structure"
mkdir -p /opt/moonview/jellyfin/config
mkdir -p /opt/moonview/jellyfin/cache
mkdir -p /opt/moonview/jellyfin/transcodes
mkdir -p /opt/moonview/web/releases
mkdir -p /opt/moonview/media
mkdir -p /opt/moonview/backups
mkdir -p /opt/moonview/logs
mkdir -p /opt/moonview/deploy

# Permissions
chown -R $SUDO_USER:$SUDO_USER /opt/moonview

echo "4. Firewall Configuration (firewalld)"
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
# Ensure 8096 is NOT open publicly
firewall-cmd --permanent --remove-port=8096/tcp || true
firewall-cmd --reload

echo "Bootstrap complete. Please copy deployment files to /opt/moonview/deploy and Nginx conf to /etc/nginx/conf.d."
