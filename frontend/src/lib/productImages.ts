// Maps brand/sku name keywords → local product image path
const BRAND_MAP: Record<string, string> = {
  'coca-cola zero': '/products/coca-cola-zero.svg',
  'zero':          '/products/coca-cola-zero.svg',
  'fanta':         '/products/fanta.svg',
  'sprite':        '/products/sprite.svg',
  'bonaqua':       '/products/bonaqua.svg',
  'bon aqua':      '/products/bonaqua.svg',
  'fuse':          '/products/fuse-tea.svg',
  'fuse tea':      '/products/fuse-tea.svg',
  'coca-cola':     '/products/coca-cola.svg',
  'coke':          '/products/coca-cola.svg',
}

export function getProductImage(skuNameOrBrand: string | undefined | null): string {
  if (!skuNameOrBrand) return '/products/coca-cola.svg'
  const lower = skuNameOrBrand.toLowerCase()
  // Try longest match first
  for (const key of Object.keys(BRAND_MAP).sort((a, b) => b.length - a.length)) {
    if (lower.includes(key)) return BRAND_MAP[key]
  }
  return '/products/coca-cola.svg'
}
