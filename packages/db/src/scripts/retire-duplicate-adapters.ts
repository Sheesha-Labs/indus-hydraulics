/**
 * Retire the 18 adapter listings that are another listing under a second name.
 *
 * These were duplicates before any of this year's catalogue work — the adapter
 * range was bulk-created with overlapping titles, so one 90° JIC male/female
 * fitting had three pages and the NPT plug had two. Nothing noticed, because
 * every page was equally empty.
 *
 * Loading the supplier's size tables made it visible and made it worse: a part
 * number is unique catalogue-wide, so only one page of each set could hold the
 * table. The others are now thin pages sitting beside a full one.
 *
 * The listing that keeps the URL is the one carrying the size table, except
 * where a duplicate's slug is the more natural search target — none here, so
 * it is the table every time.
 *
 * `IH-AD-BSP-003` is the exception and goes to its CATEGORY, not to a product.
 * "Swivel Nut Tee" is the parent of two real fittings we now list separately,
 * the branch tee and the run tee, and picking one of them for the redirect
 * would be a guess about which the visitor wanted. The category page shows
 * both.
 *
 * Deleting rather than marking discontinued: a discontinued page is a
 * tombstone, and these products are not discontinued — they are still sold,
 * under the page that survives. The redirect is what a visitor needs.
 *
 * Idempotent: a SKU already gone is skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/retire-duplicate-adapters.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'
import { recordSlugRedirect } from '../slug-redirect'

const db = new PrismaClient()

type Retirement = {
  /** The duplicate page to remove. */
  sku: string
  /** The listing that keeps the URL, or a category when no single product fits. */
  keepSku?: string
  keepCategorySlug?: string
  /** Why these are the same product, in the terms the catalogue itself uses. */
  why: string
}

const RETIRE: Retirement[] = [
  // BSP — one 90° male/female elbow had three pages, the reducer two more.
  { sku: 'IH-AD-BSP-003', keepCategorySlug: 'bsp-hydraulic-adapters-uae',
    why: 'the generic parent of the branch tee (-005) and the run tee (-006), which are now listed separately' },
  { sku: 'IH-AD-BSP-022', keepSku: 'IH-AD-BSP-019',
    why: 'an expander and a reducer are the same fitting in opposite orientations; -019 lists both directions' },
  { sku: 'IH-AD-BSP-024', keepSku: 'IH-AD-BSP-019', why: 'titled "Thread Reducer (Variant 2)" of -019' },
  { sku: 'IH-AD-BSP-023', keepSku: 'IH-AD-BSP-021', why: 'the BSP male x female swivel 90° elbow, source family 2B9' },
  { sku: 'IH-AD-BSP-030', keepSku: 'IH-AD-BSP-021', why: 'the BSP male x female swivel 90° elbow, source family 2B9' },
  { sku: 'IH-AD-BSP-032', keepSku: 'IH-AD-BSP-025', why: 'the BSP male x female swivel union, source family 2B' },
  { sku: 'IH-AD-BSP-048', keepSku: 'IH-AD-BSP-052', why: 'the BSP male x male 90° elbow, source family 1B9' },
  { sku: 'IH-AD-BSP-050', keepSku: 'IH-AD-ORFS-022',
    why: 'the ORFS male x BSP male connector, filed under both ranges; the ORFS page carries the table' },
  // DIN 2353
  { sku: 'IH-AD-DIN-027', keepSku: 'IH-AD-DIN-026', why: 'titled "(Variant 2)" of -026' },
  { sku: 'IH-AD-DIN-042', keepSku: 'IH-AD-DIN-045', why: 'the metric bite-type 90° union elbow, source families 1C9/1D9' },
  // JIC — three pages for one 90° male/female, two for the swivel cap
  { sku: 'IH-AD-JIC-004', keepSku: 'IH-AD-JIC-006', why: 'the JIC branch tee with the swivel nut on the branch, source family BJ' },
  { sku: 'IH-AD-JIC-012', keepSku: 'IH-AD-JIC-015', why: 'the JIC female 74° seat cap, source family 9J' },
  { sku: 'IH-AD-JIC-017', keepSku: 'IH-AD-JIC-011', why: 'the JIC male x female 90° elbow, source family 2J9' },
  { sku: 'IH-AD-JIC-018', keepSku: 'IH-AD-JIC-011', why: 'the JIC male x female 90° elbow, source family 2J9' },
  { sku: 'IH-AD-JIC-021', keepSku: 'IH-AD-JIC-013', why: 'the JIC male x female union, source family 2J' },
  // metric and NPT
  { sku: 'IH-AD-MET-009', keepSku: 'IH-AD-MET-007', why: 'the metric male O-ring plug, source family 4E' },
  { sku: 'IH-AD-NPT-012', keepSku: 'IH-AD-NPT-019',
    why: 'the reducing sizes are rows of -019, not a separate fitting; source family 1N' },
  { sku: 'IH-AD-NPT-014', keepSku: 'IH-AD-NPT-015', why: 'the NPT male plug, source family 4N' },
]

/**
 * Everything that points at a product and does NOT cascade. A row in any of
 * these is history — a quotation someone was sent, a list someone saved — and
 * deleting the product underneath it is not a redirect, it is data loss. The
 * script refuses rather than deciding on its own.
 */
async function blockers(productId: string): Promise<string[]> {
  const [rfq, order, saved, blog, nav, superseded] = await Promise.all([
    db.rfqLine.count({ where: { productId } }),
    db.orderLine.count({ where: { productId } }),
    db.savedListItem.count({ where: { productId } }),
    db.blogPostProduct.count({ where: { productId } }),
    db.navMenuItem.count({ where: { productId } }),
    db.product.count({ where: { supersededById: productId } }),
  ])
  const found: string[] = []
  if (rfq) found.push(`${rfq} RFQ line(s)`)
  if (order) found.push(`${order} order line(s)`)
  if (saved) found.push(`${saved} saved-list item(s)`)
  if (blog) found.push(`${blog} blog link(s)`)
  if (nav) found.push(`${nav} menu item(s)`)
  if (superseded) found.push(`${superseded} listing(s) superseded by it`)
  return found
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let removed = 0
  const skipped: string[] = []

  for (const r of RETIRE) {
    const dupe = await db.product.findUnique({
      where: { sku: r.sku },
      select: { id: true, slug: true, title: true, _count: { select: { variants: true } } },
    })
    if (!dupe) {
      skipped.push(`${r.sku} already gone`)
      continue
    }

    // Nothing may be lost. If the duplicate somehow acquired a size table of
    // its own, it is not a duplicate any more and this list is out of date.
    if (dupe._count.variants > 0) {
      throw new Error(
        `${r.sku} has ${dupe._count.variants} sizes of its own — it is not an empty duplicate, ` +
          `so retiring it would delete data. Re-check the pairing before running this.`,
      )
    }
    const held = await blockers(dupe.id)
    if (held.length > 0) {
      throw new Error(`${r.sku} is referenced by ${held.join(', ')} — refusing to delete it`)
    }

    let toPath: string
    if (r.keepSku) {
      const keep = await db.product.findUnique({
        where: { sku: r.keepSku },
        select: { id: true, slug: true, status: true, _count: { select: { variants: true } } },
      })
      if (!keep) throw new Error(`${r.sku}: its replacement ${r.keepSku} does not exist`)
      if (keep.status !== 'active') {
        throw new Error(`${r.sku}: its replacement ${r.keepSku} is ${keep.status}, not active`)
      }
      // The survivor must already carry the table, or the redirect lands the
      // visitor somewhere emptier than where they started.
      if (keep._count.variants === 0) {
        throw new Error(`${r.sku}: its replacement ${r.keepSku} has no size table yet`)
      }
      toPath = `/p/${keep.slug}`
    } else {
      const cat = await db.category.findUnique({
        where: { slug: r.keepCategorySlug! },
        select: { slug: true, isPublished: true },
      })
      if (!cat) throw new Error(`${r.sku}: category ${r.keepCategorySlug} does not exist`)
      if (!cat.isPublished) throw new Error(`${r.sku}: category ${cat.slug} is not published`)
      toPath = `/c/${cat.slug}`
    }

    console.log(`${dryRun ? '[dry-run] ' : ''}/p/${dupe.slug} → ${toPath}  (${r.why})`)
    if (!dryRun) {
      await db.$transaction(async (tx) => {
        // Specs, FAQs, images, documents and cross-references cascade from the
        // product. Media rows are referenced by ProductImage and survive, so
        // the render the survivor also uses is untouched.
        await tx.product.delete({ where: { id: dupe.id } })
        await recordSlugRedirect(tx, {
          fromPath: `/p/${dupe.slug}`,
          toPath,
          notes: `${r.sku} duplicated ${r.keepSku ?? r.keepCategorySlug}: ${r.why}; retired 2026-08-23`,
        })
      })
    }
    removed++
  }

  console.log(`\n[retire-adapter-duplicates] ${removed} duplicate listings removed`)
  for (const s of skipped) console.log(`  · ${s}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
