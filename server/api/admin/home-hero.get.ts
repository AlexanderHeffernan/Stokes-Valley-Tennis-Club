import { requireSession } from '../../utils/auth'
import { getHomeHeroEditorData } from '../../utils/home-hero'

export default defineEventHandler((event) => {
  requireSession(event)
  return getHomeHeroEditorData()
})
