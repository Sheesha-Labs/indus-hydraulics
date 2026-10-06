/**
 * Two small fixes from the 2026-10-05 SEO audit.
 *
 * 1. A product slug with a typo. `/p/camlock-type-c-x-spiral-tail-for-compostie-hose`
 *    carried "compostie" in its URL, SEO title, meta description and long
 *    description; the product title was already right. The slug moves, a 301
 *    is recorded through `recordSlugRedirect` (which keeps the redirect graph
 *    one hop deep), and the copy is corrected. The SKU keeps its spelling —
 *    part numbers never change.
 *
 * 2. The order of the top-level categories. The homepage shows the first six
 *    by `position`, and they were Hydraulic Pumps (6 active products),
 *    Valves & Manifolds (66), Hydraulic Cylinders (4), Hoses & Fittings (595),
 *    Seals & Accessories (5) and Lubricants (152) — three near-empty shelves
 *    taking the homepage's strongest links, while Lifting & Rigging (834) sat
 *    last. The new order leads with the hose shelves and lifting, then follows
 *    product count.
 */
import type { Prisma } from '@prisma/client'
import { recordSlugRedirect } from '../../slug-redirect'

type Tx = Prisma.TransactionClient

export const SLUG_FIX = {
  sku: 'IH-COMP-CAMLOCK-TYPE-C-X-SPIRAL-TAIL-FOR-COMPOST',
  fromSlug: 'camlock-type-c-x-spiral-tail-for-compostie-hose',
  toSlug: 'camlock-type-c-x-spiral-tail-for-composite-hose',
} as const

/** Top-level category slugs, in the order they should appear. */
export const TOP_LEVEL_ORDER: readonly string[] = [
  'hydraulic-hose-fittings-suppliers-uae', // Hoses & Fittings
  'industrial-hose-suppliers-uae', // Industrial Hoses
  'lifting-rigging-equipment-uae', // Lifting & Rigging
  'oil-gas-hoses', // Oil & Gas Hoses
  'industrial-lubricant-suppliers-uae', // Lubricants (Molykote, an authorised line)
  'oilfield-valve-suppliers-uae', // Oilfield Valves
  'flow-iron-wellhead-equipment-uae', // Flow Iron & Wellhead
  'valves-manifolds', // Valves & Manifolds
  'blowout-preventers', // Blowout Preventers (BOP)
  'instrumentation-controls',
  'well-testing-equipment',
  'fracturing-equipment',
  'cementing-equipment',
  'drilling-workover-systems',
  'stimulation-equipment',
  'hydraulic-pumps',
  'seals-accessories',
  'cylinders',
]

/** Replace the misspelling, whatever its case, in a piece of copy. */
export function fixCompostie(text: string | null): string | null {
  if (text == null) return text
  return text.replace(/compostie/g, 'composite').replace(/Compostie/g, 'Composite')
}

/**
 * The spec rows carry the product's name too — one "Coupling Type / Variant"
 * value repeated the typo after the slug and copy were fixed. Idempotent, so
 * it runs whether or not the slug has already moved.
 */
async function fixCompostieSpecs(tx: Tx, productId: string, log: (line: string) => void): Promise<void> {
  const specs = await tx.productSpec.findMany({
    where: { productId, value: { contains: 'ompostie' } },
    select: { id: true, value: true },
  })
  for (const spec of specs) {
    await tx.productSpec.update({ where: { id: spec.id }, data: { value: fixCompostie(spec.value) ?? spec.value } })
  }
  if (specs.length) log(`slug: ${specs.length} spec value(s) corrected`)
}

export async function applySlugFix(tx: Tx, log: (line: string) => void): Promise<void> {
  const product = await tx.product.findUnique({
    where: { sku: SLUG_FIX.sku },
    select: {
      id: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      descriptionShort: true,
      descriptionLong: true,
    },
  })
  if (!product) throw new Error(`product ${SLUG_FIX.sku} not found`)
  await fixCompostieSpecs(tx, product.id, log)
  if (product.slug === SLUG_FIX.toSlug) {
    log(`slug: already ${SLUG_FIX.toSlug}`)
    return
  }
  if (product.slug !== SLUG_FIX.fromSlug) {
    throw new Error(`slug: expected ${SLUG_FIX.fromSlug}, found ${product.slug} — refusing to guess`)
  }
  const clash = await tx.product.findUnique({ where: { slug: SLUG_FIX.toSlug }, select: { id: true } })
  if (clash) throw new Error(`slug: ${SLUG_FIX.toSlug} is already taken`)

  await tx.product.update({
    where: { id: product.id },
    data: {
      slug: SLUG_FIX.toSlug,
      seoTitle: fixCompostie(product.seoTitle),
      seoDescription: fixCompostie(product.seoDescription),
      descriptionShort: fixCompostie(product.descriptionShort),
      descriptionLong: fixCompostie(product.descriptionLong),
    },
  })
  await recordSlugRedirect(tx, {
    fromPath: `/p/${SLUG_FIX.fromSlug}`,
    toPath: `/p/${SLUG_FIX.toSlug}`,
    statusCode: 301,
    notes: 'SEO audit 2026-10-05: "compostie" typo in the slug',
  })
  log(`slug: /p/${SLUG_FIX.fromSlug} → /p/${SLUG_FIX.toSlug} (301 recorded, copy corrected)`)
}

export async function applyTopLevelOrder(tx: Tx, log: (line: string) => void): Promise<void> {
  const roots = await tx.category.findMany({
    where: { parentId: null },
    select: { id: true, slug: true, position: true },
  })
  const bySlug = new Map(roots.map((r) => [r.slug, r]))
  const missing = TOP_LEVEL_ORDER.filter((slug) => !bySlug.has(slug))
  if (missing.length) throw new Error(`order: unknown top-level slugs ${missing.join(', ')}`)
  const unplaced = roots.filter((r) => !TOP_LEVEL_ORDER.includes(r.slug))
  if (unplaced.length) {
    throw new Error(`order: top-level categories missing from the list: ${unplaced.map((r) => r.slug).join(', ')}`)
  }

  let changed = 0
  for (const [index, slug] of TOP_LEVEL_ORDER.entries()) {
    const row = bySlug.get(slug)!
    const position = index + 1
    if (row.position === position) continue
    await tx.category.update({ where: { id: row.id }, data: { position } })
    changed++
  }
  log(`order: ${changed} of ${roots.length} top-level positions changed`)
}
