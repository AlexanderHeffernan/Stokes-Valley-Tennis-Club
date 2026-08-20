import { fieldsToHomeSponsors, type HomeSponsor, type HomeSponsorsFields } from '#shared/types/home-sponsors'
import { db } from './db'

export function getHomeSponsorsFields(): HomeSponsorsFields {
  const row = db.prepare('SELECT content_json FROM home_sponsors WHERE id = 1').get() as { content_json: string }
  return JSON.parse(row.content_json) as HomeSponsorsFields
}

export function getPublishedHomeSponsors() {
  return fieldsToHomeSponsors(getHomeSponsorsFields())
}

export function validateHomeSponsors(input: unknown): HomeSponsorsFields {
  if (!input || typeof input !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sponsor content' })
  }

  const itemsJson = (input as Record<string, unknown>).itemsJson
  if (typeof itemsJson !== 'string' || itemsJson.length > 50_000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sponsor list' })
  }

  let items: unknown
  try {
    items = JSON.parse(itemsJson)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sponsor list' })
  }
  if (!Array.isArray(items) || items.length > 50) {
    throw createError({ statusCode: 400, statusMessage: 'A maximum of 50 sponsors is supported' })
  }

  const sponsors = items.map((item, index): HomeSponsor => {
    if (!item || typeof item !== 'object') {
      throw createError({ statusCode: 400, statusMessage: `Invalid sponsor ${index + 1}` })
    }
    const value = item as Record<string, unknown>
    const name = typeof value.name === 'string' ? value.name.trim() : ''
    const imageUrl = typeof value.imageUrl === 'string' ? value.imageUrl : ''
    const websiteUrl = typeof value.websiteUrl === 'string' ? value.websiteUrl.trim() : ''
    const message = typeof value.message === 'string' ? value.message.trim() : ''
    if (!name || name.length > 100) {
      throw createError({ statusCode: 400, statusMessage: `Invalid name for sponsor ${index + 1}` })
    }
    if (!imageUrl.startsWith('/uploads/') || imageUrl.length > 500) {
      throw createError({ statusCode: 400, statusMessage: `Invalid logo for sponsor ${index + 1}` })
    }
    if (websiteUrl.length > 500 || (websiteUrl && !/^https:\/\//i.test(websiteUrl))) {
      throw createError({ statusCode: 400, statusMessage: `Invalid website for sponsor ${index + 1}` })
    }
    if (message.length > 240) {
      throw createError({ statusCode: 400, statusMessage: `Sponsor ${index + 1} message is too long` })
    }
    return { name, imageUrl, websiteUrl, message }
  })

  return { itemsJson: JSON.stringify(sponsors) }
}
