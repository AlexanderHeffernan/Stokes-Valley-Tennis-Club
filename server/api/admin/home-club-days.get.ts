import { requireSession } from '../../utils/auth'
import { getHomeClubDaysFields } from '../../utils/home-club-days'

export default defineEventHandler((event) => {
  requireSession(event)
  return { content: getHomeClubDaysFields(), publishedAt: null }
})
