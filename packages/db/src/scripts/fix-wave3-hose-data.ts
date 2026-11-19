/**
 * Product FAQ programme, Wave 3 — two hose data fixes found by the writers.
 *
 * 1. Aeroquip Chemical Hose Assembly: 14 rows are labelled 1 1/4" (dash 20)
 *    although their part code and their own row text give 3/4" to 4"
 *    (H0523xx: the last two digits are the dash size in sixteenths). The size
 *    is re-read from the code. Fixed in the database and in the
 *    catalogue-maker-hydraulic-hoses payload.
 * 2. Indus A110 / A125 multi-purpose mineral oil hoses: the application text
 *    called them "electrically conductive fuel delivery" hoses while the
 *    listing's own construction is a non-conductive NBR tube. A buyer could
 *    put fuel through a hose that cannot dissipate static. The text now states
 *    what the hose is for and that it is not a fuel-delivery hose. These two
 *    listings were not created from a payload in the repo; database only.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-wave3-hose-data.ts [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const PAYLOAD = join(__dirname, '../../data/catalogue-maker-hydraulic-hoses/catalogue.json')
const AEROQUIP = 'aeroquip-chemical-hose-assembly'

const INCH: Record<number, string> = { 12: '3/4"', 16: '1"', 20: '1 1/4"', 24: '1 1/2"', 32: '2"', 48: '3"', 64: '4"' }
function sizeFromCode(pn: string): number | null {
  const m = /^H0\d{3}(\d{2})-/.exec(pn)
  return m && INCH[Number(m[1])] ? Number(m[1]) : null
}

const NOT_FUEL =
  'The NBR tube is non-conductive, so this is not a fuel-delivery hose: for diesel, petrol or unleaded fuel transfer, use an electrically conductive fuel hose.'
const MINERAL: Record<string, { app: string; seo: string }> = {
  'multi-purpose-mineral-oil-hose-10-bar': {
    app: `Low-pressure (10 bar) multi-purpose hose for mineral oils, lubricating oils and hydraulic oils. ${NOT_FUEL}`,
    seo: 'Indus A110 multi-purpose mineral oil hose, 10 bar, 5–25 mm ID, non-conductive NBR tube for mineral, lubricating and hydraulic oils.',
  },
  'multi-purpose-mineral-oil-air-hose-20-bar': {
    app: `Medium-pressure (20 bar) multi-purpose hose for mineral oils, lubricating and hydraulic oils and compressed air. ${NOT_FUEL}`,
    seo: 'Indus A125 multi-purpose mineral oil and air hose, 20 bar, 6–25 mm ID, non-conductive NBR tube for oils and compressed air.',
  },
}
const OLD_APP = /(?:Low|Medium) pressure, electrically conductive fuel delivery hose for diesel, heating oils and petroleum including unleaded fuel for use across a variety of industries including automotive sector/

async function main() {
  const write = process.argv.includes('--write')

  // 1. Aeroquip rows.
  const aq = await db.product.findUniqueOrThrow({ where: { slug: AEROQUIP }, select: { id: true, variants: true } })
  const rowFixes = aq.variants
    .map((v) => ({ v, dash: sizeFromCode(v.partNumber) }))
    .filter((r) => r.dash !== null && r.v.hoseDash !== r.dash)
  for (const r of rowFixes) console.log(`${r.v.partNumber}: ${r.v.hoseInch} → ${INCH[r.dash!]}`)

  const text = readFileSync(PAYLOAD, 'utf8')
  let payloadFixed = 0
  const lines = text.split('\n')
  // Splice only the touched rows' hoseInch / hoseDash lines (the file's other bytes stay as they are).
  for (const r of rowFixes) {
    const at = lines.findIndex((l) => l.includes(`"partNumber": ${JSON.stringify(r.v.partNumber)}`))
    if (at < 0) continue
    for (let i = at; i < at + 20 && i < lines.length && !/^\s*\},?$/.test(lines[i]!); i++) {
      if (/"hoseInch":/.test(lines[i]!)) { lines[i] = lines[i]!.replace(/"hoseInch": "(?:[^"\\]|\\.)*"/, `"hoseInch": ${JSON.stringify(INCH[r.dash!])}`); payloadFixed++ }
      if (/"hoseDash":/.test(lines[i]!)) lines[i] = lines[i]!.replace(/"hoseDash": \d+/, `"hoseDash": ${r.dash}`)
    }
  }
  writeFileSync(PAYLOAD, lines.join('\n'))
  console.log(`${rowFixes.length} Aeroquip rows to fix; ${payloadFixed} fixed in the payload`)

  // 2. Mineral oil hoses.
  const mineral = await db.product.findMany({
    where: { slug: { in: Object.keys(MINERAL) } },
    select: { id: true, slug: true, descriptionShort: true, descriptionLong: true, seoDescription: true },
  })
  const textFixes = mineral.map((p) => {
    const m = MINERAL[p.slug]!
    return {
      id: p.id,
      slug: p.slug,
      descriptionShort: m.app,
      descriptionLong: (p.descriptionLong ?? '').replace(OLD_APP, m.app),
      seoDescription: m.seo,
      changed: OLD_APP.test(p.descriptionLong ?? '') || OLD_APP.test(p.descriptionShort ?? ''),
    }
  })
  for (const t of textFixes) console.log(`${t.slug}: ${t.changed ? 'application text replaced' : 'already fixed'}`)

  if (!write) {
    console.log('Dry run for the database — add --write to apply.')
    return
  }
  await db.$transaction(async (tx) => {
    for (const r of rowFixes)
      await tx.productVariant.update({ where: { id: r.v.id }, data: { hoseDash: r.dash!, hoseInch: INCH[r.dash!]! } })
    for (const t of textFixes.filter((x) => x.changed))
      await tx.product.update({
        where: { id: t.id },
        data: { descriptionShort: t.descriptionShort, descriptionLong: t.descriptionLong, seoDescription: t.seoDescription },
      })
  }, { timeout: 60_000 })
  console.log('written')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
