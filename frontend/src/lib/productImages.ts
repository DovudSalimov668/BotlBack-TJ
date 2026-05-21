const BRAND_MAP: Record<string, string> = {
  'coca-cola zero': '/products/coca-cola-zero.jpg',
  'zero':           '/products/coca-cola-zero.jpg',
  'fanta':          '/products/fanta.jpg',
  'sprite':         '/products/sprite.jpg',
  'bonaqua':        '/products/bonaqua.jpg',
  'bon aqua':       '/products/bonaqua.jpg',
  'fuse':           '/products/fuse-tea.jpg',
  'fuse tea':       '/products/fuse-tea.jpg',
  'coca-cola':      '/products/coca-cola.jpg',
  'coke':           '/products/coca-cola.jpg',
}

export function getProductImage(skuNameOrBrand: string | undefined | null): string {
  if (!skuNameOrBrand) return '/products/coca-cola.jpg'
  const lower = skuNameOrBrand.toLowerCase()
  for (const key of Object.keys(BRAND_MAP).sort((a, b) => b.length - a.length)) {
    if (lower.includes(key)) return BRAND_MAP[key]
  }
  return '/products/coca-cola.jpg'
}
