/**
 * De-brand the category SEO metadata that the product-level rebrand missed.
 *
 * PR #258 moved 39 hose products from Dixon to Indus and I verified "zero
 * Dixon" afterwards — but that sweep covered `products` and its child tables
 * only. `categories` was never checked, and twelve rows carry Dixon in their
 * `seoTitle` / `seoDescription` / `shortDescription`. These are the <title>
 * tags Google indexes for the category pages, so the de-branding was undone one
 * level up: `/c/air-water-hoses` still titles itself "Dixon A-Series".
 *
 * Nine rows are rewritten here. THREE ARE DELIBERATELY LEFT ALONE —
 * `metallic-hoses`, `metallic-ptfe-hoses` and
 * `metallic-stainless-corrugated-hoses` name Dixon among a list of
 * manufacturers, and that is still true: 4 Dixon products sit in stainless
 * corrugated and 3 in PTFE. Stripping an accurate brand attribution would be
 * as wrong as leaving an inaccurate one.
 *
 * Three rows also carry stale facts, corrected here:
 *   - `specialist-hoses` describes Bulkstream / heat-traced / GSM, all three
 *     deleted in PR #268. Its copy now describes the custom-build service
 *     rather than products that no longer exist.
 *   - `composite-hoses` says "14 bar"; A901GG / A906PG / A911SG were
 *     republished at 20 bar, while A901AG stayed at 14. A single figure can no
 *     longer describe the family, so it is dropped rather than made wrong in a
 *     new way.
 *   - `industrial-steam-hoses` says A235BK is 7 bar; it is now 10.
 *
 * `industrial-hoses` additionally loses "from Dixon Group Europe" and the
 * "PED 2014/68/EU compliant" claim — the same claim removed from every product
 * body, FAQ and spec in PRs #258 and #259. It belongs to Dixon and cannot be
 * reattributed to an own-brand range.
 *
 * Idempotent: a row already free of Dixon is skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/debrand-category-seo.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

type Rewrite = {
  slug: string
  seoTitle: string
  seoDescription: string
  shortDescription: string
}

const REWRITES: readonly Rewrite[] = [
  {
    slug: 'abrasive-hoses',
    seoTitle: 'Abrasive & Bulk-Material Hoses — Indus',
    seoDescription:
      'Indus abrasive & bulk-material hoses: A361 bulk material S&D, PREMFLEX MDSE PVC chemical & abrasion. Sand, cement, slurry, grain.',
    shortDescription:
      'Bulk-material handling hoses for sand, cement, dry powders, slurry, grain. A361 bulk material S&D, PREMFLEX MDSE chemical & abrasion PVC. Heavy-duty NR/PVC tube + helical wire.',
  },
  {
    slug: 'air-water-hoses',
    seoTitle: 'Industrial Air & Water Hoses — Indus A-Series',
    seoDescription:
      'Indus air & water hoses: A101AS-T3 anti-static, A101HP/A102HP/A103HP/A105HP multi-utility, A116EU100 high-temp, A190/A190Y. 20 bar EPDM/SBR. BS 5118/2.',
    shortDescription:
      'Industrial air & water hoses (Indus A-series) — 20 bar working pressure, EPDM/SBR rubber tube and cover, textile reinforcement. Anti-static, multi-utility, high-temperature variants. BS 5118/2, ISO 2398.',
  },
  {
    // DIXOIL / DIXCHEM are Dixon trade names. The bar figure is dropped: three
    // of the four were republished at 20 bar and A901AG stayed at 14, so no
    // single number describes the family any more.
    slug: 'composite-hoses',
    seoTitle: 'Composite Hoses — Oil, Chemical & Vapour Recovery',
    seoDescription:
      'Indus composite hoses: A901GG (oil), A901AG (vapour recovery), A906PG (chemical), A911SG (PTFE chemical). EN 13765:2015 Type 3. Tankers, refineries.',
    shortDescription:
      'Multi-ply composite hoses — A901GG oil, A901AG vapour recovery, A906PG chemical and A911SG PTFE chemical. Internal and external wire helix with polypropylene/polyester layers. EN 13765:2015 Type 3.',
  },
  {
    slug: 'food-beverage-hoses',
    seoTitle: 'Food & Beverage Hoses — Indus Hygienic',
    seoDescription:
      'Indus food & beverage hoses: SANB San-Hygienic Brew, SANF San-Hygienic Food, SANSIL Silicone, DELIKATESSE PVC, PREMVIN. FDA / EU compliant. CIP/SIP.',
    shortDescription:
      'FDA / EU food-grade hoses for hygienic transfer of beverages, dairy and bulk food. SANB / SANF / SANSIL / DELIKATESSE / PREMVIN. CIP/SIP cleaning compatible.',
  },
  {
    // Loses "from Dixon Group Europe" and the PED 2014/68/EU claim — the same
    // claim stripped from every product body, FAQ and spec in PRs #258/#259.
    slug: 'industrial-hoses',
    seoTitle: 'Industrial Hoses — Air, Water, Food, Oil, Steam, Metallic',
    seoDescription:
      'Industrial hoses for air/water, food & beverage, oil & chemical, steam and abrasive service, plus engineered metallic and PTFE hose assemblies. AED pricing, RFQ.',
    shortDescription:
      'Industrial hoses for air, water, food, oil, chemical, steam and abrasive applications. Own-brand Indus rubber and PVC lines alongside engineered metallic and PTFE hose assemblies.',
  },
  {
    // A235BK was republished at 10 bar in PR #258.
    slug: 'industrial-steam-hoses',
    seoTitle: 'Industrial Steam Hoses — Indus A230, A235',
    seoDescription:
      'Indus saturated-steam hoses: A230 (red, 18 bar), A235BK (black, 10 bar), A235BU (food-compatible steam/hot water, 7 bar). EPDM tube + steel-wire reinforcement.',
    shortDescription:
      'Saturated-steam transfer hoses — A230 (red, 18 bar), A235BK (black, 10 bar), A235BU (steam, hot water, food, 7 bar). EPDM tube, steel-wire reinforcement, EPDM cover. BS 5342 / EN ISO 6134.',
  },
  {
    slug: 'oil-chemical-purpose-hoses',
    seoTitle: 'Oil, Chemical & General-Purpose Hoses — Indus',
    seoDescription:
      'Indus oil/chemical hoses: A104/A110/A125 multi-purpose, A420 tanker reeling, A430/A460 oil S&D, A410/A416 UHMWPE chemical, A400EU mud, BAKU PVC.',
    shortDescription:
      'Multi-purpose oil, fuel, mineral oil and chemical hoses. BAKU PVC, A104/A110/A125 multi-purpose, A420 tanker reeling, A430/A460 oil suction & delivery, A400EU mud & sea water, A410/A416 UHMWPE chemical.',
  },
  {
    // The three products this used to advertise were deleted in PR #268, so the
    // copy now describes the custom-build service instead of naming stock.
    slug: 'specialist-hoses',
    seoTitle: 'Specialist & Custom-Built Hoses — Indus',
    seoDescription:
      'Custom-engineered and hand-built hose assemblies from Indus Hydraulics. Bespoke bore sizes, rubber compounds and end-fitting configurations, specified to application on RFQ.',
    shortDescription:
      'Hand-built and custom-engineered hose assemblies. Bespoke rubber compounds, bore sizes and end-fitting configurations, specified to the application by our engineering team on RFQ.',
  },
  {
    slug: 'water-suction-delivery-hoses',
    seoTitle: 'Water Suction & Delivery Hoses — Indus',
    seoDescription:
      'Indus water suction & delivery hoses: A210 (10 bar), A216 (16 bar), DELVAC and IRRIBULK PVC variants. Helical wire reinforced. Dewatering, irrigation, tanker.',
    shortDescription:
      'Helical wire-reinforced suction/delivery hoses for water transfer, dewatering, irrigation and tanker service. 10-16 bar working pressure. A210, A216, DELVAC and IRRIBULK PVC variants.',
  },
] as const

/** Accurate Dixon attributions — these products really are still Dixon. */
const INTENTIONALLY_KEPT = [
  'metallic-hoses',
  'metallic-ptfe-hoses',
  'metallic-stainless-corrugated-hoses',
] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const problems: string[] = []
  let updated = 0

  for (const r of REWRITES) {
    const c = await db.category.findUnique({
      where: { slug: r.slug },
      select: { id: true, slug: true, seoTitle: true, seoDescription: true, shortDescription: true },
    })
    if (!c) {
      problems.push(`${r.slug}: category not found`)
      continue
    }
    const blob = `${r.seoTitle} ${r.seoDescription} ${r.shortDescription}`
    if (/dixon/i.test(blob)) {
      problems.push(`${r.slug}: replacement text still contains Dixon — not applied`)
      continue
    }
    if (c.seoTitle === r.seoTitle && c.seoDescription === r.seoDescription) {
      console.log(`skip ${r.slug} — already rewritten`)
      continue
    }
    console.log(`${dryRun ? '[dry-run] ' : ''}${r.slug}`)
    console.log(`    was: ${c.seoTitle}`)
    console.log(`    now: ${r.seoTitle}`)
    updated++
    if (dryRun) continue
    await db.category.update({
      where: { id: c.id },
      data: {
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
        shortDescription: r.shortDescription,
      },
    })
  }

  // Prove only the intended rows still mention Dixon.
  const remaining = await db.$queryRaw<{ slug: string }[]>`
    SELECT slug FROM categories
    WHERE (name || ' ' || coalesce("shortDescription", '') || ' ' || coalesce("seoTitle", '')
        || ' ' || coalesce("seoDescription", '') || ' ' || coalesce("focusKeyword", '')) ILIKE '%dixon%'
    ORDER BY slug`
  const unexpected = remaining
    .map((x) => x.slug)
    .filter((s) => !INTENTIONALLY_KEPT.includes(s as (typeof INTENTIONALLY_KEPT)[number]))

  console.log(`\n── categories still naming Dixon: ${remaining.length} ──`)
  for (const x of remaining) {
    const kept = INTENTIONALLY_KEPT.includes(x.slug as (typeof INTENTIONALLY_KEPT)[number])
    console.log(`  ${x.slug}${kept ? '  (intentional — Dixon products live here)' : '  <-- UNEXPECTED'}`)
  }
  if (unexpected.length && !dryRun) {
    problems.push(`unexpected Dixon rows remain: ${unexpected.join(', ')}`)
  }

  console.log(`\n── summary ──\nupdated ${updated}`)
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
