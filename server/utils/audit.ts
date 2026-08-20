import type { H3Event } from 'h3'
import type { AuthenticatedUser } from './auth'
import { db } from './db'

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
    getRequestIP(event, { xForwardedFor: true }) || null
  )
}
