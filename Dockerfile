# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ sqlite-dev
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run postinstall
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache sqlite-libs
WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

RUN chmod +x /app/scripts/docker-entrypoint.sh && mkdir -p /app/data/uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
