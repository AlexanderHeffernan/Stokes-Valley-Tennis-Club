import type { SiteFooterContent, SiteFooterFields } from '#shared/types/site-footer'
import { db } from './db'

export function getSiteFooterFields(): SiteFooterFields {
  const row = db.prepare('SELECT content_json FROM site_footer WHERE id = 1').get() as { content_json: string }
  return JSON.parse(row.content_json) as SiteFooterFields
}

export function getPublishedSiteFooter(): SiteFooterContent {
  return getSiteFooterFields() as unknown as SiteFooterContent
}

export function validateSiteFooter(input: unknown): SiteFooterFields {
  if (!input || typeof input !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid footer content' })
  }
  const value = input as Record<string, unknown>
  const field = (key: string, maxLength: number) => {
    const result = value[key]
    if (typeof result !== 'string' || result.length > maxLength) {
      throw createError({ statusCode: 400, statusMessage: `Invalid ${key}` })
    }
    return result.trim()
  }

  const address = field('address', 240)
  const email = field('email', 254)
  const phone = field('phone', 40)
  const facebookUrl = field('facebookUrl', 500)
  const ctaHeading = field('ctaHeading', 80)
  const ctaText = field('ctaText', 240)

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }
  if (facebookUrl && !/^https:\/\//i.test(facebookUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'Facebook link must use https://' })
  }
  if (!ctaHeading || !ctaText) {
    throw createError({ statusCode: 400, statusMessage: 'CTA heading and text are required' })
  }

  return { address, email, phone, facebookUrl, ctaHeading, ctaText }
}
