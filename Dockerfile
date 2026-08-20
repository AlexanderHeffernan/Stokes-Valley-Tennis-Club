# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

RUN apk add --no-cache python3 make g++ sqlite-dev
WORKDIR /app

ARG NUXT_PUBLIC_SITE_URL=https://stokesvalleytennisclub.alexheffernan.dev
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run postinstall
RUN npm run build

FROM node:24-alpine AS runtime-dependencies

RUN apk add --no-cache python3 make g++ sqlite-dev
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-alpine

RUN apk add --no-cache sqlite-libs
WORKDIR /app

ARG APP_UID=10001
ARG APP_GID=10001
RUN addgroup -S -g "$APP_GID" app \
  && adduser -S -D -H -u "$APP_UID" -G app app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./
COPY --from=runtime-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

RUN chmod +x /app/scripts/docker-entrypoint.sh \
  && mkdir -p /app/data/uploads \
  && chown -R app:app /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER app:app
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
