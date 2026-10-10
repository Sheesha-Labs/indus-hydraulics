/**
 * Load per-size competitor cross-references (2026-10-10, approved by Ayush).
 *
 *   perSize — 6,027 rows: one competitor or standard number per Indus part
 *             number, from the Hydraulics Direct interchange data (Parker, SSP,
 *             Aeroquip, Swagelok, Parker A-LOK, SSP Duolok, SAE, MS) and the
 *             competitor column already stored on product_variants. They fill
 *             the product page's equivalent columns and the brand hubs.
 *   family  — 11 Crosby snatch-block patterns missing from the 36 Crosby rows.
 *
 * Also back-fills `series` on existing rows that have none.
 *
 * RUN ONLY AFTER the code that reads `variantPartNumber` is deployed. On older
 * code every per-size row is a family row: competitor numbers matching two
 * listings would pass the part-page index gate and ~400 thin pages would reach
 * the sitemap.
 *
 * Inserts only (plus the series back-fill). The ids written are logged to
 * --log so the load can be reversed with one deleteMany.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-cross-references/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-cross-references/run.ts --log=/path/inserted.json
 *
 * payload.json is built by build_payload.py (see its header for the matching rule).
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { crossReferenceSeries } from '@indus/domain'

import { db } from '../../index'

type Compatibility = 'direct' | 'compatible' | 'superseded_by_us'
type PerSize = {
  competitorBrand: string
  competitorMpn: string
  variantPartNumber: string
  compatibility: Compatibility
}
type Family = { competitorBrand: string; competitorMpn: string; sku: string }

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(readFileSync(path.join(HERE, 'payload.json'), 'utf8')) as {
  perSize: PerSize[]
  family: Family[]
}
const DRY_RUN = process.argv.includes('--dry-run')
const LOG = process.argv.find((a) => a.startsWith('--log='))?.slice('--log='.length)

const key = (productId: string, brand: string, mpn: string, pn: string | null) =>
  `${productId}|${brand}|${mpn.toLowerCase()}|${pn ?? ''}`

async function main(): Promise<void> {
  const errors: string[] = []

  const pns = [...new Set(payload.perSize.map((r) => r.variantPartNumber))]
  const variants = await db.productVariant.findMany({
    where: { partNumber: { in: pns }, product: { status: 'active' } },
    select: { partNumber: true, productId: true },
  })
  const productOf = new Map(variants.map((v) => [v.partNumber, v.productId]))
  const missing = pns.filter((pn) => !productOf.has(pn))
  if (missing.length)
    errors.push(`${missing.length} part numbers not live, e.g. ${missing.slice(0, 5).join(', ')}`)

  const skus = await db.product.findMany({
    where: { sku: { in: payload.family.map((f) => f.sku) }, status: 'active' },
    select: { sku: true, id: true },
  })
  const productOfSku = new Map(skus.map((p) => [p.sku, p.id]))
  for (const f of payload.family)
    if (!productOfSku.has(f.sku)) errors.push(`family ${f.competitorMpn}: ${f.sku} not live`)

  const existing = await db.productCrossReference.findMany({
    select: {
      id: true,
      productId: true,
      competitorBrand: true,
      competitorMpn: true,
      variantPartNumber: true,
      series: true,
    },
  })
  const have = new Set(
    existing.map((r) => key(r.productId, r.competitorBrand, r.competitorMpn, r.variantPartNumber))
  )

  const inserts: Array<{
    productId: string
    competitorBrand: string
    competitorMpn: string
    compatibility: Compatibility
    variantPartNumber: string | null
    series: string
  }> = []
  for (const r of payload.perSize) {
    const productId = productOf.get(r.variantPartNumber)
    if (
      !productId ||
      have.has(key(productId, r.competitorBrand, r.competitorMpn, r.variantPartNumber))
    )
      continue
    inserts.push({
      productId,
      competitorBrand: r.competitorBrand,
      competitorMpn: r.competitorMpn,
      compatibility: r.compatibility,
      variantPartNumber: r.variantPartNumber,
      series: crossReferenceSeries(r.competitorBrand, r.competitorMpn),
    })
  }
  for (const f of payload.family) {
    const productId = productOfSku.get(f.sku)
    if (!productId || have.has(key(productId, f.competitorBrand, f.competitorMpn, null))) continue
    inserts.push({
      productId,
      competitorBrand: f.competitorBrand,
      competitorMpn: f.competitorMpn,
      // Pattern equivalents, as the 36 existing Crosby rows are recorded.
      compatibility: 'compatible',
      variantPartNumber: null,
      series: crossReferenceSeries(f.competitorBrand, f.competitorMpn),
    })
  }
  const backfill = existing.filter((r) => !r.series)

  const byBrand = inserts.reduce<Record<string, number>>(
    (a, r) => ((a[r.competitorBrand] = (a[r.competitorBrand] ?? 0) + 1), a),
    {}
  )
  console.log(
    `insert ${inserts.length} rows on ${new Set(inserts.map((r) => r.productId)).size} products`,
    byBrand
  )
  console.log(`series back-fill on ${backfill.length} existing rows`)
  console.log(
    'sample series:',
    [...new Set(inserts.slice(0, 400).map((r) => `${r.competitorBrand} ${r.series}`))]
      .slice(0, 12)
      .join(' | ')
  )

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }
  if (DRY_RUN) return console.log('\n--dry-run: validated, nothing written')
  if (!LOG) throw new Error('--log=<file> is required to write')

  const written: string[] = []
  for (let i = 0; i < inserts.length; i += 500) {
    const chunk = await db.productCrossReference.createManyAndReturn({
      data: inserts.slice(i, i + 500),
      select: { id: true },
    })
    written.push(...chunk.map((r) => r.id))
  }
  for (const r of backfill) {
    await db.productCrossReference.update({
      where: { id: r.id },
      data: { series: crossReferenceSeries(r.competitorBrand, r.competitorMpn) },
    })
  }
  writeFileSync(
    LOG,
    JSON.stringify({ inserted: written, backfilled: backfill.map((r) => r.id) }, null, 1)
  )
  console.log(
    `\nwritten: ${written.length} rows inserted, ${backfill.length} back-filled; ids in ${LOG}`
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
