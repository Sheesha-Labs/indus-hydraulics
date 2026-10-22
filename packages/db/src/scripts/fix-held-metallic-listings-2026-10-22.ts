/**
 * Clean up the seven metallic hose listings that were held out of the blog on 2026-10-21 (see
 * src/scripts/fix-hose-listings-2026-10-21.ts). Ayush decided on 2026-10-22 to keep them live.
 *
 * Their copy came from the same generated template as the rest of the metallic shelf and could not be confirmed with
 * the makers, so this rewrite states only what is true of the product type and leaves every rating to be confirmed
 * per build: no working or burst pressures, temperatures, bend radii, weights or certification lists, no "vacuum
 * jacketed / boil-off per day" boilerplate, no API 6FA (a valve fire test), no ISO 10380 / PED Module H. Spec rows
 * that carried those unsourced figures are deleted; the descriptive rows (family, construction, materials) stay.
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-held-metallic-listings-2026-10-22.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DROP_SPECS = [
  'OEM Part Code', 'Nominal ID Range', 'Bend Radius (Static)', 'Bend Radius (Dynamic)', 'Live Length for Vibration', 'Weight',
  'Max Working Pressure', 'Min Burst Pressure', 'Safety Factor', 'Min Operating Temperature', 'Max Operating Temperature',
  'PED 2014/68/EU Module', 'ASME Compliance', 'NACE MR0175 / ISO 15156', 'CGA / UL / Chlorine Institute Certs', 'End Fitting Material',
]

const ORDER =
  '<h3>How to order</h3><p>Send the fluid, its pressure and temperature, the bore, overall length, both end connections and any standard or certificate the project needs. We confirm the build and its ratings with the maker before quoting, and supply the test certificate with the assembly.</p>'

const body = (intro: string, points: string[], apps: string[]) =>
  `<p>${intro}</p><h3>What to know</h3><ul>${points.map((p) => `<li>${p}</li>`).join('')}</ul><h3>Applications</h3><ul>${apps.map((a) => `<li>${a}</li>`).join('')}</ul>${ORDER}`

const CRYO_POINTS = [
  'Braided corrugated stainless steel hose for cryogenic liquid transfer.',
  'Insulation is either a foam cover over the braid or a vacuum jacket; vacuum-jacketed hose is a different, heavier build — say which the duty needs.',
  'End connections are matched to the gas so hoses cannot be cross-connected (CGA V-6 for nitrogen, oxygen and argon in North American practice).',
  'Working pressure, temperature range and bend radius depend on the bore and build and are confirmed per assembly.',
]

const REWRITES: Record<string, { short: string; long: string }> = {
  'IH-MH-HOSE-MASTER-CGA96-AR': {
    short: 'Hose Master braided stainless steel hose assembly for argon, nitrogen and CO₂ transfer. End connections, pressure rating and certification confirmed per build.',
    long: body(
      'A <strong>Hose Master corrugated stainless steel hose assembly for industrial gas service</strong> — argon, nitrogen or carbon dioxide — built to the bore, length and end connections the installation needs.',
      [
        'Corrugated stainless steel core with stainless wire braid.',
        'End connections are chosen for the gas and the equipment it connects to.',
        '“CGA96” in a hose description refers to a Canadian Gas Association fuel-gas certification, not an industrial-gas standard; confirm the certification the project needs.',
        'Pressure, temperature and bend radius confirmed per build.',
      ],
      ['Argon and mixed-gas supply to welding cells', 'Nitrogen blanketing and purge lines', 'CO₂ supply lines'],
    ),
  },
  'IH-MH-THORBURN-CGA96-O2': {
    short: 'Thorburn braided stainless steel hose for oxygen service, cleaned and capped for oxygen. Connections, pressure rating and certification confirmed per build.',
    long: body(
      'A <strong>Thorburn corrugated stainless steel hose for oxygen service</strong>. Thorburn supplies hose assemblies degreased, cleaned and capped for oxygen service, and uses CGA96 as a model family on its cryogenic transfer hose.',
      [
        'Corrugated stainless core and stainless braid, cleaned for oxygen service and capped.',
        'Oxygen end connections, so the hose cannot be connected to another gas system.',
        'Pressure, temperature and bend radius confirmed per build — oxygen service limits velocity and material choice, so give the full duty.',
      ],
      ['Oxygen supply to cutting and welding stations', 'Liquid and gaseous oxygen transfer', 'Plant oxygen distribution'],
    ),
  },
  'IH-MH-SENIOR-FLEX-BARTLETT-FIRESAFE': {
    short: 'Senior Flexonics all-metal corrugated stainless hose assembly for hydrocarbon lines where fire resistance matters. Ratings and fire-test evidence confirmed per build.',
    long: body(
      'A <strong>Senior Flexonics all-metal corrugated hose assembly</strong> for hydrocarbon and process lines where a rubber hose would fail in a fire. Senior Flexonics builds metal hose at its Bartlett, Illinois plant.',
      [
        'All-metal construction — stainless corrugated core and braid — is fire-resistant by construction.',
        'Fire-test standards differ: API 607, API 6FA and ISO 10497 are valve fire tests, so ask for the evidence that applies to a hose assembly.',
        'Pressure, temperature and end connections confirmed per build.',
      ],
      ['Hydrocarbon transfer near fire risk', 'Refinery and petrochemical flexible connections', 'Pump and equipment connections in fire zones'],
    ),
  },
  'IH-MH-THORBURN-THERMACOVER-CRYO': {
    short: 'Thorburn removable insulation cover for cryogenic hose — cuts heat gain, icing and product loss. Fabric and core chosen for the hose and temperature.',
    long: body(
      'A <strong>Thorburn removable insulation cover for cryogenic hose</strong>, made to fit the hose or fitting and taken off for inspection.',
      [
        'Thorburn’s cryogenic cover option for transfer hose is Cryo-Therm foam (−196 to 302 °C); its ThermaCover covers use silicone- or PTFE-impregnated fibreglass over an insulation core.',
        'Reduces heat gain, external icing and product lost per fill.',
        'Cover material and thickness confirmed for the hose size and service temperature.',
      ],
      ['Liquid nitrogen, oxygen and argon transfer hose', 'Personnel protection on cold lines', 'Reducing frost and ice build-up'],
    ),
  },
  'IH-MH-SENIOR-FLEX-CRYO-LNG': {
    short: 'Senior Flexonics stainless metal hose assembly for LNG transfer. Insulation, end connections, pressure rating and class approval confirmed per build.',
    long: body('A <strong>Senior Flexonics corrugated stainless hose assembly for LNG transfer</strong>, built to the bore, length, connections and approvals of the installation.', CRYO_POINTS.concat(['LNG bunkering hose is normally specified with a classification-society approval — state which one the vessel or terminal requires.']), ['LNG bunkering and tanker transfer', 'Terminal and plant LNG lines']),
  },
  'IH-MH-SENIOR-FLEX-TSJ-CHEMICAL': {
    short: 'Senior Flexonics steam-jacketed hose for chemical process lines — a hose within a hose that keeps the product hot. Ratings and flanges confirmed per build.',
    long: body(
      'A <strong>Senior Flexonics steam-jacketed hose</strong>: the product runs in an inner metal hose, steam or another heating medium in the outer, keeping viscous or temperature-sensitive chemicals fluid.',
      [
        'Inner and outer hoses act as separate pressure carriers, joined by port couplings for the jacket medium.',
        'Flange standard (EN or ASME) chosen to match the plant.',
        'Pressure and temperature of both the product and jacket confirmed per build.',
      ],
      ['Resin and specialty-chemical transfer', 'Viscous products that set if they cool', 'Heated loading lines'],
    ),
  },
  'IH-MH-WITZENMANN-CRYO-LAR': {
    short: 'Witzenmann stainless metal hose for liquid argon transfer. Insulation, connections and ratings confirmed per build.',
    long: body('A <strong>Witzenmann corrugated stainless hose assembly for liquid argon</strong>. Witzenmann’s standard corrugated hose has a 316L core and 304 braid and covers −270 to 550 °C across its range.', CRYO_POINTS, ['Liquid argon supply to welding and fabrication', 'Tanker and storage-tank transfer']),
  },
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  for (const [sku, r] of Object.entries(REWRITES)) {
    const p = await db.product.findUnique({ where: { sku }, select: { id: true } })
    if (!p) { console.log(`  ! ${sku} not found`); continue }
    const drop = await db.productSpec.count({ where: { productId: p.id, label: { in: DROP_SPECS } } })
    console.log(`  ${dryRun ? '[dry-run] ' : ''}${sku}: copy rewritten, ${drop} spec rows removed`)
    if (dryRun) continue
    await db.$transaction([
      db.product.update({ where: { id: p.id }, data: { descriptionShort: r.short, descriptionLong: r.long, seoDescription: r.short.slice(0, 300) } }),
      db.productSpec.deleteMany({ where: { productId: p.id, label: { in: DROP_SPECS } } }),
    ])
  }
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
