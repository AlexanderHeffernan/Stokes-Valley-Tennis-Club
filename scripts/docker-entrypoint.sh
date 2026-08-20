#!/bin/sh
set -e
umask 077

mkdir -p /app/data/uploads
exec node /app/.output/server/index.mjs
