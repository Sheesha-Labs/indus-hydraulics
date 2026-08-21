/**
 * Delete the five leftover seed products sitting on the `hoses-fittings` parent.
 *
 * All five were created 2026-05-01, in the first week of the build, before the
 * real catalogue existed. None has been touched since 2026-05-10. They sit
 * directly on the parent category rather than in any subcategory, which is how
 * they surfaced — a product-count audit found five rows that belonged to no
 * fitting family.
 *
 *   IH-TEST-9991  "Ayush Bhatia Test Product"   — a test row, live and public
 *   IH-JIC-90-08  Parker JIC 37° Elbow 1/2" BSP — Stainless
 *   IH-451-12     Parker 451TC Compact Spiral Hose 3/4" DN19
 *   IH-421-08     Parker 421 High-Pressure Hose 1/2" DN13
 *   IH-HH-001     Hydraulic Hose SAE R1 Eaton Winner
 *
 * All four real products duplicate ranges the catalogue now covers properly
 * under Indus branding (SAE R1, R13 spiral, JIC 37° stainless), and all four
 * carry brand Parker Hannifin — including IH-HH-001, which is titled "Eaton
 * Winner" but branded Parker, a straight data error. Founder's decision was to
 * delete rather than re-file, and explicitly no redirects.
 *
 * NO REDIRECTS ARE WRITTEN. That is deliberate and was the explicit
 * instruction. The four `/p/...` URLs will 404 after this runs.
 *
 * Safety, in order:
 *   1. A full JSON snapshot of every row — product, specs, images, documents,
 *      FAQs, cross-references — is written to `data/` BEFORE anything is
 *      deleted, so the rows can be reconstructed. Deleting without that is a
 *      one-way door.
 *   2. The three RESTRICT relations that block a product delete (RfqLine,
 *      OrderLine, SavedListItem) plus nav links and supersession are re-checked
 *      at run time. A product referenced by any of them is REPORTED AND
 *      SKIPPED, never force-deleted — a live RFQ line pointing at the row means
 *      the "unused seed data" premise is wrong for that row.
 *   3. Media rows are LEFT ALONE. Deleting the product cascades its
 *      ProductImage / ProductDocument join rows, which releases the Media, but
 *      the Media itself stays in the library and its storage object stays in
 *      the bucket. Destroying bytes is a separate irreversible act that was not
 *      asked for, and `Media.storagePath` is not unique so a shared object
 *      could be addressed by another row. The freed Media ids are printed so
 *      they can be tidied deliberately later.
 *
 * Cascades handle the rest: ProductImage, ProductSpec, ProductDocument,
 * ProductCrossReference, ProductFaq and BlogPostProduct are all onDelete:
 * Cascade on productId.
 *
 * Idempotent — a SKU already gone is reported and skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/delete-seed-products.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/scripts/delete-seed-products.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BACKUP_DIR = resolve(__dirname, '../../data')

const SKUS = [
  'IH-TEST-9991',
  'IH-JIC-90-08',
  'IH-451-12',
  'IH-421-08',
  'IH-HH-001',
] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const prefix = dryRun ? '[DRY-RUN]' : '[LIVE]'

  const products = await db.product.findMany({
    where: { sku: { in: [...SKUS] } },
    include: {
      brand: { select: { slug: true, name: true } },
      category: { select: { slug: true, name: true } },
      specs: true,
      faqs: true,
      crossReferences: true,
      images: { include: { media: true } },
      documents: { include: { media: true } },
      _count: {
        select: {
          rfqLines: true,
          orderLines: true,
          savedListItems: true,
          navMenuItems: true,
          supersedes: true,
        },
      },
    },
  })

  const found = new Set(products.map((p) => p.sku))
  for (const s of SKUS) {
    if (!found.has(s)) console.log(`  gone     ${s.padEnd(16)} not in the database — already deleted`)
  }

  // ── Guard: anything referenced by a RESTRICT relation is not seed data ──
  const blocked: typeof products = []
  const deletable: typeof products = []
  for (const p of products) {
    const refs: string[] = []
    if (p._count.rfqLines) refs.push(`rfqLines=${p._count.rfqLines}`)
    if (p._count.orderLines) refs.push(`orderLines=${p._count.orderLines}`)
    if (p._count.savedListItems) refs.push(`savedListItems=${p._count.savedListItems}`)
    if (p._count.navMenuItems) refs.push(`navMenuItems=${p._count.navMenuItems}`)
    if (p._count.supersedes) refs.push(`supersedes=${p._count.supersedes}`)
    if (refs.length > 0) {
      blocked.push(p)
      console.log(`  BLOCKED  ${p.sku.padEnd(16)} referenced by ${refs.join(', ')} — NOT deleted`)
    } else {
      deletable.push(p)
    }
  }

  if (deletable.length === 0) {
    console.log(`\n${prefix} Nothing to delete.`)
    if (blocked.length > 0) process.exitCode = 1
    return
  }

  // ── Snapshot before anything is destroyed ──────────────────────────────
  const backupPath = resolve(BACKUP_DIR, 'deleted-seed-products-2026-08-21.json')
  const snapshot = {
    deletedAt: '2026-08-21',
    reason:
      'Leftover 2026-05-01 seed rows on the hoses-fittings parent. Founder decision: delete, no redirects.',
    note: 'Media rows were intentionally left in the library; only the join rows cascaded away.',
    products: deletable,
  }
  if (!dryRun) {
    writeFileSync(backupPath, JSON.stringify(snapshot, null, 2))
    console.log(`\n  snapshot -> ${backupPath}`)
  } else {
    console.log(`\n  [dry-run] snapshot would go to ${backupPath}`)
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  const freedMedia: string[] = []
  for (const p of deletable) {
    const kids = [
      `${p.specs.length} specs`,
      `${p.faqs.length} FAQs`,
      `${p.images.length} images`,
      `${p.documents.length} docs`,
      `${p.crossReferences.length} xrefs`,
    ].join(', ')
    console.log(
      `  delete   ${p.sku.padEnd(16)} ${p.title}\n           cascades: ${kids}`,
    )
    for (const i of p.images) freedMedia.push(`${i.media.id}  ${i.media.originalFilename}`)
    for (const d of p.documents) freedMedia.push(`${d.media.id}  ${d.media.originalFilename}`)
    if (!dryRun) await db.product.delete({ where: { id: p.id } })
  }

  console.log(`\n${prefix} Deleted ${dryRun ? 0 : deletable.length} product(s).`)
  if (freedMedia.length > 0) {
    console.log(`\n${freedMedia.length} Media row(s) released but LEFT in the library:`)
    for (const m of freedMedia) console.log(`  - ${m}`)
    console.log('  Storage objects untouched. Tidy them deliberately if you want the bytes gone.')
  }
  console.log('\nNo redirects were written — the deleted /p/ URLs will 404, as instructed.')
  if (blocked.length > 0) process.exitCode = 1
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
