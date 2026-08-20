import { requireSession } from '../../utils/auth'
import { getSiteFooterFields } from '../../utils/site-footer'

export default defineEventHandler((event) => {
  requireSession(event)
  return { content: getSiteFooterFields(), publishedAt: null }
})
