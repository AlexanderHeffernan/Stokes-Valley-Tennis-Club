import { recordAudit } from '../../../utils/audit'
import { requireCsrf, requireSession } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { getHomeHighlightsFields, validateHomeHighlights } from '../../../utils/home-highlights'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const before = getHomeHighlightsFields()
  const content = validateHomeHighlights(await readBody(event))

  db.prepare(`
    UPDATE home_highlights
    SET content_json = ?, published_by = ?, published_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(JSON.stringify(content), session.user.id)

  recordAudit(event, session.user, 'content.published', 'home_highlights', '1', { before, after: content })
  return { content, publishedAt: new Date().toISOString() }
})
