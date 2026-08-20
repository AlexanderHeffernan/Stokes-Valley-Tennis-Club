import { requireSession } from '../../utils/auth'
import { getHomeExploreFields } from '../../utils/home-explore'

export default defineEventHandler((event) => {
  requireSession(event)
  return { content: getHomeExploreFields(), publishedAt: null }
})
