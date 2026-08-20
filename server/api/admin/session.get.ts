import { getAuthSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const session = getAuthSession(event)
  if (!session) return null
  return { user: session.user, csrfToken: session.csrfToken }
})
