#!/bin/sh
set -e

mkdir -p /app/data/uploads
exec node /app/.output/server/index.mjs
