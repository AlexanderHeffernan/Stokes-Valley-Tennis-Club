export interface HomeSponsor {
  name: string
  imageUrl: string
  websiteUrl: string
  message: string
}

export interface HomeSponsorsContent {
  sponsors: HomeSponsor[]
}

export type HomeSponsorsFields = Record<string, string>

export function fieldsToHomeSponsors(fields: HomeSponsorsFields): HomeSponsorsContent {
  try {
    const sponsors = JSON.parse(fields.itemsJson || '[]')
    return {
      sponsors: Array.isArray(sponsors)
        ? sponsors.map(sponsor => ({ ...sponsor, message: sponsor.message || '' }))
        : []
    }
  } catch {
    return { sponsors: [] }
  }
}
