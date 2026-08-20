#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif docker-compose version &>/dev/null; then
    COMPOSE="docker-compose"
else
    echo "Docker Compose is not installed"
    exit 1
fi

$COMPOSE pull
$COMPOSE up -d

HOST_PORT=${HOST_PORT:-3100}
sleep 5
if curl -sf "http://localhost:${HOST_PORT}/api/health" >/dev/null; then
    echo "Deployment successful"
else
    $COMPOSE logs
    exit 1
fi

$COMPOSE ps
