export const REGIONS = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs'] as const
export type Region = typeof REGIONS[number]

export const REGION_COLORS: Record<string, string> = {
  dushanbe: '#F40009',
  sughd:    '#FF6B35',
  khatlon:  '#FFB800',
  gbao:     '#00A651',
  rrs:      '#0066CC',
}

export const REGION_NAMES: Record<string, string> = {
  dushanbe: 'Душанбе',
  sughd:    'Согд',
  khatlon:  'Хатлон',
  gbao:     'ГБАО',
  rrs:      'РРС',
}

export const CHART_COLORS = ['#F40009', '#FF6B35', '#FFB800', '#00A651', '#6C63FF']
