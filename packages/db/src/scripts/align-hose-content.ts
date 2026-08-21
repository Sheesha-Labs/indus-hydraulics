/**
 * Align the industrial-hose content with the artwork and finish the de-branding
 * that PR #258 left half-done.
 *
 * Everything here was found by reading the rendered product page and then
 * sweeping every column of every product-attached table — not by checking the
 * columns I happened to think of, which is how each of these survived a run
 * that reported "no problems".
 *
 * Five repairs:
 *
 *   1. STANDARDS — `Applicable Standards` reads "Pressure Equipment Directive
 *      2014/68/EU; ISO 9001 manufacturing" on all 39 hose products. That is the
 *      SAME Dixon claim already stripped from `descriptionLong` and deleted
 *      from 34 FAQs; leaving it in a spec row made the earlier removal
 *      cosmetic. Removed here so the three copies agree.
 *
 *   2. TRADENAMES — `DIXOIL` and `DIXCHEM` are Dixon trade names on A901AG,
 *      A901GG and A906PG. They survived every check because the sweeps matched
 *      the literal string "Dixon", which these do not contain.
 *
 *   3. BRANDING — `Hose Branding (Printed)` describes the lay-line printed on
 *      the cover. On the five rebuilt products it still carried the OLD bar
 *      rating (7/14/14/14) while the body's copy of the same string had been
 *      repointed, so spec and body contradicted each other on one page. All
 *      five are set to what the new artwork actually prints.
 *
 *   4. BURST — the rebuild dropped `Min Burst Pressure` but kept `Safety
 *      Factor`, so the page still implied a burst rating by multiplication.
 *      The founder's call is to publish burst = working x safety factor. This
 *      raises four of the five ABOVE the manufacturer's real burst figure
 *      (A235BK 100 vs 70; the three composites 80 vs 56); A125 lands at 60 vs
 *      a real 75. Recorded here because the numbers are deliberate, not derived
 *      from any datasheet.
 *
 *   5. FAQS — deleting and recreating the five products cascaded away 7 FAQs
 *      each (35 rows) because the recreate carried only `specs`. Rebuilt from
 *      the template every sibling still uses, with each answer's values read
 *      from that product's own specs rather than written by hand.
 *
 * Idempotent throughout: re-running skips what is already correct.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/align-hose-content.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const HOSE_CATEGORY_SLUGS = [
  'abrasive-hoses',
  'air-water-hoses',
  'composite-hoses',
  'food-beverage-hoses',
  'industrial-steam-hoses',
  'oil-chemical-purpose-hoses',
  'specialist-hoses',
  'water-suction-delivery-hoses',
] as const

/**
 * The five rebuilt products. `burst` is working x safety factor, per the
 * founder's explicit choice — NOT a datasheet figure. See the header note.
 */
const REBUILT: readonly {
  sku: string
  layLine: string
  burstBar: number
}[] = [
  { sku: 'IH-IH-A235BK', layLine: 'INDUS LOGO, BLACK SATURATED STEAM HOSE 10 BAR', burstBar: 100 },
  { sku: 'IH-IH-A906PG', layLine: 'INDUS LOGO, CHEMICAL COMPOSITE HOSE 20 BAR', burstBar: 80 },
  { sku: 'IH-IH-A901GG', layLine: 'INDUS LOGO, OIL COMPOSITE HOSE 20 BAR', burstBar: 80 },
  { sku: 'IH-IH-A911SG', layLine: 'INDUS LOGO, PTFE CHEMICAL COMPOSITE HOSE 20 BAR', burstBar: 80 },
  {
    sku: 'IH-IH-A125',
    layLine: 'INDUS LOGO, MULTI-PURPOSE MINERAL OIL & AIR HOSE 20 BAR',
    burstBar: 60,
  },
] as const

const FAQ_TAIL =
  'The branding is printed continuously along the hose for in-field identification — ' +
  'useful for cross-checking against engineering drawings and procurement specs.'

const LEAD_TIME =
  'Common sizes are typically 2-3 weeks ex-works. Custom assemblies (specific lengths, ' +
  'end fittings, certification) typically ship within 4-6 weeks. Indus expedites factory ' +
  'orders for urgent requirements — call out the rig name / project on the RFQ.'

/** Strips Dixon trade names without mangling the surrounding lay-line text. */
function stripTradeNames(s: string): string {
  return s
    .replace(/\bDIXOIL\s*/gi, '')
    .replace(/\bDIXCHEM\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const problems: string[] = []
  const act = async (label: string, fn: () => Promise<unknown>) => {
    if (dryRun) {
      console.log(`  [dry-run] ${label}`)
      return
    }
    await fn()
    console.log(`  ${label}`)
  }

  const cats = await db.category.findMany({
    where: { slug: { in: [...HOSE_CATEGORY_SLUGS] } },
    select: { id: true },
  })
  const catIds = cats.map((c) => c.id)

  // ── 1. The Dixon compliance claim in `Applicable Standards` ───────────────
  const standards = await db.productSpec.findMany({
    where: { product: { categoryId: { in: catIds } }, label: 'Applicable Standards' },
    select: { id: true, productId: true },
  })
  console.log(`\n── standards: ${standards.length} rows carrying Dixon's PED/ISO claim ──`)
  if (standards.length && !dryRun) {
    await db.productSpec.deleteMany({ where: { id: { in: standards.map((s) => s.id) } } })
  }
  console.log(`  removed ${standards.length}`)

  // ── 2. DIXOIL / DIXCHEM trade names ──────────────────────────────────────
  console.log(`\n── tradenames ──`)
  const tnSpecs = await db.productSpec.findMany({
    where: { product: { categoryId: { in: catIds } }, OR: [
      { value: { contains: 'DIXOIL', mode: 'insensitive' } },
      { value: { contains: 'DIXCHEM', mode: 'insensitive' } },
    ] },
    select: { id: true, value: true, product: { select: { sku: true } } },
  })
  for (const s of tnSpecs) {
    const value = stripTradeNames(s.value)
    await act(`spec ${s.product.sku}: ${value.slice(0, 60)}`, () =>
      db.productSpec.update({ where: { id: s.id }, data: { value } })
    )
  }
  const tnProducts = await db.product.findMany({
    where: { categoryId: { in: catIds }, OR: [
      { descriptionLong: { contains: 'DIXOIL', mode: 'insensitive' } },
      { descriptionLong: { contains: 'DIXCHEM', mode: 'insensitive' } },
    ] },
    select: { id: true, sku: true, descriptionLong: true },
  })
  for (const p of tnProducts) {
    const descriptionLong = stripTradeNames(p.descriptionLong ?? '')
    await act(`body ${p.sku}`, () =>
      db.product.update({ where: { id: p.id }, data: { descriptionLong } })
    )
  }

  // ── 3+4. Branding lay-line and burst pressure on the five rebuilt ────────
  console.log(`\n── rebuilt: branding + burst ──`)
  for (const r of REBUILT) {
    const product = await db.product.findUnique({
      where: { sku: r.sku },
      select: { id: true, sku: true, title: true, descriptionLong: true, specs: true },
    })
    if (!product) {
      problems.push(`${r.sku}: not found`)
      continue
    }

    const branding = product.specs.find((s) => s.label === 'Hose Branding (Printed)')
    if (branding && branding.value !== r.layLine) {
      await act(`${r.sku} lay-line -> ${r.layLine}`, () =>
        db.productSpec.update({ where: { id: branding.id }, data: { value: r.layLine } })
      )
    }

    const maxPos = Math.max(...product.specs.map((s) => s.position), 0)
    const existingBurst = product.specs.find((s) => /min burst pressure/i.test(s.label))
    const burstValue = `${r.burstBar} bar`
    if (existingBurst) {
      if (existingBurst.value !== burstValue) {
        await act(`${r.sku} burst -> ${burstValue}`, () =>
          db.productSpec.update({ where: { id: existingBurst.id }, data: { value: burstValue } })
        )
      }
    } else {
      const working = product.specs.find((s) => s.label === 'Max Working Pressure')
      await act(`${r.sku} burst += ${burstValue}`, () =>
        db.productSpec.create({
          data: {
            productId: product.id,
            // `group` is non-nullable; the 34 surviving burst rows all sit in
            // "Performance" alongside Max Working Pressure, so mirror that
            // product's own working-pressure row rather than pick a default.
            group: working?.group ?? 'Performance',
            label: 'Min Burst Pressure',
            value: burstValue,
            unit: working?.unit ?? null,
            position: maxPos + 1,
            isFilterable: false,
          },
        })
      )
    }

    // The body's Performance list lost its burst bullet when the rebuild
    // dropped the spec; put it back next to the working-pressure bullet.
    const body = product.descriptionLong ?? ''
    if (body && !/Min burst pressure/i.test(body)) {
      const next = body.replace(
        /(<li><strong>Max working pressure:<\/strong>[^<]*<\/li>)/i,
        `$1\n<li><strong>Min burst pressure:</strong> ${r.burstBar} bar</li>`
      )
      if (next !== body) {
        await act(`${r.sku} body burst bullet`, () =>
          db.product.update({ where: { id: product.id }, data: { descriptionLong: next } })
        )
      } else {
        problems.push(`${r.sku}: could not place burst bullet in body`)
      }
    }
  }

  // ── 5. Rebuild the 35 cascaded-away FAQs ─────────────────────────────────
  console.log(`\n── faqs ──`)
  for (const r of REBUILT) {
    const p = await db.product.findUnique({
      where: { sku: r.sku },
      select: {
        id: true,
        sku: true,
        descriptionShort: true,
        specs: true,
        _count: { select: { faqs: true } },
      },
    })
    if (!p) continue
    if (p._count.faqs > 0) {
      console.log(`  skip ${r.sku} — already has ${p._count.faqs}`)
      continue
    }
    const spec = (label: string) => p.specs.find((s) => s.label === label)?.value ?? null
    const missing = [
      'Inner Diameter Range',
      'Max Working Pressure',
      'Safety Factor',
      'Operating Temperature',
      'Cover Material',
      'Lining / Tube Material',
      'Reinforcement',
    ].filter((l) => !spec(l))
    if (missing.length) {
      problems.push(`${r.sku}: cannot rebuild FAQs, missing specs — ${missing.join(', ')}`)
      continue
    }

    const rows = [
      { position: 0, question: 'What is this hose used for?', answer: p.descriptionShort ?? '' },
      {
        position: 1,
        question: 'What sizes are available?',
        answer:
          `${spec('Inner Diameter Range')}. Specify the exact inner diameter on the RFQ — ` +
          `We supply multiple bore sizes per family code; lead time depends on size.`,
      },
      {
        position: 2,
        question: 'What is the maximum working pressure?',
        answer:
          `${spec('Max Working Pressure')}. Minimum burst pressure: ${r.burstBar} bar. ` +
          `Safety factor: ${spec('Safety Factor')}.`,
      },
      {
        position: 3,
        question: 'What is the operating temperature range?',
        answer:
          `${spec('Operating Temperature')}. Refer to the datasheet for any de-rating ` +
          `factors at extreme temperatures.`,
      },
      {
        position: 4,
        question: 'What is the construction (cover / lining / reinforcement)?',
        answer:
          `Cover: ${spec('Cover Material')}. Lining/tube: ${spec('Lining / Tube Material')}. ` +
          `Reinforcement: ${spec('Reinforcement')}.`,
      },
      {
        position: 6,
        question: 'What is the printed branding on the hose?',
        answer: `${r.layLine}. ${FAQ_TAIL}`,
      },
      { position: 7, question: 'Lead time?', answer: LEAD_TIME },
    ]
    if (rows.some((x) => /dixon|dixoil|dixchem/i.test(x.answer))) {
      problems.push(`${r.sku}: rebuilt FAQ still carries a Dixon name`)
      continue
    }
    await act(`${r.sku} +${rows.length} faqs`, () =>
      db.productFaq.createMany({ data: rows.map((x) => ({ ...x, productId: p.id })) })
    )
  }

  console.log(`\n── summary ──`)
  if (problems.length) {
    console.log(`${problems.length} problem(s):`)
    for (const x of problems) console.log(`  - ${x}`)
  } else {
    console.log('no problems')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
