/**
 * Correct the Enerpac 4" gauge listing (IH-ENE-GAUGE-G40).
 *
 * The listing called the whole family glycerine-filled, H-series included.
 * Enerpac's G/H-series datasheet says otherwise: the G-series is "Glycerine
 * Filled", the H-series is "High Cycle Dry Gauges … for high cycle and harsh
 * environments". The two H part numbers (H4049L, H4071L) also carried
 * "Glycerin Filled" in their size-table descriptions.
 *
 * The same datasheet table gives the connection for each 100 mm lower-mount
 * part — G4088L, G4089L and H4049L are 1/4" NPTF; G4039L, G4040L and H4071L are
 * 1/2" NPTF — so the size table now carries the connection on every row instead
 * of on two of six.
 *
 * The SEO title and description were also cut off mid-phrase ("(G and",
 * "Quote by Enerpac part"). The slug is left as it is: changing it would need a
 * redirect for no gain.
 *
 * Idempotent: every value is written outright.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-enerpac-g40-h-series.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const SKU = 'IH-ENE-GAUGE-G40'

const TITLE = 'Enerpac 4" Hydraulic Pressure Gauges: Glycerine-Filled G-Series and High-Cycle Dry H-Series'
const SEO_TITLE = 'Enerpac 4" Hydraulic Pressure Gauges: G-Series and H-Series'
const SHORT =
  'Enerpac 100 mm (4") lower-mount hydraulic pressure gauges: glycerine-filled G-series to 10,000 and 15,000 psi, and dry H-series high-cycle gauges to 10,000 psi, with 1/4" or 1/2" NPTF connections.'
const SEO_DESCRIPTION =
  'Enerpac 4" hydraulic pressure gauges: glycerine-filled G-series to 10,000 and 15,000 psi and dry H-series high-cycle gauges, 1/4" or 1/2" NPTF. Quote by part number.'
const LONG = [
  '<p>Enerpac 100 mm (4") lower-mount hydraulic pressure gauges in two builds: glycerine-filled G-series gauges to 10,000 and 15,000 psi, and dry H-series high-cycle gauges to 10,000 psi. Each comes with a 1/4" or a 1/2" NPTF connection, and all read in dual psi and bar scales.</p>',
  '<h3>G-series or H-series</h3>',
  '<ul>',
  '<li><strong>G-series, glycerine-filled.</strong> Enerpac seals and damps all the pressure-sensing parts in glycerine for long life, and fits a safety blow-out disc and a pressure-equalising membrane. Enerpac recommends a gauge snubber or needle valve for high-cycle applications.</li>',
  '<li><strong>H-series, dry, high-cycle.</strong> Enerpac designs these for high-cycle work and harsh environments, and recommends a snubber or needle valve to shut the gauge off when it is not in use.</li>',
  '</ul>',
  '<h3>Choosing a range</h3>',
  '<p>Enerpac advises running a gauge at no more than about 75% of full scale in normal use, so pick a range whose full reading sits well above the working pressure. The Sizes &amp; Part Numbers tab lists every range and connection with its part number, from 0–10,000 psi to 0–15,000 psi.</p>',
  '<h3>How to order</h3>',
  '<p>Quote the Enerpac part number, or the range, build (filled or dry) and connection you need. Price and lead time are confirmed with the quotation.</p>',
].join('')

const VARIANTS: Record<string, { item: string; ports: string }> = {
  G4088L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 10000 PSI, Glycerin Filled, Lower Mount, 1/4" NPTF', ports: '1/4" NPTF' },
  G4039L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 10000 PSI, Glycerin Filled, Lower Mount, 1/2" NPTF', ports: '1/2" NPTF' },
  H4049L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 10000 PSI, High Cycle, Dry, Lower Mount, 1/4" NPTF', ports: '1/4" NPTF' },
  H4071L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 10000 PSI, High Cycle, Dry, Lower Mount, 1/2" NPTF', ports: '1/2" NPTF' },
  G4089L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 15000 PSI, Glycerin Filled, Lower Mount, 1/4" NPTF', ports: '1/4" NPTF' },
  G4040L: { item: 'Hydraulic Pressure Gauge, 4" Display Face, 15000 PSI, Glycerin Filled, Lower Mount, 1/2" NPTF', ports: '1/2" NPTF' },
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const p = await db.product.findUniqueOrThrow({ where: { sku: SKU }, include: { variants: true } })

  const variantWrites = p.variants.map((v) => {
    const next = VARIANTS[v.partNumber]
    if (!next) throw new Error(`unexpected variant ${v.partNumber}`)
    const dims = { ...((v.dimensions as Record<string, string> | null) ?? {}), item: next.item, ports: next.ports }
    console.log(`${v.partNumber}: ${next.item}`)
    return db.productVariant.update({ where: { id: v.id }, data: { dimensions: dims } })
  })
  console.log(`title: ${TITLE}`)

  if (dryRun) {
    console.log('[dry-run] nothing written')
  } else {
    await db.$transaction([
      db.product.update({
        where: { id: p.id },
        data: { title: TITLE, seoTitle: SEO_TITLE, descriptionShort: SHORT, seoDescription: SEO_DESCRIPTION, descriptionLong: LONG },
      }),
      ...variantWrites,
    ])
    console.log(`updated ${SKU} and ${variantWrites.length} size rows; slug ${p.slug}`)
  }
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
