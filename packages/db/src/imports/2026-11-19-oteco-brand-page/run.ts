/**
 * Oteco brand page — Wave 5 of the Oteco catalogue.
 *
 * Writes the `oteco` brand record (description, SEO fields, partner year) and
 * its Pages & Blocks document `brand/oteco`: every BRAND_SECTIONS band in
 * template order, the series heading, an eight-question FAQ and the closing
 * call to action. The logo was uploaded separately to
 * `product-images/brands/logos/oteco-logo.png` and is already linked.
 *
 * It does NOT publish the brand. Publish it only after the Oteco catalogue
 * payloads (#629, #630, #631) are loaded with --publish, so the page never
 * goes live without products:
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-oteco-brand-page/run.ts            # dry run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-oteco-brand-page/run.ts --write    # write copy
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-oteco-brand-page/run.ts --publish  # after the catalogue load
 *
 * Every claim matches the Oteco listings: interchange only where Oteco
 * publishes it, DNV/ABS only where Oteco states it, no API monogram or NACE
 * claim. No distributor or supplier is named (CLAUDE.md §14).
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { BRAND_SECTIONS, brandPageDef, subPageContentKey, validateSections, type StoredSection } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

const SLUG = 'oteco'
const NAME = 'Oteco'

const BRAND = {
  description:
    'Oteco Inc. of Houston, Texas, makes drilling and wellsite equipment: Model 72 and DM gate valves, PRV shear-pin and RRV reset relief valves, Model 6, 7 and 8 drilling pressure gauges, drill pipe float valves, long-sweep manifold fittings and the OTECO connector, BOP and stripper rubber, pipe wipers and mud guards, mud pump pistons, valves and dampener diaphragms, and swivel washpipe and packing. Indus Hydraulics is an authorised Oteco distributor for the Middle East and holds Oteco stock in Dubai, UAE.',
  seoTitle: 'Oteco Distributor UAE — Gate Valves, Gauges & Rig Parts',
  seoDescription:
    'Authorised Oteco distributor for the Middle East: Model 72 and DM gate valves, PRV and RRV relief valves, drilling gauges, float valves, rig rubber and spares. Stock in Dubai.',
  focusKeyword: 'Oteco distributor UAE',
  isAuthorizedDistributor: true,
  country: 'United States',
  partnerSince: 2026,
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is Indus Hydraulics an authorised Oteco distributor?',
    a: 'Yes. Indus Hydraulics is an authorised Oteco distributor for the Middle East. We hold Oteco stock at our warehouse in Dubai, UAE, supply complete valves and gauges as well as repair kits, spares and rubber goods, and ship across the GCC and worldwide.',
  },
  {
    q: 'What does Oteco make?',
    a: 'Oteco Inc. makes drilling and wellsite equipment in Houston, Texas: Model 72 and DM gate valves with their kits and spares, PRV shear-pin and RRV reset relief valves, Model 6, 7 and 8 drilling pressure gauges, drill pipe float valves, long-sweep manifold fittings and goosenecks, the OTECO connector, annular BOP and stripper rubber, pipe and kelly wipers, mud and oil guards, wireline guides, mud pump pistons, valves, seats and dampener diaphragms, and swivel washpipe and packing.',
  },
  {
    q: 'Which Oteco parts interchange with other makes?',
    a: 'Only those Oteco itself publishes. Model 72 gate valve parts interchange with Cameron Type S Flex-Seal valve parts; PRV relief valve parts with Cameron-style shear relief valves; the RRV bonnet assembly with Cameron Type A and B reset relief valves; the Model 6 and Model 7 gauges with the Cameron, Totco, Geosource, Wadeco and Gauges International models Oteco lists; and the OTECO connector with Grayloc clamp connectors. Hammer-union ends are made to mate with FMC Weco unions (Oteco bulletin EB-004). Oteco publishes no interchange for the DM gate valve, so we match DM parts by Oteco part number.',
  },
  {
    q: 'How are Oteco part numbers shown on this site?',
    a: 'Every Oteco listing carries the Oteco part number with our prefix: IH-OTC- followed by the Oteco number, for example IH-OTC-110000. The size table on each listing gives every part number with its model, size, pressure and service, so you can order from the number on your nameplate or bill of materials.',
  },
  {
    q: 'Do Oteco valves and gauges come in sour gas service?',
    a: 'Yes. Oteco offers sour gas (H2S) trims on the Model 72 and DM gate valves, the PRV and RRV relief valves, the drilling pressure gauges and the float valves, and sour gas service on its manifold fittings. Each listing shows the trim of every part number in its size table, alongside standard, stainless and, where offered, cold-service trims.',
  },
  {
    q: 'What certification do Oteco products carry?',
    a: 'Oteco Inc. holds ISO 9001 certification. Oteco states DNV type approval for the listed PRV relief valve models, ABS and DNV approval for selected RRV models, and ABS or DNV certification of gauge units on request. Oteco literature makes no API monogram or NACE claim for these products, so neither do we. Tell us what documentation your project needs and we confirm it with Oteco before you order.',
  },
  {
    q: 'Where are Oteco products made?',
    a: 'Oteco makes its equipment in Houston, Texas, and the country of origin is the United States. We ship from stock in Dubai, or bring parts in from Oteco in Houston where a part number is not on the shelf.',
  },
  {
    q: 'What should I send to order Oteco parts?',
    a: 'The Oteco part number is the quickest route. Otherwise send the equipment and model (for example a Model 72 gate valve, a Model 6 gauge or the pump and liner size), the size, the working pressure and the service, and a nameplate photo if you have one. We confirm the part and the delivery and quote by return.',
  },
]

const COPY: Record<string, Record<string, unknown>> = {
  series: { heading: 'Oteco product families' },
  faq: { eyebrow: 'Oteco FAQ', heading: 'Buying Oteco from Indus Hydraulics', items: FAQ },
  lead: {
    heading: 'Send us the Oteco part number',
    body: 'Send the Oteco part number, or the equipment, model, size, pressure and service, and we reply within one business day with availability from Dubai, lead time and a fixed-price quote.',
  },
}

async function main() {
  const write = process.argv.includes('--write')
  const publish = process.argv.includes('--publish')

  const brand = await db.brand.findUnique({ where: { slug: SLUG }, select: { id: true, name: true, logoId: true, isPublished: true } })
  if (!brand) throw new Error(`brand ${SLUG} not found`)
  if (!brand.logoId) console.warn('warning: brand has no logo')

  const def = brandPageDef({ name: NAME, slug: SLUG })
  const doc: StoredSection[] = BRAND_SECTIONS.map((d) => ({ key: d.key, enabled: true, values: { ...(COPY[d.key] ?? {}) } }) as StoredSection)
  const result = validateSections(def, doc)
  if (!result.ok) {
    console.error(result.issues)
    throw new Error('page document failed validation')
  }
  const stored = result.sections
  const faqItems = (stored.find((s) => s.key === 'faq')?.values.items ?? []) as unknown[]
  if (faqItems.length !== FAQ.length) throw new Error(`FAQ lost in validation: ${faqItems.length}/${FAQ.length}`)

  const key = subPageContentKey('brand', SLUG)
  const existing = await db.pageContent.findUnique({ where: { key }, select: { key: true } })
  console.log(`[oteco-brand] brand ${brand.isPublished ? 'published' : 'unpublished'}, logo ${brand.logoId ? 'linked' : 'missing'}`)
  console.log(`[oteco-brand] ${existing ? 'replace' : 'create'} ${key}: ${stored.map((s) => s.key).join(', ')}; ${FAQ.length} FAQs`)

  if (publish) {
    const live = await db.product.count({ where: { brandId: brand.id, status: 'active' } })
    if (live === 0) throw new Error('no active Oteco products — load the catalogue payloads with --publish first')
    await db.brand.update({ where: { id: brand.id }, data: { isPublished: true } })
    console.log(`[oteco-brand] published (${live} active products)`)
    return
  }
  if (!write) {
    console.log('[oteco-brand] dry run — pass --write to apply')
    return
  }
  await db.brand.update({ where: { id: brand.id }, data: BRAND })
  const sections = stored as unknown as Prisma.InputJsonValue
  await db.pageContent.upsert({ where: { key }, create: { key, kind: 'brand', sections }, update: { sections } })
  console.log('[oteco-brand] brand record and page document written')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
