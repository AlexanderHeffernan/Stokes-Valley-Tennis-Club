import { fieldsToHomeExplore, type HomeExploreFields } from '#shared/types/home-explore'
import { cmsIconNames } from '#shared/cms-icons'
import { db } from './db'

export function getHomeExploreFields(): HomeExploreFields {
  const row = db.prepare('SELECT content_json FROM home_explore WHERE id = 1').get() as { content_json: string }
  return JSON.parse(row.content_json) as HomeExploreFields
}

export function getPublishedHomeExplore() {
  return fieldsToHomeExplore(getHomeExploreFields())
}

export function validateHomeExplore(input: unknown): HomeExploreFields {
  if (!input || typeof input !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid explore card content' })
  }

  const value = input as Record<string, unknown>
  const output: HomeExploreFields = {}
  for (let number = 1; number <= 4; number += 1) {
    const imageUrl = value[`card${number}ImageUrl`]
    const icon = value[`card${number}Icon`]
    const heading = value[`card${number}Heading`]
    const cardValue = value[`card${number}Value`]
    const linkText = value[`card${number}LinkText`]
    const linkUrl = value[`card${number}LinkUrl`]

    if (typeof imageUrl !== 'string' || imageUrl.length > 500 || (imageUrl && !imageUrl.startsWith('/uploads/'))) {
      throw createError({ statusCode: 400, statusMessage: `Invalid image for card ${number}` })
    }
    if (typeof icon !== 'string' || !cmsIconNames.has(icon)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid icon for card ${number}` })
    }
    if (typeof heading !== 'string' || !heading.trim() || heading.length > 60) {
      throw createError({ statusCode: 400, statusMessage: `Invalid heading for card ${number}` })
    }
    if (typeof cardValue !== 'string' || !cardValue.trim() || cardValue.length > 140) {
      throw createError({ statusCode: 400, statusMessage: `Invalid value for card ${number}` })
    }
    if (typeof linkText !== 'string' || !linkText.trim() || linkText.length > 40) {
      throw createError({ statusCode: 400, statusMessage: `Invalid link text for card ${number}` })
    }
    if (typeof linkUrl !== 'string' || linkUrl.length > 500 || !(/^(\/[^/]|\/($|\?))/.test(linkUrl) || /^https:\/\//i.test(linkUrl))) {
      throw createError({ statusCode: 400, statusMessage: `Invalid link destination for card ${number}` })
    }

    output[`card${number}ImageUrl`] = imageUrl
    output[`card${number}Icon`] = icon
    output[`card${number}Heading`] = heading.trim()
    output[`card${number}Value`] = cardValue.trim()
    output[`card${number}LinkText`] = linkText.trim()
    output[`card${number}LinkUrl`] = linkUrl.trim()
  }
  return output
}
