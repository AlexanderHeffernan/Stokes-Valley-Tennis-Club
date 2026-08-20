import { createSession } from '../../utils/auth'
import { db } from '../../utils/db'
import { hashPassword, verifyPassword } from '../../utils/password'

interface UserRow {
  id: number
  username: string
  display_name: string
  role: 'owner' | 'editor'
  password_hash: string
}

const attempts = new Map<string, { count: number, resetAt: number }>()
const dummyHash = hashPassword('not-the-correct-password')

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const current = attempts.get(ip)
  if (current && current.resetAt > now && current.count >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Too many login attempts. Try again later.' })
  }

  const body = await readBody<{ username?: unknown, password?: unknown }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!username || !password || username.length > 80 || password.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  const user = db.prepare(`
    SELECT id, username, display_name, role, password_hash FROM users WHERE username = ?
  `).get(username) as UserRow | undefined

  const valid = verifyPassword(password, user?.password_hash || dummyHash)
  if (!user || !valid) {
    const attempt = current && current.resetAt > now ? current : { count: 0, resetAt: now + 15 * 60 * 1000 }
    attempt.count += 1
    attempts.set(ip, attempt)
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  attempts.delete(ip)
  const csrfToken = createSession(event, user.id)
  return {
    csrfToken,
    user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role }
  }
})
