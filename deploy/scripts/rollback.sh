#!/bin/bash
set -euo pipefail

echo "Moonview Rollback Utility"
echo "Select rollback type:"
echo "1) Web UI (Switch current symlink to previous release)"
echo "2) Jellyfin Core (Downgrade Docker image tag)"
read -p "Enter choice [1-2]: " choice

if [ "$choice" == "1" ]; then
    echo "Current Web Releases:"
    ls -lt /opt/moonview/web/releases
    read -p "Enter the timestamp folder to rollback to: " timestamp
    if [ -d "/opt/moonview/web/releases/$timestamp" ]; then
        ln -sfn "/opt/moonview/web/releases/$timestamp" /opt/moonview/web/current
        echo "Web UI rolled back to $timestamp."
        echo "Restarting Jellyfin..."
        cd /opt/moonview/deploy && docker compose restart jellyfin
        ./scripts/health.sh
    else
        echo "Error: Release not found."
    fi
elif [ "$choice" == "2" ]; then
    echo "Jellyfin Core Rollback"
    echo "WARNING: A Jellyfin server downgrade may not be safe after database migrations."
    echo "If Jellyfin fails to start after rolling back the image, you MUST also run ./scripts/restore.sh with a pre-upgrade backup archive."
    
    COMPOSE_FILE="/opt/moonview/deploy/docker-compose.prod.yml"
    CURRENT_VERSION=$(grep 'image: jellyfin/jellyfin:' "$COMPOSE_FILE" | awk -F':' '{print $3}')
    echo "Current pinned version is: $CURRENT_VERSION"
    read -p "Enter the exact previous image version to rollback to (e.g. 10.11.11): " prev_version
    
    if [[ ! "$prev_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: Invalid version format."
        exit 1
    fi
    
    echo "Updating docker-compose.prod.yml to use tag $prev_version..."
    sed -i "s|image: jellyfin/jellyfin:.*|image: jellyfin/jellyfin:$prev_version|g" "$COMPOSE_FILE"
    
    echo "Pulling exact previous image and recreating container..."
    cd /opt/moonview/deploy
    docker compose pull jellyfin
    docker compose up -d
    
    echo "Running health check..."
    if ./scripts/health.sh; then
        echo "Rollback complete."
    else
        echo "WARNING: Health check failed! The database might be incompatible with the downgraded image."
        echo "Please use ./scripts/restore.sh to restore the pre-upgrade /config backup."
    fi
else
    echo "Invalid choice."
fi
