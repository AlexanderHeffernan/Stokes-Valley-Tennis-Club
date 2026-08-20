export interface NavigationChild {
  label: string
  to: string
}

export interface NavigationItem {
  label: string
  to: string
  children?: NavigationChild[]
}

export const navigationItems: NavigationItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'Juniors',
    to: '/juniors',
    children: [
      { label: 'Junior Coaching', to: '/juniors/coaching' },
      { label: 'Junior Interclub Training', to: '/juniors/interclub-training' },
      { label: 'Junior Interclub', to: '/juniors/interclub' },
      { label: 'Newsletters and Reports', to: '/juniors/newsletters-and-reports' }
    ]
  },
  { label: 'Seniors', to: '/seniors' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]
