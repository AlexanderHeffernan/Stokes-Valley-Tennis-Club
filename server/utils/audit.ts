import type { H3Event } from 'h3'
import type { AuthenticatedUser } from './auth'
import { getClientIp } from './client-ip'
import { db } from './db'

export function recordAuthAudit(
  event: H3Event,
  username: string,
  action: string,
  changes: unknown,
  userId: number | null = null
) {
  db.prepare(`
    INSERT INTO audit_log (
      user_id, username, action, entity_type, entity_id, changes_json, ip_address
    ) VALUES (?, ?, ?, 'authentication', ?, ?, ?)
  `).run(
    userId,
    username || '(not supplied)',
    action,
    username || '(not supplied)',
    JSON.stringify(changes),
    getClientIp(event)
  )
}

export function recordAudit(
  event: H3Event,
  user: AuthenticatedUser,
  action: string,
  entityType: string,
  entityId: string,
  changes: unknown
) {
  db.prepare(`
    INSERT INTO audit_log (
      user_id, username, action, entity_type, entity_id, changes_json, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.username,
    action,
    entityType,
    entityId,
    JSON.stringify(changes),
    getClientIp(event)
  )
}
