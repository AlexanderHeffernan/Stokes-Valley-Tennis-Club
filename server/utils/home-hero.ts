import type { HomeHeroContent, HomeHeroEditorData } from '#shared/types/home-hero'
import { db } from './db'

interface HomeHeroRow {
  draft_headline_1: string
  draft_headline_2: string
  draft_subheading: string
  draft_image_url: string
  published_headline_1: string
  published_headline_2: string
  published_subheading: string
  published_image_url: string
  updated_at: string | null
  published_at: string | null
}

export function getHomeHeroRow(): HomeHeroRow {
  return db.prepare('SELECT * FROM home_hero WHERE id = 1').get() as HomeHeroRow
}

const contentFromRow = (row: HomeHeroRow, prefix: 'draft' | 'published'): HomeHeroContent => ({
  headline1: row[`${prefix}_headline_1`],
  headline2: row[`${prefix}_headline_2`],
  subheading: row[`${prefix}_subheading`],
  imageUrl: row[`${prefix}_image_url`]
})

export function getPublishedHomeHero(): HomeHeroContent {
  return contentFromRow(getHomeHeroRow(), 'published')
}

export function getHomeHeroEditorData(): HomeHeroEditorData {
  const row = getHomeHeroRow()
  return {
    content: contentFromRow(row, 'published'),
    publishedAt: row.published_at
  }
}

export function validateHomeHero(input: unknown): HomeHeroContent {
  if (!input || typeof input !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid hero content' })
  const value = input as Record<string, unknown>

  const field = (name: keyof HomeHeroContent, maxLength: number) => {
    const result = value[name]
    if (typeof result !== 'string' || !result.trim() || result.length > maxLength) {
      throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` })
    }
    return result.trim()
  }

  const imageValue = value.imageUrl
  if (typeof imageValue !== 'string' || imageValue.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid imageUrl' })
  }
  const imageUrl = imageValue.trim()
  if (imageUrl && !imageUrl.startsWith('/images/') && !imageUrl.startsWith('/uploads/')) {
    throw createError({ statusCode: 400, statusMessage: 'Images must be uploaded through the CMS' })
  }

  return {
    headline1: field('headline1', 90),
    headline2: field('headline2', 90),
    subheading: field('subheading', 300),
    imageUrl
  }
}
