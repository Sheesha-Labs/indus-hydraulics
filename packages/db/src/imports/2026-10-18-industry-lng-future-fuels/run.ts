/**
 * LNG & Future Fuels industry page (/industries/lng-future-fuels), 2026-10-18.
 *
 * Gathers the MannTek LNG / future-fuel range on one page: the coupling families that are listed as products
 * (featured), and the bunkering equipment MannTek sells around them (VSD, transfer hose, hose saddles, fall
 * arrest, purge lines, insulation flanges, heated parking…), which is too thin to list as products and is
 * quoted to order. Facts come from manntek.se (fetched 2026-10-17); the stats are MannTek's published figures,
 * not business claims.
 *
 * Images (MannTek field photos, already used on the DCC listings) live outside the repo, in --image-dir.
 * Idempotent: upserts the industry by slug, and reuses an uploaded image matched on originalFilename.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-18-industry-lng-future-fuels/run.ts \
 *     --image-dir=<folder> [--dry-run] [--publish]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()
const WEB_ENV = resolve(__dirname, '../../../../../apps/web/.env.local')
const BUCKET = 'product-images'

type Content = {
  slug: string
  name: string
  position: number
  tagline: string
  headline: string
  breadcrumb: string
  description: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  chips: string[]
  stats: { value: string; label: string }[]
  deliveryAreas: { category: string; title: string; description: string; skuCount: string }[]
  supportBlock: Record<string, unknown> & { imageFile: string; imageAlt: string }
  hero: { file: string; alt: string }
  featuredProductSkus: string[]
  featuredCategorySlugs: string[]
}

function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m || process.env[m[1]!]) continue
    process.env[m[1]!] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

function slug(s: string): string {
  return s.normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 80)
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const publish = argv.includes('--publish')
  const imageDir = argv.find((a) => a.startsWith('--image-dir='))?.slice('--image-dir='.length)
  if (!imageDir || !existsSync(imageDir)) throw new Error('--image-dir=<folder> is required')
  const c: Content = JSON.parse(readFileSync(join(__dirname, 'content.json'), 'utf8'))

  const problems: string[] = []
  for (const f of [c.hero.file, c.supportBlock.imageFile]) {
    if (!existsSync(join(imageDir, f))) problems.push(`image missing: ${f}`)
  }
  const keys = c.deliveryAreas.map((a) => a.category)
  if (new Set(keys).size !== keys.length) problems.push('deliveryAreas categories must be unique (they are React keys)')
  const live = await db.product.findMany({ where: { sku: { in: c.featuredProductSkus }, status: 'active' }, select: { sku: true } })
  for (const s of c.featuredProductSkus) if (!live.some((p) => p.sku === s)) problems.push(`featured SKU not active: ${s}`)
  if (c.seoDescription.length > 160) problems.push(`seoDescription ${c.seoDescription.length} chars`)
  if (problems.length) {
    for (const p of problems) console.log(`  ! ${p}`)
    throw new Error(`${problems.length} problems — nothing written`)
  }
  const existing = await db.industry.findUnique({ where: { slug: c.slug }, select: { id: true } })
  if (dryRun) {
    console.log(`[dry-run] ${existing ? 'update' : 'create'} industry ${c.slug}; ${c.deliveryAreas.length} areas, ` +
      `${c.featuredProductSkus.length} featured products${publish ? ', publish' : ''}`)
    return db.$disconnect()
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  async function media(file: string, alt: string) {
    const found = await db.media.findFirst({ where: { originalFilename: file, alt }, select: { id: true, storagePath: true } })
    if (found) return found
    const buf = readFileSync(join(imageDir!, file))
    const key = `industries/${c.slug}/${slug(alt)}.jpg`
    const { error } = await sb.storage.from(BUCKET).upload(key, buf, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true })
    if (error) throw new Error(`upload ${file}: ${error.message}`)
    const url = sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
    const size = jpegSize(buf)
    return db.media.create({
      data: {
        kind: 'image', mimeType: 'image/jpeg', originalFilename: file, storagePath: url, bytes: buf.byteLength,
        width: size?.width ?? null, height: size?.height ?? null, alt,
        caption: 'MannTek website, Downloads > Application photos (fetched 2026-10-17). Maker field photo, authorised distributor.',
      },
      select: { id: true, storagePath: true },
    })
  }
  const hero = await media(c.hero.file, c.hero.alt)
  const support = await media(c.supportBlock.imageFile, c.supportBlock.imageAlt)
  const { imageFile: _f, ...supportRest } = c.supportBlock
  const data = {
    name: c.name, position: c.position, tagline: c.tagline, headline: c.headline, breadcrumb: c.breadcrumb,
    description: c.description, seoTitle: c.seoTitle, seoDescription: c.seoDescription, focusKeyword: c.focusKeyword,
    chips: c.chips, stats: c.stats, deliveryAreas: c.deliveryAreas,
    supportBlock: { ...supportRest, image: support.storagePath },
    featuredProductSkus: c.featuredProductSkus, featuredCategorySlugs: c.featuredCategorySlugs, heroId: hero.id,
    ...(publish ? { isPublished: true } : {}),
  }
  const row = existing
    ? await db.industry.update({ where: { id: existing.id }, data, select: { slug: true, isPublished: true } })
    : await db.industry.create({ data: { slug: c.slug, ...data }, select: { slug: true, isPublished: true } })
  console.log(`[industry] ${existing ? 'updated' : 'created'} ${row.slug} (published: ${row.isPublished})`)
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
