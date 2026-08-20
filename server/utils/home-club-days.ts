import { fieldsToHomeClubDays, type ClubDay, type HomeClubDaysFields } from '#shared/types/home-club-days'
import { db } from './db'

export function getHomeClubDaysFields(): HomeClubDaysFields {
  const row = db.prepare('SELECT content_json FROM home_club_days WHERE id = 1').get() as { content_json: string }
  return JSON.parse(row.content_json) as HomeClubDaysFields
}

export function getPublishedHomeClubDays() {
  return fieldsToHomeClubDays(getHomeClubDaysFields())
}

export function validateHomeClubDays(input: unknown): HomeClubDaysFields {
  if (!input || typeof input !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid club days content' })
  }
  const value = input as Record<string, unknown>
  const heading = typeof value.heading === 'string' ? value.heading.trim() : ''
  const introduction = typeof value.introduction === 'string' ? value.introduction.trim() : ''
  const daysJson = value.daysJson
  if (!heading || heading.length > 80 || !introduction || introduction.length > 240 || typeof daysJson !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid club days content' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(daysJson)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid club day list' })
  }
  if (!Array.isArray(parsed) || parsed.length > 12) {
    throw createError({ statusCode: 400, statusMessage: 'A maximum of 12 club days is supported' })
  }

  const days = parsed.map((item, index): ClubDay => {
    if (!item || typeof item !== 'object') throw createError({ statusCode: 400, statusMessage: `Invalid club day ${index + 1}` })
    const data = item as Record<string, unknown>
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    const schedule = typeof data.schedule === 'string' ? data.schedule.trim() : ''
    const note = typeof data.note === 'string' ? data.note.trim() : ''
    const linkUrl = typeof data.linkUrl === 'string' ? data.linkUrl.trim() : ''
    if (!name || name.length > 80 || !schedule || schedule.length > 100 || note.length > 180) {
      throw createError({ statusCode: 400, statusMessage: `Invalid club day ${index + 1}` })
    }
    if (linkUrl.length > 500 || (linkUrl && !(/^(\/[^/]|\/$)/.test(linkUrl) || /^https:\/\//i.test(linkUrl)))) {
      throw createError({ statusCode: 400, statusMessage: `Invalid link for club day ${index + 1}` })
    }
    return { name, schedule, note, linkUrl }
  })

  return { heading, introduction, daysJson: JSON.stringify(days) }
}
