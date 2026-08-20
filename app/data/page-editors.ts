import { cmsIconOptions } from '#shared/cms-icons'

export type EditorFieldType = 'text' | 'textarea' | 'image' | 'select' | 'color' | 'sponsors' | 'club-days'

export interface EditorFieldOption {
  label: string
  value: string
}

export interface EditorField {
  key: string
  label: string
  type: EditorFieldType
  maxLength?: number
  rows?: number
  help?: string
  options?: EditorFieldOption[]
}

export interface EditorFieldGroup {
  key: string
  label: string
  fields: EditorField[]
}

export interface PageEditorDefinition {
  route: string
  resource: string
  label: string
  fields: EditorField[]
  groups?: EditorFieldGroup[]
}

export const pageEditors: PageEditorDefinition[] = [
  {
    route: '*',
    resource: 'site-footer',
    label: 'Footer',
    fields: [
      { key: 'address', label: 'Address', type: 'textarea', maxLength: 240, rows: 3 },
      { key: 'email', label: 'Email address', type: 'text', maxLength: 254 },
      { key: 'phone', label: 'Phone number', type: 'text', maxLength: 40 },
      { key: 'facebookUrl', label: 'Facebook link', type: 'text', maxLength: 500 },
      { key: 'ctaHeading', label: 'CTA heading', type: 'text', maxLength: 80 },
      { key: 'ctaText', label: 'CTA text', type: 'textarea', maxLength: 240, rows: 4 }
    ]
  },
  {
    route: '/',
    resource: 'home-hero',
    label: 'Hero',
    fields: [
      { key: 'headline1', label: 'Headline, first line', type: 'text', maxLength: 90 },
      { key: 'headline2', label: 'Headline, highlighted line', type: 'text', maxLength: 90 },
      { key: 'subheading', label: 'Subheading', type: 'textarea', maxLength: 300, rows: 5 },
      {
        key: 'imageUrl',
        label: 'Hero image',
        type: 'image',
        help: 'JPEG, PNG or WebP, up to 8 MB'
      }
    ]
  },
  {
    route: '/',
    resource: 'home-highlights',
    label: 'Features',
    fields: [],
    groups: Array.from({ length: 4 }, (_, index) => {
      const number = index + 1
      return {
        key: `feature-${number}`,
        label: `Feature ${number}`,
        fields: [
          { key: `item${number}Icon`, label: 'Icon', type: 'select' as const, options: [...cmsIconOptions] },
          { key: `item${number}Heading`, label: 'Heading', type: 'text' as const, maxLength: 60 },
          { key: `item${number}Text`, label: 'Text', type: 'textarea' as const, maxLength: 180, rows: 3 },
          { key: `item${number}Color`, label: 'Colour', type: 'color' as const }
        ]
      }
    })
  },
  {
    route: '/',
    resource: 'home-club-days',
    label: 'Club days',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', maxLength: 80 },
      { key: 'introduction', label: 'Introduction', type: 'textarea', maxLength: 240, rows: 3 },
      { key: 'daysJson', label: 'Sessions', type: 'club-days' }
    ]
  },
  {
    route: '/',
    resource: 'home-explore',
    label: 'Explore cards',
    fields: [],
    groups: Array.from({ length: 4 }, (_, index) => {
      const number = index + 1
      return {
        key: `card-${number}`,
        label: `Card ${number}`,
        fields: [
          { key: `card${number}ImageUrl`, label: 'Image', type: 'image' as const, help: 'JPEG, PNG or WebP, up to 8 MB' },
          { key: `card${number}Icon`, label: 'Icon', type: 'select' as const, options: [...cmsIconOptions] },
          { key: `card${number}Heading`, label: 'Heading', type: 'text' as const, maxLength: 60 },
          { key: `card${number}Value`, label: 'Value', type: 'textarea' as const, maxLength: 140, rows: 3 },
          { key: `card${number}LinkText`, label: 'Link text', type: 'text' as const, maxLength: 40 },
          { key: `card${number}LinkUrl`, label: 'Link destination', type: 'text' as const, maxLength: 500, help: 'Use /page for this website or a full https:// URL' }
        ]
      }
    })
  },
  {
    route: '/',
    resource: 'home-sponsors',
    label: 'Sponsors',
    fields: [
      { key: 'itemsJson', label: 'Sponsor logos', type: 'sponsors' }
    ]
  }
]

export const getPageEditors = (path: string) => pageEditors
  .filter(editor => editor.route === path || editor.route === '*')
  .sort((left, right) => Number(left.route === '*') - Number(right.route === '*'))
