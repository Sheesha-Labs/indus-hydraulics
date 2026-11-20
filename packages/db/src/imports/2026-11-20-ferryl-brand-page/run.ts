/**
 * Ferryl brand page — after Ferryl Waves 1 and 2 (#645, #648).
 *
 * Writes the `ferryl` brand record (description, SEO fields, partner year) and
 * its Pages & Blocks document `brand/ferryl`: every BRAND_SECTIONS band in
 * template order, the series heading, an eight-question FAQ and the closing
 * call to action. The logo was uploaded separately to
 * `product-images/brands/logos/ferryl-logo.png` and is already linked. The
 * brand row is already published (its listings link to it).
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-ferryl-brand-page/run.ts            # dry run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-ferryl-brand-page/run.ts --write    # write copy
 *
 * Every claim matches the Ferryl listings. There is no "authorised distributor"
 * wording (territory not yet confirmed), and no environmental, toxicity or
 * approval claim. No agent, distributor or supplier is named (CLAUDE.md §14).
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { BRAND_SECTIONS, brandPageDef, subPageContentKey, validateSections, type StoredSection } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

const SLUG = 'ferryl'
const NAME = 'Ferryl'

const BRAND = {
  description:
    'Ferryl makes rust protection and maintenance products for ships: 202 Standard, 202 White and 202 Aluminium anticorrosive greases, 101 wire rope oil and 103 drying oil, the Ferryl Wire Rope Lubricator and Pump Unit, 400R, 401, 502 and 505 flexible anticorrosive and fluorescent coatings, Ferrycid rust remover, Rustoil penetrating oil, degreasers and cleaners, Air-Refreshment odour neutraliser and Armacit pipe sealant. Founded in Sweden in 1955, Ferryl manufactures in Germany. Indus Hydraulics distributes Ferryl in the Middle East.',
  seoTitle: 'Ferryl — Wire Rope Grease & Ship Maintenance Chemicals',
  seoDescription:
    'Ferryl wire rope grease and oils, Wire Rope Lubricator, flexible anticorrosive and fluorescent coatings, rust remover, cleaners and pipe sealant, supplied in the Middle East.',
  focusKeyword: 'Ferryl wire rope grease',
  isAuthorizedDistributor: false,
  country: 'Germany',
  partnerSince: 2026,
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What does Ferryl make?',
    a: 'Ferryl makes rust protection and maintenance products for shipping: wire rope greases and oils, a pressure wire rope lubricator, flexible anticorrosive and fluorescent safety coatings, a rust remover, a penetrating oil, degreasers and cleaners, an odour neutraliser and a pipe sealant. The range is built for steel and rubber that live on open deck, in salt spray and in climates from freezing to tropical.',
  },
  {
    q: 'Where are Ferryl products made?',
    a: 'Ferryl was founded in Sweden in 1955. Its products are made by Ferryl Deutschland GmbH in Germany, which also developed the Ferryl Wire Rope Lubricator, and Ferryl Sales Ltd on the Isle of Man runs worldwide sales. The country of origin on every listing is Germany.',
  },
  {
    q: 'Which Ferryl grease should I use on wire rope?',
    a: 'Ferryl 202 Standard is the general wire rope grease for mooring, crane and ramp wires; 202 White does the same job where a dark grease would stain white paintwork, such as lifeboat falls and ro-ro ramp wires. On new wires, or in cold climates, put Ferryl 101 oil on first for core penetration; the two are fully compatible and can be mixed.',
  },
  {
    q: 'What is the Ferryl Wire Rope Lubricator?',
    a: 'It is an aluminium pressure chamber clamped around the wire. Grease is pumped in at up to 400 bar, forced into the core and the water pushed out, and the wire leaves with an even coat inside and out at up to 40 m/min. It takes wires from 1 to 50 mm, and the XL model 50 to 90 mm; seals, scraper plates and groove cleaners are sized to each wire.',
  },
  {
    q: 'Which Ferryl coating goes on hoses, stainless steel or safety markings?',
    a: 'Ferryl 400R, a white flexible coating, protects rubber hoses, cables and standing rigging from UV and salt. Ferryl 401 is a clear coating that keeps stainless steel and brass bright. Ferryl 502 (fluorescent orange-red) and 505 (fluorescent yellow) mark hazards and safety equipment. Prepare the surface and thin the coatings with Ferryl 404.',
  },
  {
    q: 'How are Ferryl part numbers shown on this site?',
    a: 'Each Ferryl listing has an Indus part number for every pack size: IH-FRY-, the product code, then the pack — for example IH-FRY-202S-25KG for a 25 kg drum of 202 Standard or IH-FRY-401-1KG-X10 for a pack of ten 1 kg tins of 401. The size table on each listing gives every pack.',
  },
  {
    q: 'Do you supply safety data sheets for Ferryl products?',
    a: 'Yes. Safety data sheets are available on request for every Ferryl chemical, and each listing describes the product, its uses and its packs. Tell us the products and the documents your vessel, yard or customs broker needs with your enquiry.',
  },
  {
    q: 'How do I order Ferryl products from Indus Hydraulics?',
    a: 'Send the product name and pack size with the quantity and the delivery port or address. If you are not sure which product fits, describe the job — the wire, rail, surface or equipment and the problem — and we recommend the Ferryl product and confirm availability and delivery.',
  },
]

const COPY: Record<string, Record<string, unknown>> = {
  series: { heading: 'Ferryl product families' },
  faq: { eyebrow: 'Ferryl FAQ', heading: 'Buying Ferryl from Indus Hydraulics', items: FAQ },
  lead: {
    heading: 'Tell us the job, we match the Ferryl product',
    body: 'Send the product and pack, or the wire, rail, surface or equipment you need to protect or clean, and we reply within one business day with the right Ferryl product, availability and a fixed-price quote.',
  },
}

async function main() {
  const write = process.argv.includes('--write')

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
  console.log(`[ferryl-brand] brand ${brand.isPublished ? 'published' : 'unpublished'}, logo ${brand.logoId ? 'linked' : 'missing'}`)
  console.log(`[ferryl-brand] ${existing ? 'replace' : 'create'} ${key}: ${stored.map((s) => s.key).join(', ')}; ${FAQ.length} FAQs`)

  if (!write) {
    console.log('[ferryl-brand] dry run — pass --write to apply')
    return
  }
  await db.brand.update({ where: { id: brand.id }, data: BRAND })
  const sections = stored as unknown as Prisma.InputJsonValue
  await db.pageContent.upsert({ where: { key }, create: { key, kind: 'brand', sections }, update: { sections } })
  console.log('[ferryl-brand] brand record and page document written')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
