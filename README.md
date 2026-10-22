# Stokes Valley Tennis Club

A modern website and lightweight content management system for Stokes Valley
Tennis Club in Lower Hutt, New Zealand.

The project is built to give club volunteers an approachable editing
experience while keeping the public website fast, secure and inexpensive to
operate. It also demonstrates a complete self-hosted delivery pipeline: a
Nuxt application, persistent SQLite content, a hardened Docker runtime,
automated ARM64 image builds and deployment to a Raspberry Pi behind
Cloudflare.

**Staging:** <https://stokesvalleytennisclub.alexheffernan.dev>

## Highlights

- Responsive public homepage with configurable hero, club days, highlights,
  news preview, navigation cards, sponsors and footer content.
- Purpose-built administration interface for club volunteers.
- Server-rendered Nuxt application with a generated XML sitemap.
- SQLite-backed content and session storage with automatic migrations.
- Secure image uploads that are decoded, validated, resized, stripped of
  metadata and converted to WebP.
- Hardened authentication with server-side sessions, secure cookies, durable
  login throttling and audit events.
- Multi-stage, ARM64-compatible Docker image running as a dedicated non-root
  user.
- GitHub Actions builds and security checks, CodeQL, Dependabot, secret
  scanning and push protection.

## Technology

| Area | Technology |
| --- | --- |
| Application | Nuxt 4, Vue 3, TypeScript |
| Server | Nitro |
| Persistence | SQLite with `better-sqlite3` |
| Image processing | Sharp |
| Container | Docker, Docker Compose, Node 24 Alpine |
| CI/CD | GitHub Actions, GitHub Container Registry |
| Hosting | Raspberry Pi, Cloudflare Tunnel |

## Architecture

```text
Browser
   |
Cloudflare (DNS, TLS and tunnel)
   |
Raspberry Pi: localhost port
   |
Docker container (Nuxt/Nitro, non-root, read-only root filesystem)
   |
Bind-mounted /app/data
   +-- app.db          SQLite content, users and sessions
   +-- uploads/        Processed media
```

Application code and dependencies are immutable inside the image. Runtime
state lives in the host-mounted `data/` directory, so replacing the container
does not replace club content or uploaded media.

## Local development

### Requirements

- Node.js 24.22.1 or newer patched Node 24 LTS release (below Node 25)
- npm

Install the exact dependency versions from the lockfile:

```bash
npm ci
```

Copy the example configuration and replace the development credentials:

```bash
cp .env.example .env
```

Start the development server at <http://localhost:3000>:

```bash
npm run dev
```

The application creates its SQLite database and applies migrations on first
use. Local databases, uploads and environment files are intentionally ignored
by Git.

### Useful commands

```bash
npm run typecheck       # Run Nuxt/Vue TypeScript checks
npm run build           # Create a production build
npm run preview         # Preview the production build locally
npm audit --omit=dev    # Audit production dependencies
npm run audit:security # Enforce the time-limited security exception policy
npm test               # Test the audit policy's acceptance/rejection boundaries
```

The Docker build pins all stages to Node 24.22.1 Alpine, including native
dependency installation. Keep that patch version current with Node security
releases; the npm engine constraint and Node type definitions also target 24 LTS.
Audit counts describe dependency advisories (including framework tooling), not
confirmed exploitable paths in the deployed application.

## Configuration

The documented variables are available in `.env.example`:

| Variable | Purpose |
| --- | --- |
| `IMAGE_NAME` | Container image used by Docker Compose |
| `HOST_PORT` | Loopback-only host port mapped to container port 3000 |
| `NUXT_PUBLIC_SITE_URL` | Public origin used for canonical URLs and the sitemap |
| `ADMIN_INITIAL_USERNAME` | Username used to bootstrap the first administrator |
| `ADMIN_INITIAL_PASSWORD` | Strong password used to bootstrap the first administrator |

Never commit `.env`, the `data/` directory, database files, uploads or live
credentials. Production secrets belong only on the server and should have
restrictive file permissions.

## Container deployment

Docker Compose binds the service to `127.0.0.1` rather than exposing it to the
network directly. Cloudflare Tunnel is responsible for public HTTPS traffic.
The production container adds several defence-in-depth controls:

- fixed UID/GID `10001:10001`;
- read-only root filesystem;
- all Linux capabilities dropped;
- `no-new-privileges` enabled;
- constrained, non-executable temporary storage; and
- a Docker health check at `/api/health`.

On a configured server, deploy the current image with:

```bash
./scripts/deploy.sh
```

The script pulls the configured image, recreates the service, checks the local
health endpoint and prints the resulting Compose status.

### Important: builds are automatic; server updates are manual

A push to `main` automatically runs GitHub Actions and, if successful, builds
and publishes a Linux ARM64 image to GitHub Container Registry:

```text
ghcr.io/alexanderheffernan/stokes-valley-tennis-club:latest
```

**Publishing an image does not update the Raspberry Pi.** The server remains
responsible for pulling that image and recreating the container. There is no
Watchtower, cron job or systemd update timer enabled, so a maintainer must run
`scripts/deploy.sh` on the Pi when a tested release is ready.

This separation is intentional: merging code can create a deployable artifact
without unexpectedly restarting the live service. `scripts/auto-update.sh`
exists as a future building block, but it is not scheduled.

## GitHub workflow and maintenance

- **Build and Deploy** builds and publishes the ARM64 container image after a
  push to `main`. Despite the workflow name, it publishes the artifact; it does
  not connect to or deploy on the Raspberry Pi.
- **Security** installs from the lockfile, audits production dependencies and
  runs CodeQL on pushes, pull requests and a weekly schedule. An independent
  validation job runs policy tests, typechecking and a production build, even
  when the audit job fails.
- **Dependabot** proposes weekly npm, GitHub Actions and Docker dependency
  updates. Major runtime/toolchain upgrades that are not currently supported
  are ignored.

Dependabot pull requests should be reviewed and tested individually. A green
security check does not by itself prove that a major framework or runtime
upgrade is safe.

### Temporary audit exceptions

`npm run audit:security` runs the production dependency audit and fails for
unaccepted high/critical findings, audit errors or expired exceptions. The raw
`npm audit --omit=dev` command remains available and still reports all findings.
Two explicitly reviewed exceptions expire at **2026-11-22 00:00 UTC**:

- [`GHSA-vfj7-8cjw-p6xm`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
  only for `braces@3.0.3`.
- [`GHSA-86w9-cpqp-85rv`](https://github.com/advisories/GHSA-86w9-cpqp-85rv),
  only for `node-forge@1.4.0`.

These packages arrive through Nitro's file-scanning and development HTTPS
tooling. Neither dependency chain was found in the generated production server
bundle; an isolated output smoke test with both chains blocked passed public
content, login and image upload/readback checks. The Docker image nevertheless
ships them in its full root dependency tree. This supports limited risk
acceptance, not a claim that the vulnerabilities are fixed or every possible
execution path has been proved safe. Build inputs must remain trusted.

The policy checks each underlying advisory and every reported installed copy's
locked version, including causes inherited by Nuxt/Nitro. It does not exempt
Nuxt, Nitro or either package from other advisories. Critical severity is never
accepted. New advisories, changed affected versions and expiry require review;
do not extend the date automatically. Remove exceptions when upstream patches
become available. Runtime-image slimming is a separate follow-up requiring
ARM64 SQLite/sharp compatibility checks.

Recommended release process:

1. Review the change and avoid committing runtime data or secrets.
2. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build` and
   `npm run audit:security`; inspect raw audit findings as well.
3. Merge to `main` and confirm the GitHub Actions image build succeeds.
4. On the Raspberry Pi, run `scripts/deploy.sh`.
5. Verify Docker health, `/api/health`, the public homepage, admin login and
   uploaded media.

## Security and data operations

Security-sensitive behaviour is enforced server-side, including authentication,
login throttling, session handling, upload validation and HTTP response
headers. The public repository contains configuration and implementation, but
not the secrets or persistent data needed to access the deployed service.

SQLite uses WAL mode and must be backed up with a SQLite-aware snapshot rather
than by copying only `app.db` while the application is running. Automated
off-device backups are tracked in
[issue #6](https://github.com/AlexanderHeffernan/Stokes-Valley-Tennis-Club/issues/6).
Until that work is completed, deployments and data migrations should be
preceded by a verified manual backup of both the database and uploads.

## Project direction

The current release focuses on a polished, configurable homepage and a secure
operational foundation. The content model and administration patterns are
designed to support future additions such as dedicated news, membership,
coaching, interclub and contact content without replacing the deployment or
security architecture.
