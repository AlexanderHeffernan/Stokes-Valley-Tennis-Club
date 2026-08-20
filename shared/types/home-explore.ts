export interface HomeExploreCard {
  imageUrl: string
  icon: string
  heading: string
  value: string
  linkText: string
  linkUrl: string
}

export interface HomeExploreContent {
  cards: HomeExploreCard[]
}

export type HomeExploreFields = Record<string, string>

export function fieldsToHomeExplore(fields: HomeExploreFields): HomeExploreContent {
  return {
    cards: Array.from({ length: 4 }, (_, index) => {
      const number = index + 1
      return {
        imageUrl: fields[`card${number}ImageUrl`] || '',
        icon: fields[`card${number}Icon`] || 'tennis-ball',
        heading: fields[`card${number}Heading`] || '',
        value: fields[`card${number}Value`] || '',
        linkText: fields[`card${number}LinkText`] || '',
        linkUrl: fields[`card${number}LinkUrl`] || '/'
      }
    })
  }
}
