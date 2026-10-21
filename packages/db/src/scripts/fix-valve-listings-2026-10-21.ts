/**
 * Correct maker- and standard-contradicted claims in valve listings, found while researching the valve blog wave
 * (2026-10-21). Targeted phrase replacements only; every rule is scoped to the shelves it was found on.
 *
 * Sources: SLB "Introduction to API Specification 6A" (all SSV designs PR2; service class I/II/III = standard or
 * sandy service; actuators fail-close), SLB DEMCO butterfly catalogue 2024 (lug end-of-line: liquid service, blind
 * flange, weld-neck or socket flanges, 200 psi; worm-gear figures are gear ratios), Yuken India BG-03 (250 kgf/cm²),
 * Emerson pressure-relief range (pilot valves are pop or modulating), API 6D scope (no globe valves), API 526
 * (flanged valves only).
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-valve-listings-2026-10-21.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

type Rule = { shelves: string[]; find: RegExp; replace: string; note: string; skus?: RegExp }

const OILFIELD = ['oilfield-ssv-esd-valves', 'oilfield-pressure-relief-valves', 'oilfield-instrumentation-valves', 'oilfield-globe-valves', 'oilfield-valve-accessories']

const RULES: Rule[] = [
  // Surface safety valves
  { shelves: ['oilfield-ssv-esd-valves'], find: /SSV Class II per API 6A \(block-bleed-blow\)\./g, replace: 'Service class (I standard, II or III sandy service) is specified at order, per API 6A.', note: 'SSV class = sand service, not block-bleed' },
  { shelves: ['oilfield-ssv-esd-valves'], find: /SSV Class II, /g, replace: 'SSV, ', note: 'SSV class in title/short' },
  { shelves: ['oilfield-ssv-esd-valves'], find: /\bPR1\b/g, replace: 'PR2', note: 'all SSV designs PR2' },
  { shelves: OILFIELD, find: /EE-HF/g, replace: 'EE', note: 'EE-HF is not an API 6A class' },
  { shelves: OILFIELD, find: / with API 6A monogram/g, replace: '', note: 'no monogram evidence' },
  { shelves: OILFIELD, find: /API monogram traceability on body and trim/g, replace: 'Traceability on body and trim', note: 'no monogram evidence' },
  { shelves: OILFIELD, find: /hydraulic dome — control pressure typically 1\.5× working pressure/g, replace: 'hydraulic, spring-return fail-close', note: 'actuator pressure is set by area ratio' },
  { shelves: OILFIELD, find: /Bidirectional flow with metal-to-metal seat seal\. /g, replace: '', note: 'unsourced' },
  // Globe valves
  { shelves: ['oilfield-globe-valves'], find: /seat-tested per API 6D acceptance criteria/g, replace: 'seat-tested before dispatch', note: 'API 6D excludes globe valves' },
  { shelves: ['oilfield-globe-valves'], find: /API 6D \/ ASME B16\.34/g, replace: 'API 623 / ASME B16.34', note: 'globe valve standard' },
  { shelves: ['oilfield-globe-valves'], find: /For sour gas processing, the EE-class chemistry trim is standard; HH-class is available for severe sour environments\./g, replace: 'For sour service, trim materials are selected to NACE MR0175 / ISO 15156.', note: 'EE/HH are API 6A classes' },
  { shelves: ['oilfield-globe-valves'], find: /Cast LCB low-carbon steel/g, replace: 'Cast LCB (ASTM A352) low-temperature carbon steel', note: 'LCB naming' },
  // Pressure relief valves
  { shelves: ['oilfield-pressure-relief-valves'], find: /witness-tested per ASME B16\.34/g, replace: 'bench-tested to the specified set pressure', note: 'B16.34 is not a set-pressure test' },
  { shelves: ['oilfield-pressure-relief-valves'], skus: /1502|602/, find: /witness-tested per API 526 \/ ASME Section VIII Division 1 acceptance criteria/g, replace: 'bench-tested to the specified set pressure', note: 'API 526 is flanged only' },
  { shelves: ['oilfield-pressure-relief-valves'], skus: /1502|602/, find: /API 526 \(steel pressure relief valves\) and \/ or ASME Section VIII Division 1/g, replace: 'Set-pressure test certificate with each valve', note: 'API 526 is flanged only' },
  { shelves: ['oilfield-pressure-relief-valves'], find: /6,000 psi working pressure \(5K class\)/g, replace: '6,000 psi working pressure (602 union rating)', note: '602 is 6,000 psi' },
  { shelves: ['oilfield-pressure-relief-valves'], find: /modulates the dome pressure/g, replace: 'controls the dome pressure', note: 'pilot valves are pop or modulating' },
  { shelves: ['oilfield-pressure-relief-valves'], find: /Modulating action gives[^.]*\.\s?/g, replace: '', note: 'unsourced modulation band' },
  // Instrumentation valves
  { shelves: ['oilfield-instrumentation-valves'], find: /API 6A \/ ASME B16\.34 instrumentation valve criteria/g, replace: 'Pressure-tested before dispatch', note: 'no such combined criteria' },
  { shelves: ['oilfield-instrumentation-valves'], find: /Reduces leak paths and weight by 60-70% compared to the equivalent close-coupled assembly\./g, replace: 'Fewer leak paths and less weight than the equivalent close-coupled valve assembly.', note: 'unsourced percentage' },
  { shelves: ['oilfield-instrumentation-valves'], find: /Lockable in either open or closed state\. ?/g, replace: '', note: 'unsourced' },
  { shelves: ['oilfield-instrumentation-valves'], find: /Monoflange Valve, 3-Valve Manifold/g, replace: 'Monoflange Valve, Double Block and Bleed', note: 'monoflange is not a 3-valve manifold' },
  // Butterfly valves and accessories
  { shelves: ['butterfly-valves'], find: /as an end-of-line isolator with the downstream pipe removed, up to the 200 psi shut-off rating/g, replace: 'as an end-of-line isolator in liquid service up to 200 psi, with a blind flange attached and the downstream pipe removed (weld-neck or socket flanges only)', note: 'DEMCO dead-end rule' },
  { shelves: ['butterfly-valves'], find: /Reduces operator input torque by 30:1 to 316:1/g, replace: 'Gear ratios from 30:1 to 316:1 by valve size', note: 'ratios, not torque reduction' },
  { shelves: ['butterfly-valves'], find: /NE-D Lightweight-Flange Butterfly Valve/g, replace: 'NE-D Short-Neck Notched-Body Butterfly Valve', note: 'DEMCO describes NE-D as short-neck with body notches' },
  // Yuken BG-03
  { shelves: ['valves-manifolds'], find: /up to 25 MPa \(250 bar\)/g, replace: 'up to 250 kgf/cm² (about 24.5 MPa)', note: 'Yuken India rating' },
  { shelves: ['valves-manifolds'], find: /Maximum operating pressure: 25 MPa \(250 bar\)/g, replace: 'Maximum operating pressure: 250 kgf/cm² (about 24.5 MPa)', note: 'Yuken India rating' },
  { shelves: ['valves-manifolds'], find: /Pressure change: about 5 MPa per turn of the handle\s?/g, replace: '', note: 'unsourced' },
  { shelves: ['valves-manifolds'], find: /up to 25 MPa/g, replace: 'up to 24.5 MPa', note: 'Yuken India rating (title)' },
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
  let changed = 0
  for (const p of products) {
    const data: Record<string, string> = {}
    for (const f of FIELDS) {
      let v = p[f]
      if (!v) continue
      for (const r of RULES) {
        if (!r.shelves.includes(p.category!.slug)) continue
        if (r.skus && !r.skus.test(p.sku)) continue
        const n = (v.match(r.find) ?? []).length
        if (n) {
          hits.set(r.note + ' :: ' + r.find.source.slice(0, 40), (hits.get(r.note + ' :: ' + r.find.source.slice(0, 40)) ?? 0) + n)
          v = v.replace(r.find, r.replace)
        }
      }
      if (v !== p[f]) data[f] = v
    }
    if (Object.keys(data).length) {
      changed++
      console.log(`  ${dryRun ? '[dry-run] ' : ''}${p.sku}: ${Object.keys(data).join(', ')}`)
      if (!dryRun) await db.product.update({ where: { id: p.id }, data })
    }
  }
  console.log(`\n${changed} products changed`)
  for (const r of RULES) {
    const k = r.note + ' :: ' + r.find.source.slice(0, 40)
    console.log(`  ${String(hits.get(k) ?? 0).padStart(3)}  ${k}`)
  }
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
