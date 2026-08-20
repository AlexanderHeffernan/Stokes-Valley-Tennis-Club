import { createHash } from 'node:crypto'
import { createSession } from '../../utils/auth'
import { recordAuthAudit } from '../../utils/audit'
import { getClientIp } from '../../utils/client-ip'
import { db } from '../../utils/db'
import { hashPassword, verifyPassword } from '../../utils/password'

interface UserRow {
  id: number
  username: string
  display_name: string
  role: 'owner' | 'editor'
  password_hash: string
}

const dummyHash = hashPassword('not-the-correct-password')
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const RETENTION_MS = 24 * 60 * 60 * 1000

interface ThrottleRow {
  failed_count: number
  first_failed_at: string
  locked_until: string | null
}

function usernameScope(username: string) {
  return `user:${createHash('sha256').update(username.toLocaleLowerCase('en-NZ')).digest('hex')}`
}

function ipScope(ip: string | null) {
  return `ip:${ip || 'unknown'}`
}

function activeLock(keys: string[], now: Date): Date | null {
  let latest: Date | null = null
  const select = db.prepare('SELECT locked_until FROM login_throttles WHERE scope_key = ?')
  for (const key of keys) {
    const row = select.get(key) as Pick<ThrottleRow, 'locked_until'> | undefined
    if (!row?.locked_until) continue
    const lock = new Date(row.locked_until)
    if (lock > now && (!latest || lock > latest)) latest = lock
  }
  return latest
}

const recordFailure = db.transaction((keys: string[], now: Date) => {
  const nowIso = now.toISOString()
  const windowStart = new Date(now.getTime() - WINDOW_MS)
  const select = db.prepare('SELECT failed_count, first_failed_at, locked_until FROM login_throttles WHERE scope_key = ?')
  const upsert = db.prepare(`
    INSERT INTO login_throttles (scope_key, failed_count, first_failed_at, last_failed_at, locked_until)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(scope_key) DO UPDATE SET
      failed_count = excluded.failed_count,
      first_failed_at = excluded.first_failed_at,
      last_failed_at = excluded.last_failed_at,
      locked_until = excluded.locked_until
  `)

  let newlyLocked = false
  for (const key of keys) {
    const current = select.get(key) as ThrottleRow | undefined
    const withinWindow = current && new Date(current.first_failed_at) > windowStart
    const count = withinWindow ? current.failed_count + 1 : 1
    const firstFailedAt = withinWindow ? current.first_failed_at : nowIso
    const lockedUntil = count >= MAX_ATTEMPTS ? new Date(now.getTime() + WINDOW_MS).toISOString() : null
    if (lockedUntil && (!current?.locked_until || new Date(current.locked_until) <= now)) newlyLocked = true
    upsert.run(key, count, firstFailedAt, nowIso, lockedUntil)
  }
  return newlyLocked
})

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown, password?: unknown }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!username || !password || username.length > 80 || password.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  const now = new Date()
  const scopes = [ipScope(getClientIp(event)), usernameScope(username)]
  db.prepare('DELETE FROM login_throttles WHERE last_failed_at < ?')
    .run(new Date(now.getTime() - RETENTION_MS).toISOString())
  const lockedUntil = activeLock(scopes, now)
  if (lockedUntil) {
    setHeader(event, 'Retry-After', Math.max(1, Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000)))
    throw createError({ statusCode: 429, statusMessage: 'Too many login attempts. Try again later.' })
  }

  const user = db.prepare(`
    SELECT id, username, display_name, role, password_hash FROM users WHERE username = ?
  `).get(username) as UserRow | undefined

  const valid = verifyPassword(password, user?.password_hash || dummyHash)
  if (!user || !valid) {
    const newlyLocked = recordFailure(scopes, now)
    recordAuthAudit(event, username, 'authentication.login_failed', { locked: newlyLocked })
    if (newlyLocked) recordAuthAudit(event, username, 'authentication.lockout', { minutes: 15 })
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  db.prepare(`DELETE FROM login_throttles WHERE scope_key IN (${scopes.map(() => '?').join(', ')})`).run(...scopes)
  const csrfToken = createSession(event, user.id)
  recordAuthAudit(event, user.username, 'authentication.login_succeeded', {}, user.id)
  return {
    csrfToken,
    user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role }
  }
})
