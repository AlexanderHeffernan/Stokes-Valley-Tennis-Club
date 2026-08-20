export interface ClubDay {
  name: string
  schedule: string
  note: string
  linkUrl: string
}

export interface HomeClubDaysContent {
  heading: string
  introduction: string
  days: ClubDay[]
}

export type HomeClubDaysFields = Record<string, string>

export function fieldsToHomeClubDays(fields: HomeClubDaysFields): HomeClubDaysContent {
  let days: ClubDay[] = []
  try {
    const parsed = JSON.parse(fields.daysJson || '[]')
    if (Array.isArray(parsed)) days = parsed
  } catch {
    // Invalid preview data is treated as an empty list until corrected.
  }
  return {
    heading: fields.heading || '',
    introduction: fields.introduction || '',
    days
  }
}
