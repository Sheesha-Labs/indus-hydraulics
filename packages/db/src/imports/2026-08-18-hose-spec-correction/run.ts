/**
 * Correct the hydraulic hose specs to the Intertraco catalogue.
 *
 * The stored figures disagreed with the manufacturer catalogue on eight of
 * twelve grades. The founder confirmed Intertraco is the source of truth, so
 * this rewrites four fields per grade from HOSE_SIZE_TABLES.
 *
 * Two deliberate constraints:
 *
 *  1. Ranges are computed ONLY over the dash sizes inside each product's
 *     existing stated bore range. The catalogue lists sizes beyond what we
 *     say we stock (1SN runs to 3"), and widening the offer is a commercial
 *     decision, not a data-correction one.
 *
 *  2. `Working Pressure Range` is added as a new field. It is the whole point:
 *     a single "max working pressure" is the figure at the SMALLEST bore, and
 *     quoting it alone is what made 2SC look stronger than 4SH.
 *
 * Idempotent. Prints the before/after for every change.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-18-hose-spec-correction/run.ts --dry-run
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { HOSE_SIZE_SOURCE, HOSE_SIZE_TABLES } from '@indus/domain'

const DRY_RUN = process.argv.includes('--dry-run')

/** Pull the DN bounds out of a stored range like `3/8" – 2" (DN10 – DN51)`. */
function dnBounds(boreRange: string): { min: number; max: number } | null {
  const m = boreRange.match(/DN\s*(\d+)\s*[–-]\s*DN\s*(\d+)/i)
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null
}

async function main(): Promise<void> {
  let changed = 0

  for (const table of HOSE_SIZE_TABLES) {
    const product = await db.product.findUnique({
      where: { sku: table.sku },
      select: { id: true, sku: true, specs: { select: { id: true, label: true, value: true, unit: true, group: true, position: true } } },
    })
    if (!product) {
      console.error(`  ✗ ${table.sku} not found`)
      continue
    }

    const specBy = (label: string) => product.specs.find((s) => s.label === label)
    const bore = specBy('Bore Size Range')?.value ?? ''
    const bounds = dnBounds(bore)
    const rows = bounds
      ? table.rows.filter((r) => r.dn >= bounds.min && r.dn <= bounds.max)
      : table.rows
    if (rows.length === 0) {
      console.error(`  ✗ ${table.sku} no catalogue rows inside stated bore range "${bore}"`)
      continue
    }

    const top = rows[0]!
    const bottom = rows[rows.length - 1]!
    const dash = (n: number) => `-${String(n).padStart(2, '0')}`

    const updates: Array<{ label: string; value: string; unit: string | null; group: string; position: number }> = [
      { label: 'Max Working Pressure', value: String(top.workingBar), unit: 'bar', group: 'Performance', position: 3 },
      { label: 'Min Burst Pressure', value: String(top.burstBar), unit: 'bar', group: 'Performance', position: 4 },
      {
        label: 'Working Pressure Range',
        value: `${top.workingBar} bar at ${dash(top.dash)} down to ${bottom.workingBar} bar at ${dash(bottom.dash)}`,
        unit: null, group: 'Performance', position: 5,
      },
      {
        label: 'Min Bend Radius',
        value: `${top.bendRadiusMm}–${bottom.bendRadiusMm} mm by bore (${top.bendRadiusMm} mm at ${dash(top.dash)}, ${bottom.bendRadiusMm} mm at ${dash(bottom.dash)})`,
        unit: null, group: 'Dimensions', position: 8,
      },
      {
        label: 'Outside Diameter Range',
        value: `${top.odMm}–${bottom.odMm} mm (${dash(top.dash)} to ${dash(bottom.dash)})`,
        unit: null, group: 'Dimensions', position: 9,
      },
    ]

    console.log(`\n${table.sku}  [${table.standard}]  ${rows.length} sizes in range`)
    for (const u of updates) {
      const existing = specBy(u.label)
      const before = existing ? `${existing.value}${existing.unit ? ' ' + existing.unit : ''}` : '(absent)'
      const after = `${u.value}${u.unit ? ' ' + u.unit : ''}`
      if (before === after) {
        console.log(`   = ${u.label}: ${after}`)
        continue
      }
      console.log(`   ~ ${u.label}`)
      console.log(`       was: ${before}`)
      console.log(`       now: ${after}`)
      changed++
      if (DRY_RUN) continue

      if (existing) {
        await db.productSpec.update({ where: { id: existing.id }, data: { value: u.value, unit: u.unit } })
      } else {
        await db.productSpec.create({
          data: { productId: product.id, group: u.group, label: u.label, value: u.value, unit: u.unit, position: u.position },
        })
      }
    }
  }

  console.log(`\n${DRY_RUN ? '[dry-run] ' : ''}${changed} field(s) ${DRY_RUN ? 'would change' : 'changed'}`)
  console.log(`Source: ${HOSE_SIZE_SOURCE}`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => db.$disconnect())
