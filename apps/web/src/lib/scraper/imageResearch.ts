import * as cheerio from 'cheerio'

export const IMAGE_RESEARCH_BRANDS = [
  'Dixon',
  'Eaton Aeroquip',
  'Bosch Rexroth',
  'HYDAC',
  'Yuken',
] as const

const SEARCH_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36'
const IMAGE_TIMEOUT_MS = 20_000
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export type ResearchProduct = {
  id: string
  sku: string
  mpn: string | null
  title: string
  slug: string
  brandId: string | null
  brandName: string | null
  categoryId: string | null
  categoryName: string | null
}

export type ImageSearchResult = {
  title: string
  image: string
  thumbnail?: string
  url: string
  width?: number
  height?: number
  score?: number
}

export type ResearchedProduct = {
  product: ResearchProduct
  query: string
  candidates: ImageSearchResult[]
  selected: ImageSearchResult | null
  selectionMethod?: 'exact-search' | 'family-reuse' | 'relevant-search' | 'curated-override'
}

type DuckDuckGoResponse = {
  results?: Array<{
    title?: string
    image?: string
    thumbnail?: string
    url?: string
    width?: number
    height?: number
  }>
}

export function buildImageSearchQuery(product: ResearchProduct): string {
  const brand = product.brandName ?? ''
  const model = preferredModelToken(product)
  const title = product.title
    .replace(new RegExp(`^${escapeRegExp(brand)}\\s*`, 'i'), '')
    .replace(/[—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (brand === 'Dixon' && model) {
    return `Dixon ${model} ${title.replace(/^Dixon\s+/i, '')}`.trim()
  }
  if (model) return `${brand} ${model} ${title}`.replace(/\s+/g, ' ').trim()
  return `${brand} ${title}`.replace(/\s+/g, ' ').trim()
}

export function rankImageResults(
  product: ResearchProduct,
  results: ImageSearchResult[],
): ImageSearchResult[] {
  return results
    .filter((result) => isHttpUrl(result.image))
    .map((result) => ({ ...result, score: scoreImageResult(product, result) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function scoreImageResult(product: ResearchProduct, result: ImageSearchResult): number {
  const haystack = normalize(`${result.title} ${result.url} ${result.image}`)
  const brand = normalize(product.brandName ?? '')
  const model = normalize(preferredModelToken(product) ?? '')
  const titleTokens = meaningfulTokens(product.title)
  let score = 0

  if (brand && haystack.includes(brand)) score += 18
  if (model && haystack.includes(model)) score += 48

  const overlaps = titleTokens.filter((token) => haystack.includes(token))
  score += Math.min(overlaps.length * 4, 24)

  if ((result.width ?? 0) >= 600 && (result.height ?? 0) >= 400) score += 6
  if (preferredSource(result.url, product.brandName)) score += 10
  if (/logo|icon|banner|linkedin|facebook|instagram|youtube/i.test(result.title + result.image)) {
    score -= 30
  }
  if (/watermark/i.test(result.image)) score -= 8
  return score
}

export function preferredModelToken(product: ResearchProduct): string | null {
  if (product.mpn?.trim()) return product.mpn.trim()

  const prefixes = ['IH-IH-', 'EATON-', 'IH-']
  let sku = product.sku
  for (const prefix of prefixes) {
    if (sku.startsWith(prefix)) {
      sku = sku.slice(prefix.length)
      break
    }
  }

  const genericSku = /^(HOSE|CYL|PP|TEST)-/i.test(sku)
  return genericSku || sku.length < 3 ? null : sku
}

export async function researchProductImages(
  product: ResearchProduct,
  fetchImpl: typeof fetch = fetch,
): Promise<ResearchedProduct> {
  const query = buildImageSearchQuery(product)
  const results = await searchDuckDuckGoImages(query, fetchImpl)
  const ranked = rankImageResults(product, results)

  const verified: ImageSearchResult[] = []
  for (const candidate of ranked.slice(0, 8)) {
    const probe = await probeImage(candidate.image, fetchImpl)
    if (!probe.ok) continue
    verified.push({
      ...candidate,
      width: candidate.width,
      height: candidate.height,
    })
    if (verified.length >= 4) break
  }

  const selected = verified.find((candidate) => (candidate.score ?? 0) >= 42) ?? null
  return {
    product,
    query,
    candidates: verified,
    selected,
    selectionMethod: selected ? 'exact-search' : undefined,
  }
}

const CURATED_IMAGE_OVERRIDES: Record<
  string,
  {
    title: string
    image: string
    thumbnail?: string
    url: string
    width?: number
    height?: number
  }
> = {
  'IH-IH-BULKSTREAM': {
    title: 'Representative hand-built bulk cargo hose assemblies',
    image:
      'https://cdn11.bigcommerce.com/s-x3ki4mm/products/1381/images/2074/Bulk_Cargo_Hose_Loading_Hose_Industrial_Hose__35046.1580378414.380.500.jpg?c=2',
    url: 'https://www.gz-supplies.com/bulk-cargo-hose-loading-hose-industrial-hose/',
    width: 380,
    height: 500,
  },
  'IH-IH-A430': {
    title: 'Dixon A430 petrol and oil suction and delivery hose',
    image: 'https://cdn.shopify.com/s/files/1/0561/7460/8451/products/A430.jpg?v=1663312955',
    url: 'https://zorroaustralia.com.au/products/dixon-a430-rubber-petrol-oil-suction-delivery-hose',
  },
  'IH-IH-A460': {
    title: 'Representative Dixon oil suction and delivery hose',
    image: 'https://cdn.shopify.com/s/files/1/0561/7460/8451/products/A430.jpg?v=1663312955',
    url: 'https://zorroaustralia.com.au/products/dixon-a430-rubber-petrol-oil-suction-delivery-hose',
  },
  'IH-IH-A361': {
    title: 'Representative bulk material suction and delivery hose assemblies',
    image:
      'https://cdn11.bigcommerce.com/s-x3ki4mm/products/1381/images/2074/Bulk_Cargo_Hose_Loading_Hose_Industrial_Hose__35046.1580378414.380.500.jpg?c=2',
    url: 'https://www.gz-supplies.com/bulk-cargo-hose-loading-hose-industrial-hose/',
    width: 380,
    height: 500,
  },
  'IH-IH-SANSIL': {
    title: 'Representative transparent stainless-steel helix silicone hose',
    image: 'https://www.cjanfluid.com/uploads/image/20250427/15/tso.jpg',
    url: 'https://www.cjanfluid.com/products/silicone-hoses/transparent-stainless-steel-helix-reinforced-silic.html',
  },
  'IH-IH-IRRIBULK': {
    title: 'Representative PVC suction and delivery hose',
    image:
      'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/product-images/products/1a9a1c10-a91c-4b4e-bbcd-ac5138339ac8/food-bulk-pvc-suction-delivery-hose-1.jpg',
    url: 'https://indus-hydraulics.vercel.app/p/food-bulk-pvc-suction-delivery-hose',
  },
  'IH-IH-DELVAC': {
    title: 'Representative PVC suction and delivery hose',
    image:
      'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/product-images/products/1a9a1c10-a91c-4b4e-bbcd-ac5138339ac8/food-bulk-pvc-suction-delivery-hose-1.jpg',
    url: 'https://indus-hydraulics.vercel.app/p/food-bulk-pvc-suction-delivery-hose',
  },
  'IH-IH-A400EU': {
    title: 'Representative Dixon oil, mud and sea water suction hose',
    image: 'https://cdn.shopify.com/s/files/1/0561/7460/8451/products/A430.jpg?v=1663312955',
    url: 'https://zorroaustralia.com.au/products/dixon-a430-rubber-petrol-oil-suction-delivery-hose',
  },
  'IH-IH-A410': {
    title: 'Dixon A410 UHMWPE chemical suction and delivery hose',
    image:
      'http://zorroaustralia.com.au/cdn/shop/products/A410_c390dfbf-3f6e-44e5-9b0e-b4c50d6cbdd0_600x.png?v=1663312987',
    url: 'https://zorroaustralia.com.au/products/dixon-a410-rubber-uhmw-polyethylene-suction-delivery-acid-chemical-hose',
    width: 600,
    height: 600,
  },
  'IH-IH-A104': {
    title: 'Dixon A104 red non-conductive multi-purpose hose',
    image: 'https://cdn.shopify.com/s/files/1/0561/7460/8451/products/A104.jpg?v=1663313078',
    url: 'https://zorroaustralia.com.au/products/dixon-a104-rubber-multi-purpose-non-conductive-hose-in-red',
  },
  'IH-IH-GSM-HOSE': {
    title: 'Dixon GSM ball-joint armored hose assembly',
    image:
      'https://www.dixonvalve.com.cn/product_images/20230301/GSM_Ball-Joint_Armored_Hose_Assemblies.jpg',
    url: 'https://www.dixonvalve.com.cn/Product_dynamic/Dixon_Cam.html',
    width: 800,
    height: 800,
  },
  'IH-IH-A906PG': {
    title: 'Representative chemical composite hose assembly',
    image: 'https://www.compositehose.org/images/chemical-composite-hose.jpg',
    url: 'https://www.compositehose.org/composite-hose/chemical-composite-hose.html',
  },
  'IH-IH-A901GG': {
    title: 'Representative petroleum suction and discharge composite hoses',
    image: 'https://www.compositehose.org/img/suction-discharge-composite-hose-list.jpg',
    url: 'https://www.compositehose.org/composite-hose/petroleum-composite-hose.html',
  },
  'IH-IH-A901AG': {
    title: 'Representative vapour recovery composite hose assembly',
    image: 'https://www.compositehose.org/hose/vapor-recovery-composite-hose-blue.jpg',
    url: 'https://www.compositehose.org/composite-hose/vapor-recovery-composite-hose.html',
  },
  'IH-IH-A911SG': {
    title: 'Representative PTFE composite hose assembly',
    image: 'https://www.compositehose.org/img/ptfe-composite-hose-1.jpg',
    url: 'https://www.compositehose.org/composite-hose/ptfe-composite-hose.html',
  },
  'IH-IH-METALLIC-ADFLEX': {
    title: 'Dixon Adflex corrugated metallic hose',
    image: 'https://img.directindustry.com/images_di/photo-g/40584-20499293.jpg',
    url: 'https://www.directindustry.com/prod/dixon-group-europe/product-40584-2762624.html',
    width: 498,
    height: 520,
  },
  'IH-IH-METALLIC-HP-THP': {
    title: 'High-pressure corrugated metallic hose assembly',
    image:
      'https://africanhosesolutions.co.za/wp-content/uploads/2024/08/A-AFRICAN-HOSE-SOLUTIONS-HOSE-Stainless-Steel-Corrugated-Metallic-Hose-768x768.jpg',
    url: 'https://africanhosesolutions.co.za/products/',
    width: 768,
    height: 768,
  },
  'IH-IH-METALLIC-HYPARFLEX': {
    title: 'Close-pitch corrugated metallic hose assembly',
    image:
      'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/product-images/products/f1a1828e-be8c-4b8b-8f45-1b341c7a900f/adflex-commercial-grade-metallic-hose-1.jpg',
    url: 'https://indus-hydraulics.vercel.app/p/adflex-commercial-grade-metallic-hose',
  },
  'IH-IH-METALLIC-SUPARFLEX': {
    title: 'Standard-pitch corrugated metallic hose assembly',
    image:
      'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/product-images/products/f1a1828e-be8c-4b8b-8f45-1b341c7a900f/adflex-commercial-grade-metallic-hose-1.jpg',
    url: 'https://indus-hydraulics.vercel.app/p/adflex-commercial-grade-metallic-hose',
  },
  'IH-PP-11KW-30-DS': {
    title: 'Bosch Rexroth standard hydraulic power unit',
    image:
      'https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/product_group_1/industrial_hydraulics/topics/product_groups/power_units/portfolio/abskg_8x9_640x720.jpg',
    url: 'https://www.boschrexroth.com/en/ca/products/product-groups/industrial-hydraulics/power-units/',
    width: 640,
    height: 720,
  },
  'EATON-FD14': {
    title: 'Danfoss FD14 FLOCS quick-disconnect oil drain coupling',
    image:
      'https://assets.danfoss.com/drawings/preview/latest/224886/ID436762722213-0101_preview.jpg',
    url: 'https://powersource.danfoss.com/products/hoses-and-fittings/connectors-and-quick-disconnect-couplings/danfoss-hansen-quick-disconnect-couplings/fast-lube-oil-change-system--flocs-/p/FD14-1001-12-06',
  },
  'EATON-5600-NON-VALVED': {
    title: 'Eaton Aeroquip 5600 Series hydraulic quick coupling',
    image: 'https://www.zoro.com/static/cms/product/large/Z-1ws_fo5oy.JPG',
    url: 'https://www.zoro.com/eaton-aeroquip-hydraulic-quick-connect-hose-coupling-steel-body-sleeve-lock-14-18-thread-size-5600-series-5601-4-4s/i/G1868675/',
    width: 600,
    height: 600,
  },
  'EATON-5600-VALVED': {
    title: 'Eaton Aeroquip 5600 Series valved hydraulic quick coupling',
    image:
      'https://www.kvmtools.com/cdn/shop/files/2F539_AS01-623587_1200x1200.jpg?v=1715270935',
    url: 'https://www.kvmtools.com/products/aeroquip-5602-6-6s-hydraulic-quick-connect-hose-coupling-3-8-in-coupling-size-steel-6-lpm-max-flow-rate',
    width: 1200,
    height: 1200,
  },
  'EATON-5100': {
    title: 'Eaton Aeroquip 5100 Series brass thread-to-connect coupling',
    image: 'https://www.zoro.com/static/cms/product/large/Z-1wrwfo5oy.JPG',
    url: 'https://www.zoro.com/eaton-aeroquip-hydraulic-quick-connect-hose-coupling-brass-body-thread-to-connect-lock-1-11-12-thread-size-5100-s2-16b/i/G2821621/',
    width: 474,
    height: 474,
  },
  'EATON-FD70-FD76': {
    title: 'Danfoss FD72/FD76 ISO 5675 agricultural coupling',
    image:
      'https://www.robeckfluidpower.com/images/thumbs/0150644_fd76-1010-08-10_280.jpeg',
    url: 'https://www.robeckfluidpower.com/fd72fd76-series-connect-under-pressure-farm-iso-5675-interchange',
    width: 280,
    height: 280,
  },
  'EATON-FD48': {
    title: 'Danfoss FD48 Parker Bruning interchange quick coupling',
    image:
      'https://cdn11.bigcommerce.com/s-n1c4dcm3qb/products/52681/images/106078/isometric_imagel_500x500_72_fd48-1002-04-04500x500_72dpi__33771.1697510498.386.513.jpg?c=1',
    url: 'https://sadlerpowertrain.com/FD48-1002-04-04_EATON-WEATHERHEAD_FARM-COUPLING-MALE-HALF/',
    width: 386,
    height: 513,
  },
  'EATON-FD31': {
    title: 'Representative 10,000 psi Enerpac-interchange hydraulic jack coupler',
    image:
      'https://www.akjia.com/wp-content/uploads/2025/01/3-8-ISO-14540-high-pressure-10000-psi-screw-to-connect-hydraulic-jack-quick-couplings-with-dust-caps.webp',
    url: 'https://www.akjia.com/product/3-8-high-duty-10000-psi-quick-connect-coupling-coupler-w-dust-caps-interchangeable-with-parker-3000-replaces-enerpac-c-604/',
    width: 1000,
    height: 1000,
  },
  'EATON-FD83': {
    title: 'Danfoss FD83 full-flow thermal management quick coupling',
    image:
      'https://assets.danfoss.com/drawings/preview/latest/493695/ID525932519682-0101_preview.jpg',
    url: 'https://powersource.danfoss.com/products/hoses-and-fittings/specialty-applications/data-centers/thermal-management-quick-disconnect-couplings/p/FD83-2052-16-16',
  },
  'IH-WC-120-80-600': {
    title: 'Parker RDH heavy-duty welded hydraulic cylinder',
    image: 'https://www.motionfluid.in/parker/hydraulics/hydraulic-cylinders/rdh-series.jpg',
    url: 'https://www.motionfluid.in/parker-hydraulic-cylinders.php',
    width: 1000,
    height: 700,
  },
  'IH-SB330-10A1': {
    title: 'HYDAC SB330 bladder accumulator',
    image: 'https://www.deka-hydraulic.com/u_file/2302/products/13/2c4802fd03.jpg',
    url: 'https://www.deka-hydraulic.com/products/hydac-accumulator-sb330-10a1-112a9-330a',
    width: 640,
    height: 640,
  },
  'IH-SB330-4A1': {
    title: 'Representative HYDAC SB330 bladder accumulator family',
    image: 'http://www.51082159.cn/image/product/hydac/accumulators-sb.gif',
    url: 'http://www.51082159.cn/hydac/accumulators-sb.htm',
    width: 280,
    height: 200,
  },
}

export function resolveImageSelections(rows: ResearchedProduct[]): ResearchedProduct[] {
  const resolved = rows.map((row) => ({ ...row }))

  for (const row of resolved) {
    const override = CURATED_IMAGE_OVERRIDES[row.product.sku]
    if (!override) continue
    row.selected = { ...override, score: 100 }
    row.selectionMethod = 'curated-override'
  }

  for (const row of resolved) {
    if (row.selected) continue
    const donor = bestFamilyDonor(row, resolved)
    if (donor?.selected) {
      row.selected = {
        ...donor.selected,
        title: `${row.product.title} - representative family image`,
        score: donor.selected.score,
      }
      row.selectionMethod = 'family-reuse'
      continue
    }

    const relevant = row.candidates.find((candidate) => isProductTypeRelevant(row.product, candidate))
    if (relevant) {
      row.selected = relevant
      row.selectionMethod = 'relevant-search'
    }
  }
  return resolved
}

export async function searchDuckDuckGoImages(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ImageSearchResult[]> {
  const encoded = encodeURIComponent(query)
  const searchUrl = `https://duckduckgo.com/?q=${encoded}&iax=images&ia=images`
  const search = await fetchWithTimeout(fetchImpl, searchUrl, {
    headers: { 'user-agent': SEARCH_USER_AGENT, accept: 'text/html' },
  })
  if (!search.ok) throw new Error(`Image search failed with HTTP ${search.status}`)
  const html = await search.text()
  const vqd = extractVqd(html)
  if (!vqd) throw new Error('Image search token was not present in the response')

  const apiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encoded}&vqd=${encodeURIComponent(vqd)}`
  const response = await fetchWithTimeout(fetchImpl, apiUrl, {
    headers: {
      'user-agent': SEARCH_USER_AGENT,
      accept: 'application/json',
      referer: 'https://duckduckgo.com/',
    },
  })
  if (!response.ok) throw new Error(`Image results failed with HTTP ${response.status}`)
  const payload = (await response.json()) as DuckDuckGoResponse

  return (payload.results ?? [])
    .filter(
      (item): item is Required<Pick<ImageSearchResult, 'title' | 'image' | 'url'>> &
        Omit<ImageSearchResult, 'title' | 'image' | 'url'> =>
        typeof item.title === 'string' &&
        typeof item.image === 'string' &&
        typeof item.url === 'string',
    )
    .map((item) => ({
      title: item.title,
      image: item.image,
      thumbnail: item.thumbnail,
      url: item.url,
      width: item.width,
      height: item.height,
    }))
}

export function extractWebSearchResults(html: string): Array<{ title: string; url: string }> {
  const $ = cheerio.load(html)
  const results: Array<{ title: string; url: string }> = []
  $('a.result__a').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    try {
      const redirect = new URL(href, 'https://duckduckgo.com')
      const target = redirect.searchParams.get('uddg')
      if (!target || !isHttpUrl(target)) return
      results.push({ title: $(element).text().trim(), url: target })
    } catch {
      // Ignore malformed result URLs.
    }
  })
  return results
}

function extractVqd(html: string): string | null {
  return html.match(/\bvqd=["']?([^&"'\s]+)/)?.[1] ?? null
}

async function probeImage(
  url: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; contentType?: string; bytes?: number }> {
  try {
    const head = await fetchWithTimeout(fetchImpl, url, {
      method: 'HEAD',
      headers: { 'user-agent': SEARCH_USER_AGENT, accept: 'image/*' },
    })
    const contentType = head.headers.get('content-type')?.split(';')[0]?.toLowerCase()
    const bytes = numericHeader(head.headers.get('content-length'))
    if (head.ok && acceptedImage(contentType, bytes)) return { ok: true, contentType, bytes }
  } catch {
    // Some image CDNs reject HEAD. Try a small range request.
  }

  try {
    const get = await fetchWithTimeout(fetchImpl, url, {
      headers: {
        'user-agent': SEARCH_USER_AGENT,
        accept: 'image/*',
        range: 'bytes=0-1023',
      },
    })
    const contentType = get.headers.get('content-type')?.split(';')[0]?.toLowerCase()
    const bytes = numericHeader(get.headers.get('content-length'))
    return { ok: get.ok && acceptedImage(contentType, bytes), contentType, bytes }
  } catch {
    return { ok: false }
  }
}

function acceptedImage(contentType: string | undefined, bytes: number | undefined): boolean {
  if (!contentType || !ACCEPTED_IMAGE_MIME.has(contentType)) return false
  return bytes == null || bytes <= MAX_IMAGE_BYTES
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timeout)
  }
}

function meaningfulTokens(value: string): string[] {
  const ignored = new Set([
    'and',
    'bar',
    'bosch',
    'dixon',
    'eaton',
    'hose',
    'hydac',
    'hydraulic',
    'product',
    'rexroth',
    'the',
    'yuken',
  ])
  return Array.from(
    new Set(
      normalize(value)
        .split(' ')
        .filter((token) => token.length >= 3 && !ignored.has(token)),
    ),
  )
}

function bestFamilyDonor(
  target: ResearchedProduct,
  rows: ResearchedProduct[],
): ResearchedProduct | null {
  const targetTokens = meaningfulTokens(target.product.title)
  let best: { row: ResearchedProduct; score: number } | null = null
  for (const candidate of rows) {
    if (!candidate.selected || candidate.product.id === target.product.id) continue
    if (candidate.product.brandName !== target.product.brandName) continue
    if (candidate.product.categoryId !== target.product.categoryId) continue
    const candidateTokens = new Set(meaningfulTokens(candidate.product.title))
    const overlap = targetTokens.filter((token) => candidateTokens.has(token)).length
    if (!best || overlap > best.score) best = { row: candidate, score: overlap }
  }
  return best && best.score >= 2 ? best.row : null
}

function isProductTypeRelevant(product: ResearchProduct, candidate: ImageSearchResult): boolean {
  const types = [
    'accumulator',
    'coupler',
    'coupling',
    'cylinder',
    'filter',
    'fitting',
    'hose',
    'pack',
    'pump',
    'valve',
  ]
  const productText = normalize(`${product.title} ${product.categoryName ?? ''}`)
  const candidateText = normalize(`${candidate.title} ${candidate.url} ${candidate.image}`)
  const productTypes = types.filter((type) => productText.includes(type))
  return productTypes.length === 0 || productTypes.some((type) => candidateText.includes(type))
}

function preferredSource(url: string, brand: string | null): boolean {
  const host = safeHostname(url)
  const brandKey = normalize(brand ?? '').replace(/\s+/g, '')
  if (!host) return false
  if (brandKey === 'dixon' && host.includes('dixon')) return true
  if (brandKey === 'eatonaeroquip' && /(eaton|danfoss|aeroquip|robeck)/.test(host)) return true
  if (brandKey === 'boschrexroth' && /(boschrexroth|buyrexroth|rexroth)/.test(host)) return true
  if (brandKey === 'hydac' && host.includes('hydac')) return true
  if (brandKey === 'yuken' && host.includes('yuken')) return true
  if (brandKey === 'parkerhannifin' && host.includes('parker')) return true
  return false
}

function safeHostname(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function numericHeader(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
