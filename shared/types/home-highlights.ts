export interface HomeHighlightItem {
  icon: string
  heading: string
  text: string
  color: string
}

export interface HomeHighlightsContent {
  items: HomeHighlightItem[]
}

export type HomeHighlightsFields = Record<string, string>

export function fieldsToHomeHighlights(fields: HomeHighlightsFields): HomeHighlightsContent {
  return {
    items: Array.from({ length: 4 }, (_, index) => {
      const number = index + 1
      return {
        icon: fields[`item${number}Icon`] || 'users-three',
        heading: fields[`item${number}Heading`] || '',
        text: fields[`item${number}Text`] || '',
        color: fields[`item${number}Color`] || '#dadf3c'
      }
    })
  }
}
