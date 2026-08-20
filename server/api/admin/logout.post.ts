import { destroySession, requireCsrf, requireSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  destroySession(event, session.sessionId)
  return { success: true }
})
