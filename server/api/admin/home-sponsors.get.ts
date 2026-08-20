import { requireSession } from '../../utils/auth'
import { getHomeSponsorsFields } from '../../utils/home-sponsors'

export default defineEventHandler((event) => {
  requireSession(event)
  return { content: getHomeSponsorsFields(), publishedAt: null }
})
