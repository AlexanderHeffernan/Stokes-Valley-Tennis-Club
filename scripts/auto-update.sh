#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif docker-compose version &>/dev/null; then
    COMPOSE="docker-compose"
else
    echo "[$(date)] Docker Compose is not installed"
    exit 1
fi

if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

IMAGE_NAME=${IMAGE_NAME:-ghcr.io/alexanderheffernan/stokes-valley-tennis-club:latest}
CURRENT_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "$IMAGE_NAME" 2>/dev/null || echo none)

IMAGE_NAME="$IMAGE_NAME" $COMPOSE pull -q
NEW_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "$IMAGE_NAME" 2>/dev/null || echo none)

if [ "$CURRENT_DIGEST" != "$NEW_DIGEST" ]; then
    echo "[$(date)] New version detected"
    ./scripts/deploy.sh
else
    echo "[$(date)] No updates available"
fi
