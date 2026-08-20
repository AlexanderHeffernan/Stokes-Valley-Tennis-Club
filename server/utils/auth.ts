import { createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { db } from './db'

const SESSION_COOKIE = 'svtc_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 12

interface SessionRow {
  id: number
  csrf_token: string
  user_id: number
  username: string
  display_name: string
  role: 'owner' | 'editor'
}

export interface AuthenticatedUser {
  id: number
  username: string
  displayName: string
  role: 'owner' | 'editor'
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export function createSession(event: H3Event, userId: number) {
  const token = randomBytes(32).toString('base64url')
  const csrfToken = randomBytes(24).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString()

  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString())
  db.prepare('INSERT INTO sessions (token_hash, csrf_token, user_id, expires_at) VALUES (?, ?, ?, ?)')
    .run(hashToken(token), csrfToken, userId, expiresAt)

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  })

  return csrfToken
}

export function getAuthSession(event: H3Event): { user: AuthenticatedUser, csrfToken: string, sessionId: number } | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const row = db.prepare(`
    SELECT sessions.id, sessions.csrf_token, users.id AS user_id,
      users.username, users.display_name, users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(hashToken(token), new Date().toISOString()) as SessionRow | undefined

  if (!row) return null
  return {
    sessionId: row.id,
    csrfToken: row.csrf_token,
    user: {
      id: row.user_id,
      username: row.username,
      displayName: row.display_name,
      role: row.role
    }
  }
}

export function requireSession(event: H3Event) {
  const session = getAuthSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  return session
}

export function requireCsrf(event: H3Event, expectedToken: string) {
  const suppliedToken = getHeader(event, 'x-csrf-token')
  if (!suppliedToken || suppliedToken !== expectedToken) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid security token' })
  }

  const origin = getHeader(event, 'origin')
  const host = getHeader(event, 'host')
  if (origin && host && new URL(origin).host !== host) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
  }
}

export function destroySession(event: H3Event, sessionId: number) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
