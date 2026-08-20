import { fieldsToHomeHighlights, type HomeHighlightsFields } from '#shared/types/home-highlights'
import { cmsIconNames } from '#shared/cms-icons'
import { db } from './db'

export function getHomeHighlightsFields(): HomeHighlightsFields {
  const row = db.prepare('SELECT content_json FROM home_highlights WHERE id = 1').get() as { content_json: string }
  return JSON.parse(row.content_json) as HomeHighlightsFields
}

export function getPublishedHomeHighlights() {
  return fieldsToHomeHighlights(getHomeHighlightsFields())
}

export function validateHomeHighlights(input: unknown): HomeHighlightsFields {
  if (!input || typeof input !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid highlights content' })
  }

  const value = input as Record<string, unknown>
  const output: HomeHighlightsFields = {}
  for (let number = 1; number <= 4; number += 1) {
    const icon = value[`item${number}Icon`]
    const heading = value[`item${number}Heading`]
    const text = value[`item${number}Text`]
    const color = value[`item${number}Color`]

    if (typeof icon !== 'string' || !cmsIconNames.has(icon)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid icon for item ${number}` })
    }
    if (typeof heading !== 'string' || !heading.trim() || heading.length > 60) {
      throw createError({ statusCode: 400, statusMessage: `Invalid heading for item ${number}` })
    }
    if (typeof text !== 'string' || !text.trim() || text.length > 180) {
      throw createError({ statusCode: 400, statusMessage: `Invalid text for item ${number}` })
    }
    if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid color for item ${number}` })
    }

    output[`item${number}Icon`] = icon
    output[`item${number}Heading`] = heading.trim()
    output[`item${number}Text`] = text.trim()
    output[`item${number}Color`] = color.toLowerCase()
  }
  return output
}
