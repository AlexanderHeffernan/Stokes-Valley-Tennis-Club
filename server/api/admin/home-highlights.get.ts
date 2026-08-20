import { requireSession } from '../../utils/auth'
import { getHomeHighlightsFields } from '../../utils/home-highlights'

export default defineEventHandler((event) => {
  requireSession(event)
  return { content: getHomeHighlightsFields(), publishedAt: null }
})
