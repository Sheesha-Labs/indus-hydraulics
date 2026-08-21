/**
 * Publish the Al Feel gap-fill products.
 *
 * PR #265 imported eleven products as `draft` so the copy could be reviewed
 * before anything reached the storefront. The founder has approved them; this
 * flips exactly those eleven SKUs to `active`.
 *
 * Scoped to a hard-coded SKU list on purpose. A `where: { status: 'draft' }`
 * bulk update would also catch the four pre-existing drafts in the catalogue
 * (a test product and three unrelated rows), which are draft for their own
 * reasons and must stay that way.
 *
 * The three plain metal-to-metal heavy-series females added alongside this
 * (IH-DF-FEM-24-HS*) are imported `active` by
 * `src/imports/2026-08-21-din-heavy-plain.ts` and are not listed here.
 *
 * NOTE: none of these products carries a photograph yet. They are live and
 * quotable but visually blank on the storefront until renders are attached.
 *
 * Idempotent — a SKU already active is reported and skipped. A SKU missing
 * from the database is reported and the run continues, so a partial state is
 * always safe to re-run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/publish-alfeel-gap-fill.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/scripts/publish-alfeel-gap-fill.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** The eleven SKUs imported as drafts by PR #265. */
const SKUS = [
  // Gap 1 — metric 24° cone heavy series (O-ring type)
  'IH-DF-MAL-24-HS',
  'IH-DF-FEM-24-OR-HS',
  'IH-DF-FEM-24-OR-HS-45',
  'IH-DF-FEM-24-OR-HS-90',
  // Gap 2 — automotive A/C ferrule
  'IH-CF-NS-AC',
  // Gap 3 — pressure washer / waterjet
  'IH-PW-GUN-INSERT',
  'IH-PW-WJ-FEM',
  // Gap 4 — NPSM swivel
  'IH-PT-NPSM-SWV',
  // Gap 5 — BSP bulkhead
  'IH-BSP-MAL-60-BH',
  // Gap 6 — wing nut couplings
  'IH-QC-WINGNUT',
  'IH-QC-WINGNUT-TRL',
] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const prefix = dryRun ? '[DRY-RUN]' : '[LIVE]'

  const rows = await db.product.findMany({
    where: { sku: { in: [...SKUS] } },
    select: { id: true, sku: true, title: true, status: true },
    orderBy: { sku: 'asc' },
  })

  const found = new Set(rows.map((r) => r.sku))
  const missing = SKUS.filter((s) => !found.has(s))
  const toPublish = rows.filter((r) => r.status === 'draft')
  const alreadyActive = rows.filter((r) => r.status === 'active')
  const other = rows.filter((r) => r.status !== 'draft' && r.status !== 'active')

  console.log(`${prefix} Publish Al Feel gap-fill — ${SKUS.length} SKUs expected\n`)

  for (const r of toPublish) console.log(`  publish   ${r.sku.padEnd(22)} ${r.title}`)
  for (const r of alreadyActive) console.log(`  skip      ${r.sku.padEnd(22)} already active`)
  for (const r of other) console.log(`  SKIP      ${r.sku.padEnd(22)} status is "${r.status}" — left alone`)
  for (const s of missing) console.log(`  MISSING   ${s.padEnd(22)} not in the database`)

  if (!dryRun && toPublish.length > 0) {
    const result = await db.product.updateMany({
      where: { id: { in: toPublish.map((r) => r.id) } },
      data: { status: 'active' },
    })
    console.log(`\n${prefix} Published ${result.count} product(s).`)
  } else if (dryRun) {
    console.log(`\n${prefix} Would publish ${toPublish.length} product(s). No changes written.`)
  } else {
    console.log(`\n${prefix} Nothing to do — all present SKUs are already active.`)
  }

  if (missing.length > 0) {
    console.log(
      `\nWARNING: ${missing.length} SKU(s) were not found. Run the import first:\n` +
        '  pnpm --filter @indus/db db:import src/imports/2026-08-21-alfeel-gap-fill.ts',
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
