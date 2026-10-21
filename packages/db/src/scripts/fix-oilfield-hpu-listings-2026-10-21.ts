/**
 * Correct oilfield package and hydraulic power unit listings against maker data, found while researching the
 * oilfield blog wave (2026-10-21). Targeted phrase replacements, scoped by shelf.
 *
 * Sources: NOV non-fired nitrogen pumping unit page (360K = 360,000 scfh; highest pressure on the smallest rate
 * class), SLB Energy Glossary (crosslinker is a metal salt added to the gel), NOV pressure pumping brochure (blender
 * sand metering by augers), HYDAC filter data (clogging indicator trips before the bypass opens), trade guidance on
 * reservoir sizing (about 3× pump flow per minute for industrial open circuits, less on mobile).
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-oilfield-hpu-listings-2026-10-21.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

type Rule = { shelves: string[]; find: RegExp; replace: string; note: string }

const RULES: Rule[] = [
  { shelves: ['stimulation-nitrogen-unit'], find: /360,000 SCF[^.<]*\./gi, replace: '360K is the pumping-rate class: 360,000 scf of nitrogen per hour (6,000 scf/min).', note: 'N2 360K is a rate' },
  { shelves: ['stimulation-nitrogen-unit'], find: /Available capacities: 90K, 180K, 360K, 400K, 800K, 1000K\. Maximum pressure ratings to 15,000 psi\./g, replace: 'Rate classes from 90K to 1000K scf per hour are built; the highest pressure ratings (to 15,000 psi) go with the smallest rate classes, and this unit is rated 10,000 psi.', note: 'N2 pressure vs rate' },
  { shelves: ['frac-hydration-unit'], find: /prior to crosslinking with frac proppant/gi, replace: 'before the crosslinker and proppant are added at the blender', note: 'crosslinker is a metal salt, not proppant' },
  { shelves: ['frac-blender'], find: /Calibrated progressive-cavity \(auger\) sand metering/g, replace: 'Calibrated sand screw (auger) metering', note: 'augers, not progressive cavity' },
  { shelves: ['frac-manifold'], find: /up to 16 frac pumpers per side/gi, replace: 'up to 16 frac pumpers', note: 'title says 16-pumper capacity' },
  { shelves: ['hydraulic-filters'], find: /replace the element when the gauge reads bypass/g, replace: 'replace the element when the gauge reaches its change zone, before the bypass valve opens', note: 'indicator trips before bypass' },
  { shelves: ['hydraulic-reservoirs-breathers'], find: /Size a reservoir at two to three times pump flow per minute/g, replace: 'A common rule of thumb sizes an industrial open-circuit reservoir at about three times pump flow per minute, and less on mobile machines', note: 'reservoir rule of thumb' },
]

const FIELDS = ['title', 'descriptionShort', 'descriptionLong', 'seoTitle', 'seoDescription'] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const shelves = [...new Set(RULES.flatMap((r) => r.shelves))]
  const products = await db.product.findMany({
    where: { status: 'active', category: { slug: { in: shelves } } },
    select: { id: true, sku: true, title: true, descriptionShort: true, descriptionLong: true, seoTitle: true, seoDescription: true, category: { select: { slug: true } } },
  })
  const hits = new Map<string, number>()
  for (const p of products) {
    const data: Record<string, string> = {}
    for (const f of FIELDS) {
      let v = p[f]
      if (!v) continue
      for (const r of RULES) {
        if (!r.shelves.includes(p.category!.slug)) continue
        const n = (v.match(r.find) ?? []).length
        if (n) {
          hits.set(r.note, (hits.get(r.note) ?? 0) + n)
          v = v.replace(r.find, r.replace)
        }
      }
      if (v !== p[f]) data[f] = v
    }
    if (Object.keys(data).length) {
      console.log(`  ${dryRun ? '[dry-run] ' : ''}${p.sku}: ${Object.keys(data).join(', ')}`)
      if (!dryRun) await db.product.update({ where: { id: p.id }, data })
    }
  }
  for (const r of RULES) console.log(`  ${String(hits.get(r.note) ?? 0).padStart(3)}  ${r.note}`)
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
