import { recordAudit } from '../../../utils/audit'
import { requireCsrf, requireSession } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { getSiteFooterFields, validateSiteFooter } from '../../../utils/site-footer'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const before = getSiteFooterFields()
  const content = validateSiteFooter(await readBody(event))

  db.prepare(`
    UPDATE site_footer
    SET content_json = ?, published_by = ?, published_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(JSON.stringify(content), session.user.id)

  recordAudit(event, session.user, 'content.published', 'site_footer', '1', { before, after: content })
  return { content, publishedAt: new Date().toISOString() }
})
