import { recordAudit } from '../../../utils/audit'
import { requireCsrf, requireSession } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { getHomeHeroEditorData, validateHomeHero } from '../../../utils/home-hero'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const before = getHomeHeroEditorData().content
  const content = validateHomeHero(await readBody(event))

  db.prepare(`
    UPDATE home_hero SET
      draft_headline_1 = ?, published_headline_1 = ?,
      draft_headline_2 = ?, published_headline_2 = ?,
      draft_subheading = ?, published_subheading = ?,
      draft_image_url = ?, published_image_url = ?,
      updated_by = ?, published_by = ?,
      updated_at = CURRENT_TIMESTAMP, published_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    content.headline1, content.headline1,
    content.headline2, content.headline2,
    content.subheading, content.subheading,
    content.imageUrl, content.imageUrl,
    session.user.id, session.user.id
  )

  recordAudit(event, session.user, 'content.published', 'home_hero', '1', {
    before,
    after: content
  })
  return getHomeHeroEditorData()
})
