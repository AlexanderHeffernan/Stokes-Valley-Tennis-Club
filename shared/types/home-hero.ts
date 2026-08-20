export interface HomeHeroContent {
  headline1: string
  headline2: string
  subheading: string
  imageUrl: string
}

export interface HomeHeroEditorData {
  content: HomeHeroContent
  publishedAt: string | null
}
