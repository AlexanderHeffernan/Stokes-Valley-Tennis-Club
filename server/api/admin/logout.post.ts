import { destroySession, requireCsrf, requireSession } from '../../utils/auth'
import { recordAuthAudit } from '../../utils/audit'

export default defineEventHandler((event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  recordAuthAudit(event, session.user.username, 'authentication.logout', {}, session.user.id)
  destroySession(event, session.sessionId)
  return { success: true }
})
