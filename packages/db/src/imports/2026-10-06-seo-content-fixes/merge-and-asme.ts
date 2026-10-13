/**
 * Two follow-ups to the shelf copy.
 *
 * MERGES — eight shelves held a single product each: seven Manuli ferrule-series
 * shelves under Ferrules, and Hose Nipples under Industrial Hoses. A one-product
 * shelf is a thin page that only restates its product, and the megamenu linked
 * all eight from every page on the site. Each product moves to the shelf that
 * already covers it, the empty shelf is unpublished, a 301 is recorded through
 * `recordSlugRedirect`, and the megamenu items that pointed at it are hidden —
 * a visible menu link into a redirect is a crawl hop on every page.
 *
 * ASME — five Industrial Flanges products named ASTM B16.5 as their standard.
 * The flange standard is ASME B16.5; ASTM is a different body. Corrected in
 * the title, SEO fields, descriptions, spec values and image alt text, and in
 * the slug, which moves with a 301 like any other rename.
 *
 * Retired the way `retire-pages-without-deploy` describes: content, not code —
 * no deploy, no cache purge. Redirects answer within a minute; the menu within
 * about two hours.
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import { recordSlugRedirect } from '../../slug-redirect'

type Tx = Prisma.TransactionClient

/**
 * One transaction per shelf or product, each with room to finish. A single
 * transaction around all eight merges ran past Prisma's 5-second default over
 * the pooled connection on 2026-10-06 and was rolled back whole — correctly,
 * but it showed the batch was the wrong unit. Each shelf is atomic on its own.
 */
const TX_OPTIONS = { timeout: 30_000, maxWait: 10_000 } as const

export const SHELF_MERGES: ReadonlyArray<{ from: string; into: string }> = [
  { from: 'm00110-m00120-m00130-skive-ferrules', into: 'ferrules' },
  { from: 'm00310-m00320-no-skive-ferrules', into: 'ferrules' },
  { from: 'm00820-m00830-no-skive-ferrules', into: 'ferrules' },
  { from: 'm00910-m00920-skive-ferrules', into: 'ferrules' },
  { from: 'm03300-no-skive-ferrules', into: 'ferrules' },
  { from: 'm03400-no-skive-ferrules', into: 'ferrules' },
  { from: 'm03500-no-skive-ferrules', into: 'ferrules' },
  // A zinc-plated male NPT × hose-barb nipple; Shank Couplings is the
  // hose-nipple shelf and already has its own menu item.
  { from: 'hose-nipples', into: 'shank-couplings' },
]

export const ASME_SKUS: readonly string[] = [
  'IH-FLG-FLAT-FLANGE',
  'IH-FLG-SOCKET-WELD-FLANGE',
  'IH-FLG-LAP-JOINT-FLANGE',
  'IH-FLG-BLIND-FLANGE',
  'IH-FLG-THREADED-FLANGE',
]

const ASTM = /ASTM(\s?)B(\s?)16\.5/g
export function fixAstm(text: string | null): string | null {
  return text == null ? text : text.replace(ASTM, (_m, a: string, b: string) => `ASME${a}B${b}16.5`)
}

/** Validate the ASME fix: every SKU exists, and says ASTM or has been fixed. */
export async function checkAsme(db: Tx): Promise<{ problems: string[]; summary: string[] }> {
  const rows = await db.product.findMany({
    where: { sku: { in: [...ASME_SKUS] } },
    select: { sku: true, slug: true, title: true },
  })
  const problems: string[] = []
  const summary: string[] = []
  for (const sku of ASME_SKUS) {
    const row = rows.find((r) => r.sku === sku)
    if (!row) problems.push(`asme: product ${sku} not found`)
    else if (/ASTM\s?B\s?16\.5/.test(row.title) || row.slug.includes('astm-b16-5')) {
      summary.push(`asme: ${sku} — "${row.title}"`)
    } else summary.push(`asme: ${sku} already corrected`)
  }
  return { problems, summary }
}

/**
 * Shank Couplings gains the barbed nipple from Hose Nipples; its guidance names
 * what the shelf holds, so it is updated to match. Idempotent.
 */
export async function patchShankCopy(tx: Tx, log: (line: string) => void): Promise<void> {
  const doc = await tx.pageContent.findUnique({ where: { key: 'category/shank-couplings' } })
  if (!doc) return
  const sections = (Array.isArray(doc.sections) ? doc.sections : []) as Array<{
    key: string
    enabled: boolean
    values: Record<string, unknown>
  }>
  const guidance = sections.find((s) => s.key === 'guidance')
  if (!guidance || String(guidance.values.body ?? '').includes('hose-barb')) return
  guidance.values.body = SHANK_GUIDANCE
  await tx.pageContent.update({
    where: { key: 'category/shank-couplings' },
    data: { sections: sections as unknown as Prisma.InputJsonValue },
  })
  log('merge: shank-couplings guidance updated for the moved nipple')
}

export const SHANK_GUIDANCE =
  'Shank couplings are hose nipples clamped into industrial transfer hose: steel long-shank nipples, male, female and complete sets, brass short-shank male and female nipples, and a zinc-plated steel male NPT × hose-barb nipple. A long shank gives more grip in the hose and suits heavier lines; a short shank or a barbed nipple suits lighter service, held by a hose clamp.'

/** Validate a merge before anything is written. Returns problems, if any. */
export async function checkMerges(db: Tx): Promise<{ problems: string[]; summary: string[] }> {
  const problems: string[] = []
  const summary: string[] = []
  const slugs = [...new Set(SHELF_MERGES.flatMap((m) => [m.from, m.into]))]
  const rows = await db.category.findMany({
    where: { slug: { in: slugs } },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      _count: { select: { products: true, children: true } },
    },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  const sources = new Set(SHELF_MERGES.map((m) => m.from))
  for (const { from, into } of SHELF_MERGES) {
    const src = bySlug.get(from)
    const dst = bySlug.get(into)
    if (!dst || !dst.isPublished) problems.push(`merge: target ${into} missing or unpublished`)
    if (sources.has(into)) problems.push(`merge: target ${into} is itself being merged — that would chain redirects`)
    if (!src) {
      problems.push(`merge: ${from} not found`)
      continue
    }
    if (!src.isPublished) {
      summary.push(`merge: ${from} already unpublished — skipped`)
      continue
    }
    if (src._count.children > 0) problems.push(`merge: ${from} has sub-categories — refusing to merge`)
    summary.push(`merge: /c/${from} (${src._count.products} product) → /c/${into}`)
  }
  return { problems, summary }
}

export async function applyMerges(db: PrismaClient, log: (line: string) => void): Promise<void> {
  for (const merge of SHELF_MERGES) {
    await db.$transaction((tx: Tx) => applyMerge(tx, merge, log), TX_OPTIONS)
  }
  await db.$transaction((tx: Tx) => patchShankCopy(tx, log), TX_OPTIONS)
}

async function applyMerge(
  tx: Tx,
  { from, into }: { from: string; into: string },
  log: (line: string) => void,
): Promise<void> {
  const src = await tx.category.findUnique({ where: { slug: from }, select: { id: true, isPublished: true } })
  const dst = await tx.category.findUnique({ where: { slug: into }, select: { id: true } })
  if (!src || !dst) throw new Error(`merge: ${from} → ${into} — category missing`)
  if (!src.isPublished) return

  const moved = await tx.product.updateMany({ where: { categoryId: src.id }, data: { categoryId: dst.id } })
  const hidden = await tx.navMenuItem.updateMany({
    where: { categoryId: src.id, isVisible: true },
    data: { isVisible: false },
  })
  // Guard on the shelf actually being empty before it goes.
  const left = await tx.product.count({ where: { categoryId: src.id } })
  if (left > 0) throw new Error(`merge: ${from} still holds ${left} products`)
  await tx.category.update({ where: { id: src.id }, data: { isPublished: false } })
  await recordSlugRedirect(tx, {
    fromPath: `/c/${from}`,
    toPath: `/c/${into}`,
    statusCode: 301,
    notes: 'SEO audit 2026-10-06: single-product shelf merged into its parent',
  })
  log(`merge: /c/${from} → /c/${into} (${moved.count} product moved, ${hidden.count} menu item hidden)`)
}

export async function applyAsme(db: PrismaClient, log: (line: string) => void): Promise<void> {
  for (const sku of ASME_SKUS) {
    await db.$transaction((tx: Tx) => applyAsmeOne(tx, sku, log), TX_OPTIONS)
  }
}

async function applyAsmeOne(tx: Tx, sku: string, log: (line: string) => void): Promise<void> {
  const p = await tx.product.findUnique({
    where: { sku },
    select: {
      id: true,
      slug: true,
      title: true,
      seoTitle: true,
      seoDescription: true,
      descriptionShort: true,
      descriptionLong: true,
    },
  })
  if (!p) throw new Error(`asme: product ${sku} not found`)

  const newSlug = p.slug.replace('astm-b16-5', 'asme-b16-5')
  if (newSlug !== p.slug) {
    const clash = await tx.product.findUnique({ where: { slug: newSlug }, select: { id: true } })
    if (clash) throw new Error(`asme: slug ${newSlug} already taken`)
  }
  await tx.product.update({
    where: { id: p.id },
    data: {
      slug: newSlug,
      title: fixAstm(p.title) ?? p.title,
      seoTitle: fixAstm(p.seoTitle),
      seoDescription: fixAstm(p.seoDescription),
      descriptionShort: fixAstm(p.descriptionShort),
      descriptionLong: fixAstm(p.descriptionLong),
    },
  })
  const specs = await tx.productSpec.findMany({
    where: { productId: p.id, value: { contains: 'ASTM' } },
    select: { id: true, value: true },
  })
  for (const s of specs) {
    const value = fixAstm(s.value)
    if (value !== s.value) await tx.productSpec.update({ where: { id: s.id }, data: { value: value ?? s.value } })
  }
  const images = await tx.productImage.findMany({
    where: { productId: p.id, alt: { contains: 'ASTM' } },
    select: { id: true, alt: true },
  })
  for (const img of images) {
    const alt = fixAstm(img.alt)
    if (alt !== img.alt) await tx.productImage.update({ where: { id: img.id }, data: { alt } })
  }
  if (newSlug !== p.slug) {
    await recordSlugRedirect(tx, {
      fromPath: `/p/${p.slug}`,
      toPath: `/p/${newSlug}`,
      statusCode: 301,
      notes: 'SEO audit 2026-10-06: ASTM B16.5 corrected to ASME B16.5',
    })
  }
  log(`asme: ${sku} — ${newSlug !== p.slug ? `/p/${p.slug} → /p/${newSlug}, ` : ''}${specs.length} spec(s), ${images.length} alt(s)`)
}
