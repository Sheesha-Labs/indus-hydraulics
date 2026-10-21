/**
 * Rewrite metallic hose, guard and insulation listings, and correct four marine hose listings, against maker data.
 *
 * Why: research for the hose-specials blog wave (2026-10-21) found the metallic listings were generated from one
 * template — ISO 10380, PED Module H and "hydrotested" on fabric jackets, "vacuum-jacketed" and "boil-off 1-3% per
 * day" on hoses the maker builds with a foam cover, fire jackets "continuous to +1093 °C" that the maker rates 260 °C
 * continuous, interlocked guards described as corrugated pressure cores. Each rewrite below states only what the
 * maker publishes. Sources: Thorburn Flex Metallic Hose Assemblies catalogue (pp. 4, 20–23, 30–40), Thorburn
 * ThermaCover brochure, Witzenmann stripwound hose page, and the marine hose maker’s product pages for the marine series figures.
 *
 * Not rewritten (held for review, not linked from the blog): listings whose product could not be confirmed with its
 * maker — see SKIPPED.
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-hose-listings-2026-10-21.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

import { HELD_SKUS } from '../imports/2026-10-21-blog-hose-specials/held'

const db = new PrismaClient()

/** Held for review: each product could not be confirmed with its maker. */
// IH-MH-HOSE-MASTER-CGA96-AR — "CGA96" is a Canadian Gas Association fuel-gas certification, not an argon hose; not on the maker's certification list
// IH-MH-THORBURN-CGA96-O2 — CGA96 is not an oxygen standard; 200 bar unsupported
// IH-MH-SENIOR-FLEX-BARTLETT-FIRESAFE — Bartlett is a maker site, not a product line; API 6FA is a valve fire test
// IH-MH-THORBURN-THERMACOVER-CRYO — the maker's cryogenic cover is Cryo-Therm foam, not a ThermaCover product
// IH-MH-SENIOR-FLEX-CRYO-LNG, IH-MH-SENIOR-FLEX-TSJ-CHEMICAL, IH-MH-WITZENMANN-CRYO-LAR — maker data unavailable; ratings unverified
const SKIPPED = HELD_SKUS

type Rewrite = { title?: string; short: string; long: string }

const ORDER = '<h3>How to order</h3><p>Send the bore, overall length, both end connections, the fluid, its pressure and temperature, and any certification the project needs. We will confirm the build with the maker and quote it.</p>'

const guard = (what: string, body: string, apps: string[]) =>
  `<p>${what}</p><h3>Construction and ratings</h3>${body}<h3>Applications</h3><ul>${apps.map((a) => `<li>${a}</li>`).join('')}</ul>${ORDER}`

const LS = (mat: string) =>
  guard(
    `The <strong>Thorburn LS Series lock-section hose in ${mat}</strong> is an interlocked metal hose: a single metal strip spirally wound into an S-profile, so each turn locks into the next. It is primarily designed for conveying air, exhaust and dry bulk products, and as a protective casing over other hoses and cables.`,
    '<ul><li>Interlocked S-profile strip — flexible, crush-resistant and pull-out resistant.</li><li>Not leak-tight on its own: interlocked hose can be supplied packed for additional leak-proofing.</li><li>Temperature is set by the packing — cotton or elastomer to 180 °F, Pyro-Pak to 1000 °F, hard copper or stainless wire packing to 1200 °F.</li></ul>',
    ['Engine exhaust and hot-air ducting', 'Dust collection, ventilation and fume extraction', 'Grain and dry bulk transfer', 'Protective casing over hose and cable'],
  )

const AF = (mat: string) =>
  guard(
    `The <strong>Thorburn AF Series Armor-Flex hose guard in ${mat}</strong> is an outer shield for metallic and elastomeric hoses, made of concave and convex sections that roll off each other. Unlike interlocked hose there are no interlocking parts to restrict bending.`,
    '<ul><li>Ball-joint sections slide over the hose and articulate with it.</li><li>Protects against impact, abrasion and molten splash.</li><li>Combined with insulation, Thorburn rates Armor-Flex for environments up to 1100 °C.</li><li>Offered in carbon steel (AF), 304 stainless (AFS4) and 316 stainless (AFS6).</li></ul>',
    ['Hoses near hot work, furnaces and molten metal', 'Hoses exposed to impact or dragging', 'Abrasion protection on moving equipment'],
  )

const SFM = (mat: string) =>
  guard(
    `The <strong>Thorburn SFM Series Smooth-Flex hose in ${mat}</strong> is interlocked metal hose with a smooth liner inside, designed for pneumatic and gravity feeding of bulk materials — grain, pellets, sawdust and powders — and for flue ducts. Bulk material flows smoothly in one direction only.`,
    '<ul><li>Interlocked armour with a smooth inner liner.</li><li>Low pressure: from vacuum (−5 to −20 inHg) to about +15–20 psi, depending on packing; unpacked hose has no pressure rating.</li><li>Temperature depends on packing and material — up to 400 °F on galvanised steel versions, up to 1500 °F on stainless versions with stainless packing.</li></ul>',
    ['Pneumatic conveying of grain, pellets and powders', 'Gravity feed from silos and hoppers', 'Flue and exhaust ducting'],
  )

const CRYO = (gas: string, ends: string) =>
  guard(
    `A <strong>Thorburn cryogenic transfer hose for ${gas}</strong>: braided corrugated stainless hose built for cryogenic unloading and transfer, with optional armour and a Cryo-Therm foam insulation cover.`,
    `<ul><li>Maximum operating pressure 400 psi (27.6 bar) for Thorburn’s cryogenic unloading hose; high-pressure versions are available to 3,500 psi.</li><li>Operating temperature −269 °C to 538 °C.</li><li>${ends}</li><li>Cryo-Therm cover (−196 to 302 °C) cuts heat gain; Thorburn gives an example of 25 L of LN2 lost per fill on a bare hose against 2.5 L with the cover.</li><li>Vacuum-jacketed cryogenic hose is a separate Thorburn design (TJHC) — ask if the duty needs it.</li></ul>`,
    ['Bulk tanker unloading to storage', 'Plant and laboratory fill lines', 'Dewar and cylinder filling'],
  )

const REWRITES: Record<string, Rewrite> = {
  'IH-MH-THORBURN-LS-304SS': { short: 'Thorburn LS lock-section interlocked hose in 304 stainless — for air, exhaust and dry bulk, and as a protective casing. Not leak-tight unless packed.', long: LS('304 stainless steel') },
  'IH-MH-THORBURN-LS-CS': { short: 'Thorburn LS lock-section interlocked hose in carbon steel — for air, exhaust and dry bulk, and as a protective casing. Not leak-tight unless packed.', long: LS('carbon steel') },
  'IH-MH-THORBURN-AF-CS': { short: 'Thorburn AF Armor-Flex ball-joint hose guard in carbon steel — articulated outer shield for metallic and rubber hoses against impact, abrasion and molten splash.', long: AF('carbon steel') },
  'IH-MH-THORBURN-AF-304SS': { short: 'Thorburn Armor-Flex ball-joint hose guard in 304 stainless — articulated outer shield for metallic and rubber hoses against impact, abrasion and molten splash.', long: AF('304 stainless steel') },
  'IH-MH-THORBURN-SFM-HDG': { short: 'Thorburn SFM Smooth-Flex interlocked hose with a smooth liner, hot-dip galvanised steel — for pneumatic and gravity conveying of dry bulk; up to 400 °F.', long: SFM('hot-dip galvanised carbon steel') },
  'IH-MH-THORBURN-SFM-S4': { short: 'Thorburn SFM Smooth-Flex interlocked hose with a smooth liner, 304 stainless — for pneumatic and gravity conveying of dry bulk materials.', long: SFM('304 stainless steel') },
  'IH-MH-THORBURN-SFM-S6': { short: 'Thorburn SFM Smooth-Flex interlocked hose with a smooth liner, 316 stainless — for pneumatic and gravity conveying of dry bulk materials.', long: SFM('316 stainless steel') },
  'IH-MH-THORBURN-FJ72-FIRE-JACKET': {
    short: 'Thorburn FJ72 Fry-Sil fire jacket — woven fibreglass with iron-oxide silicone rubber; 260 °C continuous, 1090 °C for 15–20 minutes, 1650 °C for 15–30 seconds.',
    long: guard(
      'The <strong>Thorburn FJ72 Fry-Sil fire jacket</strong> is a sleeve of woven fibreglass insulation coated with 100% iron-oxide silicone rubber, slid over hoses, cables and wiring to protect them from heat, flame and molten splash.',
      '<ul><li>Continuous: 500 °F (260 °C).</li><li>15–20 minutes: up to 2000 °F (1090 °C).</li><li>15–30 seconds: up to 3000 °F (1650 °C).</li><li>Oil- and water-resistant; “Danger Red” colour.</li><li>Ordered by the ID of the hose it covers and the length (for example FJ72-16-25: 1 in ID, 25 ft).</li></ul>',
      ['Hydraulic hoses near furnaces, ladles and welding', 'Cables and wiring near hot surfaces', 'Protection against molten metal splash'],
    ),
  },
  'IH-MH-THORBURN-FJ73-FIRE-TAPE': {
    short: 'Thorburn FJ73 Fry-Sil fire tape — the wrap-on version of the FJ72 jacket, for hoses, wires and cables that cannot be disconnected. 1, 2 and 3 in widths.',
    long: guard(
      'The <strong>Thorburn FJ73 Fry-Sil fire tape</strong> is the tape form of the FJ72 fire jacket — fibreglass with iron-oxide silicone rubber — for use where a sleeve cannot be installed, such as hoses, wires and cables that cannot be disconnected.',
      '<ul><li>Same material and ratings as FJ72: 260 °C continuous, 1090 °C for 15–20 minutes, 1650 °C for 15–30 seconds.</li><li>Widths 1 in (code 16), 2 in (32) and 3 in (48).</li></ul>',
      ['Retrofit protection on installed hoses and cables', 'Covering joints and short exposed sections'],
    ),
  },
  'IH-MH-THORBURN-M96ZC-RAIL': {
    short: 'Thorburn M96ZC Monel chlorine transfer hose for rail-car loading — Monel 400 core and braid, Armor-Flex guard, to Chlorine Institute Pamphlet 6 Appendix A; every assembly tested at 750 psi.',
    long: guard(
      'The <strong>Thorburn M96ZC</strong> is an all-Monel chlorine transfer hose for loading and unloading rail tank cars.',
      '<ul><li>Monel 400 corrugated core with Monel wire braid and Monel 60 filler, TIG welded, with an Armor-Flex outer guard.</li><li>Complies with Chlorine Institute Pamphlet 6, Appendix A; Thorburn also cites Chlorine Institute Specification 135-3.</li><li>All assemblies tested at 750 psi, then permanently tagged, cleaned and capped.</li><li>End options include Monel nipples, unions, Class 150 flanges and lap-joint stub ends.</li></ul>',
      ['Rail tank car chlorine loading and unloading', 'Chlorine transfer at water-treatment and chemical plants'],
    ),
  },
  'IH-MH-THORBURN-M96ZC-TANKER': {
    short: 'Thorburn M96ZC Monel chlorine transfer hose for tanker trucks — Monel 400 core and braid, Armor-Flex guard, to Chlorine Institute Pamphlet 6 Appendix A; tested at 750 psi.',
    long: guard(
      'The <strong>Thorburn M96ZC</strong> all-Monel chlorine transfer hose, built for tanker-truck loading and unloading.',
      '<ul><li>Monel 400 corrugated core, Monel braid and Monel 60 filler, TIG welded, Armor-Flex guard.</li><li>Complies with Chlorine Institute Pamphlet 6, Appendix A.</li><li>Every assembly tested at 750 psi, tagged, cleaned and capped.</li></ul>',
      ['Chlorine tanker truck loading and unloading'],
    ),
  },
  'IH-MH-THORBURN-SURETEMP-1IN': {
    short: 'Thorburn Sure-Temp electrically heated metal hose, 1 in — spiral MI-cable heating element, Pt100 RTD and programmable controller; liquid service 5–250 °C, typical design to 300 psi (20 bar).',
    long: guard(
      'The <strong>Thorburn Sure-Temp</strong> is a metal hose with a spiral mineral-insulated heating cable, a 100 Ω platinum RTD and a programmable controller, holding the product at a set temperature without steam tracing.',
      '<ul><li>Liquid service: holding temperature 5–250 °C, bores 8–200 mm.</li><li>Gas analysis service: 5–450 °C, bores 4–50 mm.</li><li>Typical design pressure from full vacuum to 300 psi (20 bar).</li><li>TFTC-01 controller programmable from −50 to 500 °C.</li><li>Available with Factory Mutual approval for Class I, Division 2, Group D areas.</li></ul>',
      ['Adhesive, bitumen and wax transfer', 'Flue-gas and emission sampling lines', 'Food and pharmaceutical dosing'],
    ),
  },
  'IH-MH-THORBURN-SURETEMP-EX-2IN': {
    title: 'Thorburn Sure-Temp Electrically-Heated Hose, 2 in (FM Class I Div 2 option)',
    short: 'Thorburn Sure-Temp electrically heated metal hose, 2 in — available with FM approval for Class I, Division 2, Group D areas; typical design to 300 psi (20 bar).',
    long: guard(
      'The <strong>Thorburn Sure-Temp</strong> 2 in electrically heated metal hose, offered with Factory Mutual approval for Class I, Division 2, Group D hazardous locations.',
      '<ul><li>Spiral MI-cable heating element, 100 Ω Pt RTD and programmable controller.</li><li>Liquid service 5–250 °C; gas analysis service 5–450 °C.</li><li>Typical design pressure full vacuum to 300 psi (20 bar).</li><li>The maker states FM Class I Div 2 Group D approval; confirm any ATEX or IECEx zone requirement before ordering.</li></ul>',
      ['Heated transfer in classified areas of refineries and chemical plants', 'Bitumen and heavy-oil transfer'],
    ),
  },
  'IH-MH-THORBURN-TSJ-2IN-ASPHALT': {
    short: 'Thorburn steam-jacketed hose, 2 in — a hose within a hose, steam in the jacket keeping asphalt, pitch or sulphur fluid. Pressure and temperature confirmed per build.',
    long: guard(
      'A <strong>Thorburn steam-jacketed hose</strong> is “a hose within a hose”: the inner hose carries the product, the outer carries steam through port couplings in the outer hose, and both act independently as pressure carriers.',
      '<ul><li>Steam-jacketed (TJHS) design for asphalt, pitch, slurry and viscous chemicals, freeze protection and sampling.</li><li>Ratings depend on the inner and outer hose sizes and the jacket medium — confirmed for each build.</li></ul>',
      ['Asphalt and pitch loading', 'Molten sulphur transfer', 'Viscous chemical transfer that must not cool'],
    ),
  },
  'IH-MH-THORBURN-TSJ-3IN-MOLTEN': {
    short: 'Thorburn steam-jacketed hose, 3 in — hose within a hose for molten and viscous products. Pressure and temperature confirmed per build.',
    long: guard(
      'A 3 in <strong>Thorburn steam-jacketed hose</strong>: product in the inner hose, steam or heating medium in the jacket, each a separate pressure carrier.',
      '<ul><li>Steam-jacketed (TJHS) design; a double-containment version (TJHD) with optional breach warning is also available.</li><li>Ratings confirmed for each build.</li></ul>',
      ['Molten polymer, wax and asphalt transfer', 'Viscous products that set if they cool'],
    ),
  },
  'IH-MH-THORBURN-THORLOOP-ULOOP': {
    short: 'Thorburn Thor-Loop U-Loop flexible pipe loop — absorbs up to 500 mm (20 in) of thermal and seismic movement in all directions; UL-listed and CGA-certified for sprinkler and gas systems.',
    long: guard(
      'The <strong>Thorburn Thor-Loop UL</strong> is a U-shaped flexible pipe loop of two metal hoses and a 180° return, installed in a pipe run to absorb thermal expansion and seismic movement.',
      '<ul><li>Absorbs up to 500 mm (20 in) of movement in all directions.</li><li>UL-listed and CGA-certified for fire sprinkler and gas-fired equipment systems.</li><li>Carbon steel, 304, 316 or brass; NPT, weld, 150/300# flange or grooved ends.</li><li>Any orientation other than hanging down needs the 180° return supported.</li></ul>',
      ['Sprinkler mains across building expansion joints', 'Gas lines to equipment on isolators', 'Seismic movement joints'],
    ),
  },
  'IH-MH-THORBURN-THORLOOP-VLOOP': {
    short: 'Thorburn Thor-Loop V-Loop flexible pipe loop — absorbs up to 500 mm (20 in) of thermal and seismic movement; UL-listed and CGA-certified.',
    long: guard(
      'The <strong>Thorburn Thor-Loop VL</strong> is the V-shaped version of the Thor-Loop flexible pipe loop.',
      '<ul><li>Absorbs up to 500 mm (20 in) of thermal (axial) and seismic movement in all directions.</li><li>UL-listed and CGA-certified for fire sprinkler and gas-fired equipment systems.</li><li>Carbon steel, 304, 316 or brass, with NPT, weld, flanged or grooved ends.</li></ul>',
      ['Building expansion and seismic joints', 'Pipe runs with large thermal movement'],
    ),
  },
  'IH-MH-THORBURN-THERMACOVER-STD': {
    short: 'Thorburn ThermaCover removable insulation cover — silicone- or PTFE-impregnated fibreglass jacket (to 260 °C) over an aerogel or mineral-wool core, made to fit the hose or fitting.',
    long: guard(
      'The <strong>Thorburn ThermaCover</strong> is a removable, sewn insulation cover for hoses, valves and fittings that have to come off for maintenance.',
      '<ul><li>Cover fabrics: silicone-impregnated fibreglass (−55 to 260 °C) or PTFE-impregnated fibreglass (−73 to 260 °C).</li><li>Insulation cores: silica aerogel blanket or mineral wool, both rated to 650 °C operating temperature at the hot face.</li><li>Flap closures and a sewn bolster bag; freeze-protection designs to −60 °C.</li></ul>',
      ['Personnel protection on hot hoses and valves', 'Heat retention on jacketed and traced lines', 'Freeze protection'],
    ),
  },
  'IH-MH-THORBURN-CRYO-LIN': { short: 'Thorburn cryogenic liquid nitrogen transfer hose — braided corrugated stainless, Cryo-Therm foam cover option, 400 psi (27.6 bar), CGA V-6 nitrogen connections.', long: CRYO('liquid nitrogen (LIN)', 'End connections compliant with CGA V-6, using CGA NI-150/250 ACME nitrogen connections.') },
  'IH-MH-THORBURN-CRYO-LOX': { short: 'Thorburn cryogenic liquid oxygen transfer hose — braided corrugated stainless, cleaned for oxygen service, 400 psi (27.6 bar), CGA V-6 oxygen connections.', long: CRYO('liquid oxygen (LOX)', 'Cleaned, degreased and capped for oxygen service; CGA V-6 OX-150/200/300 ACME oxygen connections.') },
  'IH-MH-THORBURN-CRYO-LNG-UNLOAD': { short: 'Thorburn cryogenic LNG unloading hose — braided corrugated stainless with optional armour and Cryo-Therm cover, 400 psi (27.6 bar), −269 to 538 °C.', long: CRYO('LNG unloading', 'End connections to the tanker and receiving coupling, confirmed per build; vacuum-jacketed TJHC hose is available for ship-to-shore duty.') },
  'IH-MH-THORBURN-CRYO-CO2-DEWAR': { short: 'Thorburn CO₂ transfer hose for dewar filling — helical or PTFE-lined to reduce snowballing, brass ACME CO₂ connections, 400 psi (27.6 bar).', long: CRYO('liquid CO₂ (dewar filling)', 'Helical-lined (CGH66/CGH96) or PTFE-lined (CGTR40) models are designed to reduce snowballing in CO₂ transfer; CO₂ ends are brass ACME connectors.') },
  'IH-MH-THORBURN-CRYO-CO2-PROCESS': { short: 'Thorburn CO₂ transfer hose for process plant — helical or PTFE-lined to reduce snowballing, braided stainless, 400 psi (27.6 bar) standard.', long: CRYO('liquid CO₂ (process plant)', 'Helical-lined or PTFE-lined models reduce snowballing in CO₂ service; flanged or ACME ends confirmed per build.') },
}

/** Marine hose corrections (maker series data). */
const MARINE: { sku: string; find: RegExp; replace: string }[] = [
  { sku: 'IH-MH-EXHT-250', find: /Temperature: 250°F \(121°C\)/g, replace: 'Temperature: 280°F (138°C) max' },
  { sku: 'IH-MH-EXHT-130', find: /The manufacturer publishes no working pressure for this hose in its part data\. Tell us the service and we will confirm the hose suits it\./g, replace: 'Working pressure 50 psi (0.34 MPa); the manufacturer lists it as SAE J20R3 heater hose.' },
  { sku: 'IH-MH-BLG-150', find: /Clear PVC Potable-Water Tubing, FDA/g, replace: 'Clear PVC Water, Drain & Vent Tubing, FDA' },
  { sku: 'IH-MH-BLG-150', find: /for marine and boat-plant service\./g, replace: 'for unpressurised, cool fresh-water, drain and vent lines. Not recommended for below-waterline through-hull connections.' },
  { sku: 'IH-MH-BLG-144', find: / ?4 times the Working Pressure/g, replace: '' },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let n = 0
  for (const [sku, r] of Object.entries(REWRITES)) {
    const p = await db.product.findUnique({ where: { sku }, select: { id: true, title: true } })
    if (!p) { console.log(`  ! ${sku} not found`); continue }
    const title = r.title ?? p.title
    const data = { title, descriptionShort: r.short, descriptionLong: r.long, seoTitle: title, seoDescription: r.short.slice(0, 300) }
    console.log(`  ${dryRun ? '[dry-run] ' : ''}${sku}`)
    if (!dryRun) await db.product.update({ where: { id: p.id }, data })
    n++
  }
  for (const m of MARINE) {
    const p = await db.product.findUnique({ where: { sku: m.sku }, select: { id: true, title: true, descriptionShort: true, descriptionLong: true, seoTitle: true } })
    if (!p) { console.log(`  ! ${m.sku} not found`); continue }
    const data: Record<string, string> = {}
    for (const f of ['title', 'descriptionShort', 'descriptionLong', 'seoTitle'] as const) {
      const v = p[f]
      if (v && m.find.test(v)) data[f] = v.replace(m.find, m.replace)
      m.find.lastIndex = 0
    }
    console.log(`  ${dryRun ? '[dry-run] ' : ''}${m.sku}: ${Object.keys(data).join(', ') || 'no match'}`)
    if (!dryRun && Object.keys(data).length) await db.product.update({ where: { id: p.id }, data })
  }
  console.log(`\n${n} rewrites; skipped for review: ${SKIPPED.join(', ')}`)
  await db.$disconnect()
}

if (require.main === module) {
  main().catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
}
