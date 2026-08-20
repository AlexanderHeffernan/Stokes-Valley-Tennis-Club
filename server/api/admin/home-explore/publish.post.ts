import { recordAudit } from '../../../utils/audit'
import { requireCsrf, requireSession } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { getHomeExploreFields, validateHomeExplore } from '../../../utils/home-explore'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const before = getHomeExploreFields()
  const content = validateHomeExplore(await readBody(event))

  db.prepare(`
    UPDATE home_explore
    SET content_json = ?, published_by = ?, published_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(JSON.stringify(content), session.user.id)

  recordAudit(event, session.user, 'content.published', 'home_explore', '1', { before, after: content })
  return { content, publishedAt: new Date().toISOString() }
})
