# Agent Guidance

This file provides repository-specific guidance for coding agents and automated
contributors. Keep it public-safe: do not add credentials, private host
details, infrastructure identifiers or instructions for accessing a server.

## Project priorities

1. Preserve a simple editing experience for club volunteers.
2. Protect administrator accounts and persistent club data.
3. Keep the public site accessible, responsive and fast.
4. Prefer straightforward, low-maintenance solutions suitable for a
   community organisation.
5. Leave code, documentation and operations understandable to future
   maintainers.

## Technical overview

- Nuxt 4, Vue 3 and TypeScript application.
- Nitro server routes under `server/`.
- SQLite persistence through `better-sqlite3`.
- Runtime uploads processed with Sharp.
- Production is delivered as a Linux ARM64 Docker image.
- Runtime state is external to the image and consists primarily of the SQLite
  database and uploaded media.

Important locations:

- `app/pages/` — public and administrator pages.
- `app/components/` — shared public and CMS components.
- `server/api/admin/` — authenticated administration endpoints.
- `server/api/content/` — public content endpoints.
- `server/db/migrations.ts` — ordered SQLite schema migrations.
- `server/utils/` — authentication, database and content utilities.
- `server/middleware/security.ts` — response security headers.
- `server/routes/uploads/` — controlled delivery of uploaded media.
- `shared/types/` — content contracts shared by client and server.
- `.github/workflows/` — image publishing and security checks.
- `scripts/` — container entrypoint and deployment helpers.

## Development workflow

Use the lockfile and avoid unnecessary dependency churn:

```bash
npm ci
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

For a small documentation-only change, `git diff --check` is sufficient unless
the documentation changes commands, configuration or application behaviour.

Before reporting completion:

1. Inspect the final diff for unrelated or generated files.
2. Run the checks appropriate to the change.
3. Report checks that were run and any that could not be run.
4. Leave the working tree free of temporary databases, uploads and build
   artifacts.

Do not commit or push unless the user requests it. Do not merge dependency
updates solely because automated checks are green; review and test each update
according to its risk.

## Content and interface conventions

- Keep club-facing language friendly, concise and understandable in New
  Zealand English.
- Preserve responsive behaviour and test narrow as well as wide layouts when
  changing UI.
- Admin fields should have clear labels, useful defaults and actionable error
  messages.
- Keep public rendering resilient when optional content or images are absent.
- Reuse shared content types and existing CMS patterns rather than creating
  parallel storage or publishing mechanisms.
- Avoid exposing administrator routes through sitemaps or other discovery
  metadata.

## Database and migration safety

- Treat existing SQLite data as durable and user-owned.
- Make schema changes through a new, ordered migration in
  `server/db/migrations.ts`; never rewrite a migration that may already have
  run.
- Migrations must be safe to execute once during application startup and must
  preserve existing rows unless deletion is an explicit product requirement.
- Test migrations from both a fresh database and a representative existing
  database when practical.
- SQLite uses WAL mode. Do not claim that copying only `app.db` from a running
  service is a valid backup. Use the SQLite backup API or stop the writer and
  copy the complete database state consistently.
- Never replace, delete or bulk-modify deployed data without explicit approval
  and a verified backup.
- Keep database files and uploaded media out of Git.

## Security invariants

Changes must not weaken the following without an explicit, documented design
decision:

- Password verification and login throttling occur on the server.
- Session tokens are random, stored server-side in hashed form and transported
  in `HttpOnly`, `SameSite=Strict` cookies that are `Secure` in production.
- Only one active session is retained per administrator.
- Authentication events remain auditable without logging passwords, session
  tokens or other secrets.
- Production client identity is derived only from the explicitly trusted proxy
  header, not arbitrary forwarded headers.
- Admin endpoints require server-side authentication.
- Uploads are size-limited, decoded as images, pixel-limited, auto-oriented,
  resized, stripped of metadata and re-encoded before storage.
- Upload paths and filenames are server-controlled and cannot escape the upload
  directory.
- Security headers remain restrictive. Review CSP changes carefully and avoid
  broad new sources or unsafe directives where possible.
- The production container continues to run as a dedicated non-root user with
  a read-only root filesystem, dropped capabilities and no-new-privileges.

Use generic responses where detailed authentication errors would help account
enumeration. Never print, paste, request or commit live credentials.

## Environment and secret handling

- `.env`, `/data`, SQLite files and uploads are intentionally ignored.
- `.env.example` must contain placeholders only.
- Do not add server usernames, addresses, filesystem paths, tunnel identifiers,
  private ports, account names or secret locations to repository files.
- Do not infer or fabricate production configuration.
- Do not read or expose secrets unless the requested task strictly requires
  using them, and never include secret values in logs, commits or responses.
- Treat the public repository as fully visible to an attacker; security must
  depend on protected credentials and sound controls, not hidden source code.

## Build and deployment boundary

GitHub Actions automatically builds and publishes the deployable ARM64 image
after changes reach `main`. It does **not** update the runtime server.

Server deployment is currently manual. Do not enable Watchtower, cron jobs,
systemd update timers, webhooks or any other automatic deployment mechanism
without explicit user approval. Do not describe a successful image build as a
successful server deployment.

Agents working only in this repository should stop after validating the image
or workflow unless the user separately requests deployment. If deployment is
requested and server access is available:

1. Confirm the intended release and target environment.
2. Preserve persistent data and take a verified backup before risky data or
   permission changes.
3. Pull and recreate only this application.
4. Wait for the container health check.
5. Verify the local health endpoint and public HTTPS site.
6. Smoke-test key content, uploaded media and administrator authentication when
   relevant.
7. Confirm unrelated services were not disturbed.
8. Report the deployed revision or image digest without exposing credentials.

Infrastructure and Cloudflare changes are separate operational tasks. Make
them only when explicitly requested, avoid changing unrelated routes or
services, and verify both the target application and unaffected services.

## Dependency maintenance

- Prefer supported LTS runtimes for production.
- Treat framework, runtime, TypeScript and persistence-library major versions
  as migrations requiring focused compatibility testing.
- For Docker/runtime updates, build the production image for ARM64 and verify
  health rather than relying only on host-native development checks.
- For sitemap changes, inspect the generated XML and confirm administrator
  routes remain excluded.
- For SQLite or native-module changes, verify installation and runtime on the
  production architecture.
- Keep Dependabot ignore rules narrowly scoped and revisit them when the
  surrounding toolchain supports the deferred upgrade.

## Documentation

Update `README.md`, `.env.example` and this file when behaviour or operational
expectations change. Keep the README useful to developers and portfolio
reviewers; keep this file focused on constraints and safe working practices for
future agents.
