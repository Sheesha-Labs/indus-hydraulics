/**
 * Product FAQ programme, Waves 2–5 — the listing data errors the FAQ writers
 * flagged (2,312 findings, 218 rated high). This script fixes the ones that can
 * be settled from the listing's own data: a part number, a row's own text, the
 * dash size in a code, or the thread every other row of the same size carries.
 * Nothing here is taken from outside the listing, and a finding that needed a
 * maker datasheet to settle is left alone (see docs/product-faq-plan.md §12).
 *
 * What it does
 *  1. Threads. Two threads fused into one string on 13 Dixon listings
 *     (`1/4"-181, 4"-19` is `1/4"-18` + `1/4"-19`: the second fraction's slash
 *     became ", " and the pair was joined). Decoded against the set of real
 *     thread pitches. JIC 37° ends that carry an NPT or ORFS thread on two
 *     stainless listings, re-read from the JIC size. Typos (9/18-18, 1/5/8-12,
 *     "9/16 Inch-5 UNF"), the extra-light DIN 2353 10 mm tube thread, and dash
 *     sizes (-40, -48, -90) printed where an inch size belongs.
 *  2. Units. Vickers rows whose flow column holds L/min (26.5, 53, 76, 114, 227
 *     are exactly 7, 14, 20, 30, 60 gpm); Enerpac threaded-body cylinders whose
 *     capacity in pounds sat in the tons column (moved to `capacityLbs`); a
 *     3/4-ton row read as 4; pump rows of 5 psi on a 5,000 psi unit; a
 *     stainless block's WLL in tons that is pounds; a missing decimal point.
 *  3. Part numbers. Flange rows whose size code says 1/4" on a 1" or 10" part.
 *  4. Rows that are not the product: a storage bin and a 4" brewery adapter.
 *  5. Public text that leaked working notes or the buying chain ("not
 *     researched", "lane D", "seen in S3", "our supplier's figures", "This page
 *     used to rate it 250 bar").
 *  6. Labels: an electrical "Twist On Wire Connector" type on quick couplers,
 *     titles that name the wrong product, wrong HS codes (removed), a metal-hose
 *     standard on PTFE hoses, a 1,093 °C "continuous" rating that is a
 *     15-minute figure, a customer name in a SKU.
 *  7. Shelves: Bauer Type B fittings off the cam-and-groove shelf, closed-circuit
 *     piston pumps off the gear pump shelf.
 *  8. Slugs: "delivey" → "delivery" (3) and a 15M valve whose URL said 10M,
 *     each with a 301 row, and the FAQ links that pointed at the old URL.
 *
 * Every write is applied to the live row only when it changes it, so a re-run
 * is a no-op. The repo payloads that created these listings are patched with
 * the same string replacements, inside each product's own block, so a re-import
 * does not put the errors back; replacements that find nothing to patch are
 * listed (listings that were not created from a repo payload).
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-wave2-5-data.ts [--write]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const DATA = join(__dirname, '../../data')
const WRITE = process.argv.includes('--write')

type VariantSet = Partial<{ partNumber: string; hoseDash: number | null; hoseInch: string | null; portLabel: string | null; port2Label: string | null; port3Label: string | null; pressureBar: number | null }>
type Op =
  | { t: 'text'; slug: string; from: string; to: string }
  | { t: 'spec'; slug: string; label: string; value: string | null }
  | { t: 'variant'; slug: string; pn: string; set?: VariantSet; dims?: Record<string, unknown> }
  | { t: 'delVariant'; slug: string; pn: string }
  | { t: 'product'; slug: string; set: Partial<{ title: string; sku: string; hsCode: string | null; seoTitle: string }> }
  | { t: 'category'; slug: string; to: string }
  | { t: 'slug'; from: string; to: string }

const OPS: Op[] = []
const text = (slug: string, from: string, to: string) => OPS.push({ t: 'text', slug, from, to })
const row = (slug: string, pn: string, set?: VariantSet, dims?: Record<string, unknown>) => OPS.push({ t: 'variant', slug, pn, ...(set ? { set } : {}), ...(dims ? { dims } : {}) })

// ── 1. Threads ───────────────────────────────────────────────────────────────
// SAE thread for each JIC 37° / ORB nominal size, and ORFS for the typos.
const SAE: Record<string, string> = { '1/8': '5/16-24', '3/16': '3/8-24', '1/4': '7/16-20', '5/16': '1/2-20', '3/8': '9/16-18', '1/2': '3/4-16', '5/8': '7/8-14', '3/4': '1-1/16-12', '7/8': '1-3/16-12', '1': '1-5/16-12', '1-1/4': '1-5/8-12', '1-1/2': '1-7/8-12', '2': '2-1/2-12' }
/** `1/4"-181, 4"-19 NPTF x BSPP (male)` → `1/4"-18 x 1/4"-19 NPTF x BSPP (male)`. */
const PITCH = '(?:11\\.5|11|12|13|14|16|18|19|20|24|27|28)'
const FUSED = new RegExp(`^((?:\\d+ )?\\d+(?:\\/\\d+)?)"-(${PITCH})(\\d+(?:, \\d+|\\/\\d+)?)"-(\\d+(?:\\.5)?)(.*)$`)
export function unfuse(label: string): string | null {
  const m = FUSED.exec(label)
  if (!m) return null
  const [, a, p1, b, p2, rest] = m
  return `${a}"-${p1} x ${b!.replace(', ', '/')}"-${p2}${rest}`
}
const JIC_LABEL = /^(\d+(?:-\d+\/\d+|\/\d+)?)" JIC 37° \(([^)]+)\)$/
const ORB_TYPO: Record<string, string> = { '(9/18-18)': '(9/16-18)', '(1/5/8-12)': '(1-5/8-12)' }

for (const pn of ['IH-SS-5070LL-10-04']) row('stainless-steel-din-2353-x-npt-male-90-elbow-extra-light-series', pn, { portLabel: 'M14×1.0 (10 mm tube)' })
row('stainless-steel-din-2353-x-npt-male-connector-extra-light-series', 'IH-SS-5007LL-10-04', { portLabel: 'M14×1.0 (10 mm tube)' })
OPS.push({ t: 'spec', slug: 'stainless-steel-din-2353-x-npt-male-connector-extra-light-series', label: 'Port A Thread', value: 'DIN 2353 24° cone, M10×1.0 (6 mm tube) to M14×1.0 (10 mm tube)' })
text('stainless-steel-din-2353-x-npt-male-connector-extra-light-series', 'End 1: M10×1.0 (6 mm tube) to M10×1.0 (10 mm tube)', 'End 1: M10×1.0 (6 mm tube) to M14×1.0 (10 mm tube)')
for (const slug of ['stainless-steel-hose-barb-x-npt-male', 'stainless-steel-hose-barb-x-npt-male-90-elbow']) {
  const mid = slug.endsWith('elbow') ? 'MP90' : 'MP'
  row(slug, `IH-SS-HB-${mid}-40-40`, { portLabel: '2-1/2" hose barb', port2Label: '2-1/2" NPT (2-1/2-8)' })
  row(slug, `IH-SS-HB-${mid}-48-48`, { portLabel: '3" hose barb', port2Label: '3" NPT (3-8)' })
  OPS.push({ t: 'spec', slug, label: 'Port A Thread', value: '1/8" NPT (1/8-27) to 3" NPT (3-8)' })
  text(slug, 'to -48 hose barb', 'to 3" hose barb')
  text(slug, 'to -48 NPT', 'to 3" NPT (3-8)')
}
for (const [d, inch] of [['04', '1/4'], ['06', '3/8'], ['08', '1/2'], ['12', '3/4']] as const)
  row('stainless-steel-thy-series-crimp-hose-fitting-x-tube-stub', `IH-SS-THY-TS90-${d}-${d}`, { portLabel: `${inch}" hose ID (-${Number(d)})`, hoseDash: Number(d), hoseInch: `${inch}"` })
OPS.push({ t: 'spec', slug: 'stainless-steel-thy-series-crimp-hose-fitting-x-tube-stub', label: 'Nominal Size Range', value: '1/4" hose ID (-4) to 1" hose ID (-16)' })
text('stainless-steel-thy-series-crimp-hose-fitting-x-tube-stub', 'to -90 hose ID (-90)', 'to 1&quot; hose ID (-16)')
text('stainless-steel-thy-series-crimp-hose-fitting-x-tube-stub', 'to -90 hose ID (-90)', 'to 1" hose ID (-16)')

// ── 2. Units ─────────────────────────────────────────────────────────────────
row('enerpac-flange-spreaders-and-spread-cylinders', 'WR15', undefined, { capacityTon: 0.75 })
OPS.push({ t: 'spec', slug: 'enerpac-flange-spreaders-and-spread-cylinders', label: 'Capacity', value: '0.75–7.6 ton' })
for (const pn of ['ZW2108DI', 'ZW2408EI']) row('enerpac-electric-hydraulic-pump-units', pn, undefined, { maxPsi: 5000 })
row('6x19-iws-galvanized-steel-wire-rope', 'IH-LR-WR-6X19IWSGW-7MM', undefined, { 'weightPer100m@iwrc': 19.36 })
OPS.push({ t: 'spec', slug: 'stainless-steel-closed-type-block', label: 'Working load limit', value: '1,400 to 3,000 lbs' })
text('stainless-steel-closed-type-block', '1,400 to 3,000 t', '1,400 to 3,000 lbs')
OPS.push({ t: 'spec', slug: 'stainless-steel-snap-hook', label: 'Size range', value: '4 × 40 mm to 14 × 180 mm' })
text('stainless-steel-snap-hook', '140 × 180 mm', '14 × 180 mm')
OPS.push({ t: 'spec', slug: 'foam-filled-surface-mooring-buoy', label: 'Size range', value: '730 kg buoyancy to 11,310 kg buoyancy' })
text('foam-filled-surface-mooring-buoy', '4,850 kg buoyancy to 4,400 kg buoyancy', '730 kg buoyancy to 11,310 kg buoyancy')
row('bijur-delimon-da-manual-lubricators', '*', undefined, { output: '7.4 cc per stroke' })
row('goodyear-engineered-products-multipurpose-air-hoses', '1ZLJ9', { hoseDash: 32, hoseInch: '2"' })
for (const pn of ['38X12B03', '38X25B03', '38X50B03']) row('guardair-coilgaurd-nylon-air-hoses', pn, { hoseDash: 6, hoseInch: '3/8"' })
for (const pn of ['14X12B04', '14X25B04']) row('guardair-coilguard-polyurethane-air-hoses', pn, { hoseDash: 4, hoseInch: '1/4"' })
for (const d of [6, 8, 10, 12, 16, 20, 24, 32]) {
  const inch: Record<number, string> = { 6: '3/8"', 8: '1/2"', 10: '5/8"', 12: '3/4"', 16: '1"', 20: '1 1/4"', 24: '1 1/2"', 32: '2"' }
  row('parker-472lt-series-hoses', `472LT-${d}-BX`, { hoseDash: d, hoseInch: inch[d]! })
  row('parker-787tc-series-tough-cover-hydraulic-hoses-5000-psi', `787TC-${d}`, { hoseDash: d, hoseInch: inch[d]! })
}
for (const pn of ['B23AS37M', 'B23AS37F', 'B23AS37H']) OPS.push({ t: 'variant', slug: 'hansen-auto-flo-23-universal-series-industrial-aro210-truflate-interchange-coupler-body', pn, dims: { '@item': ['1/4 Brass', '3/8 Brass'] } })
row('dixon-npt-threaded-one-end-pipe-fittings', 'PN2500', { portLabel: '2 1/2"' }, { '@item': ['Size 3"', 'Size 2 1/2"'] })
row('aeroquip-190772-series-universals', '190772-12S', { portLabel: '1 1/16" Jic (female)' })
for (const pn of ['2880609C', '2880509C', '2880609CBC']) OPS.push({ t: 'variant', slug: 'dixon-push-on-hose-barb-brass-fittings-female-jic-swivel-x-push-on-hose-barb', pn, dims: { '@item': ['9/16 Inch-5 UNF', '9/16-18 UNF'] } })
OPS.push({ t: 'variant', slug: 'dixon-push-on-hose-barb-brass-fittings-female-jic-swivel-x-push-on-hose-barb', pn: '2880809C', dims: { '@item': ['9/16-5 UNF', '9/16-18 UNF'] } })
row('parker-e-z-mate-series-couplers-push-lok-hose-barb', 'EZ-501-8PL', undefined, { ratedPsi: 300 })
for (const slug of ['parker-e-z-mate-series-couplers-push-lok-hose-barb', 'parker-e-z-mate-series-couplers-hose-barb'])
  OPS.push({ t: 'variant', slug, pn: '*', dims: { '@item': ['Twist On Wire Connector', 'Quick Coupling'] } })
row('parker-79-series-16f79-crimp-style-hose-fittings-45-deg-elbow', '16F79-16-16', undefined, { item: 'Flange Head, 45 Deg. Elbow, 1 Inch' })
for (const slug of ['thorburn-fj72-fry-sil-fire-jacket', 'thorburn-fj73-fry-sil-fire-tape']) OPS.push({ t: 'spec', slug, label: 'Max Operating Temperature', value: '260' })

// ── 3. Part numbers (size code is sixteenths of an inch) ─────────────────────
row('304-stainless-steel-weld-neck-raised-face-flange', 'IH-PF-WNRF8-B4-04', { partNumber: 'IH-PF-WNRF8-B4-16' })
row('304-stainless-steel-weld-neck-raised-face-flange', 'IH-PF-WNRF4-D4-04', { partNumber: 'IH-PF-WNRF4-D4-16' })
row('304-stainless-steel-weld-neck-raised-face-flange', 'IH-PF-WNRF4-D4-040', { partNumber: 'IH-PF-WNRF4-D4-160' })
row('304-stainless-steel-socket-weld-raised-face-flange', 'IH-PF-SWRF4-D4-04', { partNumber: 'IH-PF-SWRF4-D4-16' })
row('304-stainless-steel-socket-weld-raised-face-flange', 'IH-PF-SWRF8-D4-04', { partNumber: 'IH-PF-SWRF8-D4-16' })
row('304-stainless-steel-lap-joint-flange', 'IH-PF-LJ-D4-040', { partNumber: 'IH-PF-LJ-D4-160' })

// ── 4. Rows that are not the product ─────────────────────────────────────────
OPS.push({ t: 'delVariant', slug: 'weatherhead-brass-hydraulic-hose-adapters', pn: '3200X8X6' })
OPS.push({ t: 'delVariant', slug: 'dixon-hose-barb', pn: '14MPHRL400' })

// ── 5. Working notes and buying-chain wording in public text ─────────────────
const TESTING_NOTE: Array<[string, string, string]> = [
  ['inner-grooved-copper-tubes', '<li>Not captured</li>', ''],
  ['low-fin-copper-alloy-tubes', '<li>Not captured from B359 (full text unreachable)</li>', '<li>Tests to ASTM B359</li>'],
  ['casing-and-tubing-api-5ct', 'Drift test with API drift mandrel (drift diameters seen in S3 but not tabulated here)', 'Drift test with API drift mandrel'],
  ['casing-and-tubing-api-5ct', 'Hydrostatic test per API 5CT (pressures not captured)', 'Hydrostatic test per API 5CT'],
  ['aluminium-brass-condenser-tubes', '<li>See lane D (B111 residual-stress, eddy current, expansion, flattening)</li>', ''],
  ['aluminium-brass-condenser-tubes', 'Seawater and brackish-water condensers and coolers (see lane D)', 'Seawater and brackish-water condensers and coolers'],
  ['carbon-steel-u-bend-tubes', 'Straight-tube tests per base specification; U-bend-specific tests (bend-region thinning, ovality, stress relief, hydro after bending) not researched in this lane', 'Straight-tube tests per base specification; U-bend tests (bend-region thinning, ovality, stress relief, hydrotest after bending) agreed on the order'],
  ['alloy-steel-u-bend-tubes', 'post-bend heat treatment of Cr-Mo bends not researched', 'post-bend heat treatment of Cr-Mo bends agreed on the order'],
  ['integral-low-fin-tubes', 'Cu-Ni low-fin tubes for seawater-cooled condensers (lane D overlap)', 'Cu-Ni low-fin tubes for seawater-cooled condensers'],
]
for (const [slug, from, to] of TESTING_NOTE) text(slug, from, to)
OPS.push({ t: 'spec', slug: 'inner-grooved-copper-tubes', label: 'Testing', value: null })
OPS.push({ t: 'spec', slug: 'low-fin-copper-alloy-tubes', label: 'Testing', value: 'Tests to ASTM B359' })
OPS.push({ t: 'spec', slug: 'casing-and-tubing-api-5ct', label: 'Testing', value: 'Drift test with API drift mandrel; Hydrostatic test per API 5CT' })
OPS.push({ t: 'spec', slug: 'aluminium-brass-condenser-tubes', label: 'Testing', value: 'Eddy current, expansion 20%, flattening; Mercurous nitrate or ammonia vapour residual-stress test (mandatory)' })
for (const slug of ['iso-tie-rod-cylinder-100x70x500', 'iso-tie-rod-cylinder-63x45x200'])
  text(slug, '<p>This page used to rate it 250 bar. Rexroth rates the CDT3', '<p>Rexroth rates the CDT3')
for (const slug of ['figure-1003-misaligning-hammer-union-sour-gas-service', 'figure-1003-misaligning-hammer-union-standard-service']) {
  text(slug, "The ratings below are our supplier's published figures;", 'The ratings on this page are the figures published for this range;')
  text(slug, 'The ratings below are our supplier&#39;s published figures;', 'The ratings on this page are the figures published for this range;')
  text(slug, 'Our supplier rates the 2 in and 3 in at', 'This range is rated at')
}
text('stucchi-a-premier-series-iso-16028-flat-face-couplings', 'which the supplier rates higher', 'which Stucchi rates higher')
text('stucchi-firg-series-iso-16028-flat-face-couplings', ' — described by the supplier as the original ISO 16028 interchange coupling — ', ', the original ISO 16028 interchange profile, ')
for (const slug of ['45-bsp-female-multiseal-hose-fitting', '90-bsp-female-multiseal-hose-fitting', 'bsp-female-multiseal-hose-fitting', '45-metric-female-multiseal-hose-fitting', '90-metric-female-multiseal-hose-fitting', 'metric-female-multiseal-hose-fitting']) {
  text(slug, 'The supplier calls this series &quot;multiseal&quot; and does not define the term. Measured against its own catalogue it is unambiguous:', '&quot;Multiseal&quot; is the series name. Against the catalogue dimensions the seat form is clear:')
  text(slug, 'twin in the same book', 'twin in the same catalogue')
}
for (const slug of ['demco-dm-7500-gate-valve-gate-3-inch', 'demco-dm-7500-gate-valve-gate-4-inch', 'demco-dm-gate-valve-gate-2-inch', 'demco-dm-7500-gate-valve-gate-5-inch'])
  text(slug, "the series is from its stamp or the supplier's listing", 'the series is from its stamp or its catalogue listing')

// ── 6. Labels ────────────────────────────────────────────────────────────────
OPS.push({ t: 'product', slug: 'parker-hydraulic-quick-couplers', set: { title: 'Parker PC Series Mold Coolant Quick Couplers' } })
OPS.push({ t: 'product', slug: 'parker-88-series-2188-barbed-nipples-90-deg-elbow', set: { title: 'Parker 88 Series 2188 Barbed Nipples, Male NPTF, Rigid' } })
OPS.push({ t: 'product', slug: 'molykote-1122-chain-and-open-air-grease', set: { title: 'Molykote 1122 Chain and Open Gear Grease' } })
OPS.push({ t: 'product', slug: 'blast-sub-pup-joint-1502-series-m-f-integral-15-000-psi-standard-service', set: { sku: 'IH-FI-BJ-1502-MF-INT-15K-STD' } })
OPS.push({ t: 'product', slug: 'vestil-power-units', set: { hsCode: null } })
OPS.push({ t: 'product', slug: 'guardair-chicago-couplers', set: { hsCode: null } })
OPS.push({ t: 'spec', slug: 'stainless-steel-bonded-seal-metric', label: 'Applicable Standards', value: null })
OPS.push({ t: 'spec', slug: 'banjo-metric', label: 'Nominal Size Range', value: 'M10×1 to M22×1.5' })
OPS.push({ t: 'spec', slug: 'banjo-metric', label: 'Applicable Standards', value: 'DIN 7642' })
OPS.push({ t: 'spec', slug: 'female-thread-cross', label: 'Port A Thread', value: 'BSPT Rc1/8 to Rc1-1/4 (taper)' })
OPS.push({ t: 'spec', slug: 'female-thread-cross', label: 'Port A Sealing', value: 'taper thread with sealant' })
OPS.push({ t: 'spec', slug: 'female-thread-cross', label: 'Nominal Size Range', value: 'Rc1/8 to Rc1-1/4' })
OPS.push({ t: 'spec', slug: 'female-thread-cross', label: 'Applicable Standards', value: 'ISO 7-1 (BSPT)' })
for (const slug of ['convoluted-ptfe-hose-with-polypropylene-braid', 'convoluted-ptfe-hose-with-stainless-steel-braid']) {
  text(slug, ' <li>ISO 10380:2012 N/A (Corrugated Metal Hoses and Hose Assemblies)</li>', '')
  text(slug, ' <li>Pressure Equipment Directive 2014/68/EU Module A</li>', '')
  text(slug, 'with safety factor 4:1 per ISO 10380.', 'with safety factor 4:1.')
  OPS.push({ t: 'spec', slug, label: 'PED 2014/68/EU Module', value: null })
}

// ── 7. Shelves ───────────────────────────────────────────────────────────────
for (const s of ['female-x-male-increasers', 'female-x-male-reducers', 'male-x-asa-flanges', 'shank-fittings-female-weld-on-with-gasket', 'shank-fittings-male-weld-on', 'shank-fittings-male-with-machined-hose-shank', 'shank-fittings-male-with-male-npt', 'shank-fittings-male-x-female-45-degree-elbow', 'shank-fittings-male-x-hose-shank', 'shank-fittings-female-with-male-npt'])
  OPS.push({ t: 'category', slug: `dixon-type-b-${s}`, to: 'bauer-type-couplings' })
OPS.push({ t: 'category', slug: 'eaton-2-series-heavy-duty-closed-circuit-pump-servo-controls', to: 'hydraulic-piston-pumps' })

// ── 8. Slugs ─────────────────────────────────────────────────────────────────
for (const s of ['bulk-material', 'san-hygienic-brew', 'san-hygienic-food']) OPS.push({ t: 'slug', from: `${s}-suction-delivey-hose-10-bar`, to: `${s}-suction-delivery-hose-10-bar` })
OPS.push({ t: 'slug', from: 'manual-slab-gate-valve-3-1-16-in-10m-flanged-15-000-psi-api-6a-psl-3g-pr2-hh-inconel-625-cladded', to: 'manual-slab-gate-valve-3-1-16-in-15m-flanged-15-000-psi-api-6a-psl-3g-pr2-hh-inconel-625-cladded' })

// ── Rule-driven row fixes, computed from the live rows ───────────────────────
const VICKERS_FLOW_SLUGS = ['parker-pressure-relief-valves', 'vickers-in-line-valves', 'vickers-cvi-series-cartridge-valve-inserts', 'vickers-flange-valves', 'vickers-systemstak-flow-control-valves', 'vickers-systemstak-counterbalance-valves', 'vickers-systemstak-sequence-valves', 'vickers-systemstak-dual-flow-control-valves', 'vickers-systemstak-single-flow-control-valves', 'vickers-pressure-control-unloading-valves']
const ENERPAC_LBS = ['enerpac-cdt-series-hydraulic-cylinders', 'enerpac-cst-series-hydraulic-cylinders']
const THREAD_SLUGS = ['stainless-steel-npt-female-x-jic-37-male-bulkhead-connector', 'stainless-steel-jic-37-male-x-orb-male-adjustable-90-elbow', 'stainless-steel-jic-37-male-x-orb-male-connector', 'stainless-steel-orfs-male-union-tee', 'stainless-steel-orfs-swivel-nut-branch-tee']

type Row = { id: string; partNumber: string; hoseDash: number | null; hoseInch: string | null; portLabel: string | null; port2Label: string | null; port3Label: string | null; pressureBar: number | null; dimensions: Prisma.JsonValue }

async function ruleOps(): Promise<void> {
  // Fused Dixon threads, anywhere in the catalogue.
  const fused = await db.productVariant.findMany({
    where: { product: { status: 'active' }, OR: [{ portLabel: { contains: '"-' } }, { port2Label: { contains: '"-' } }] },
    select: { partNumber: true, portLabel: true, port2Label: true, product: { select: { slug: true } } },
  })
  for (const v of fused) {
    const set: VariantSet = {}
    for (const k of ['portLabel', 'port2Label'] as const) { const u = v[k] ? unfuse(v[k]!) : null; if (u) set[k] = u }
    if (Object.keys(set).length) row(v.product.slug, v.partNumber, set)
  }
  // JIC 37° ends with the wrong thread, and the two thread typos.
  const th = await db.productVariant.findMany({ where: { product: { slug: { in: THREAD_SLUGS } } }, select: { partNumber: true, portLabel: true, port2Label: true, port3Label: true, product: { select: { slug: true } } } })
  for (const v of th) {
    const set: VariantSet = {}
    for (const k of ['portLabel', 'port2Label', 'port3Label'] as const) {
      let l = v[k]; if (!l) continue
      for (const [a, b] of Object.entries(ORB_TYPO)) l = l.replace(a, b)
      const m = JIC_LABEL.exec(l)
      if (m && SAE[m[1]!] && SAE[m[1]!] !== m[2]) l = `${m[1]}" JIC 37° (${SAE[m[1]!]})`
      if (l !== v[k]) set[k] = l
    }
    if (Object.keys(set).length) row(v.product.slug, v.partNumber, set)
  }
  // Vickers flow in L/min: only rows whose figure is a round gpm (to 0.5 %) × 3.785,
  // a multiple of 5 gpm outside the CVI listing.
  const vk = await db.productVariant.findMany({ where: { product: { slug: { in: VICKERS_FLOW_SLUGS } } }, select: { partNumber: true, dimensions: true, product: { select: { slug: true } } } })
  for (const v of vk) {
    const d = (v.dimensions ?? {}) as Record<string, unknown>
    const f = Number(d.flowGpm); if (!f || !String(d.item ?? '').startsWith('VICKERS')) continue
    const g = f / 3.785
    if (v.product.slug === 'vickers-cvi-series-cartridge-valve-inserts') {
      // CVI inserts are sized in L/min, which converts to odd gpm, so the six
      // published L/min figures are mapped explicitly (idempotent: no gpm result
      // is itself in the map).
      const CVI: Record<number, number> = { 255: 67, 590: 156, 1250: 330, 1700: 449, 2350: 621, 3650: 964 }
      if (CVI[f]) row(v.product.slug, v.partNumber, undefined, { flowGpm: CVI[f] })
      continue
    }
    const roundGpm = Math.round(g) % 5 === 0 || Math.round(g) < 10
    if (Math.abs(g - Math.round(g)) / g < 0.005 && f > 10 && roundGpm) row(v.product.slug, v.partNumber, undefined, { flowGpm: Math.round(g) })
  }
  // Enerpac threaded cylinders: pounds held in the tons column.
  const en = await db.productVariant.findMany({ where: { product: { slug: { in: ENERPAC_LBS } } }, select: { partNumber: true, dimensions: true, product: { select: { slug: true } } } })
  for (const v of en) {
    const d = (v.dimensions ?? {}) as Record<string, unknown>
    if (typeof d.capacityTon === 'number' && /\d+ Lbs?\b/.test(String(d.item))) row(v.product.slug, v.partNumber, undefined, { capacityTon: undefined, capacityLbs: d.capacityTon })
  }
  // Stainless closed block: WLL is pounds.
  const bl = await db.productVariant.findMany({ where: { product: { slug: 'stainless-steel-closed-type-block' } }, select: { partNumber: true, dimensions: true } })
  for (const v of bl) { const d = (v.dimensions ?? {}) as Record<string, unknown>; if (typeof d.wllT === 'number') row('stainless-steel-closed-type-block', v.partNumber, undefined, { wllT: undefined, wllLbs: d.wllT }) }
  // Parker HD: displacement is in³/rev (the title gives 0.603 cu. in. = 9.88 cc).
  const hd = await db.productVariant.findMany({ where: { product: { slug: 'parker-hd-series-fixed-displacement-gear-pumps' } }, select: { partNumber: true, dimensions: true } })
  for (const v of hd) { const d = (v.dimensions ?? {}) as Record<string, unknown>; if (typeof d.displacementCc === 'number' && d.displacementCc < 3) row('parker-hd-series-fixed-displacement-gear-pumps', v.partNumber, undefined, { displacementCc: undefined, displacementCuIn: d.displacementCc }) }
}

// ── Engine ───────────────────────────────────────────────────────────────────
const PRODUCT_TEXT = ['title', 'descriptionShort', 'descriptionLong', 'seoTitle', 'seoDescription'] as const
/** Every (old → new) string the payloads should receive, per product slug. */
const payloadEdits = new Map<string, Array<[string, string]>>()
const addEdit = (slug: string, a: string, b: string) => { if (a !== b) (payloadEdits.get(slug) ?? payloadEdits.set(slug, []).get(slug)!).push([a, b]) }
const report: string[] = []

function applyDims(dims: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out = { ...dims }
  for (const [k, v] of Object.entries(patch)) {
    if (k === '@item') { const [a, b] = v as [string, string]; if (typeof out.item === 'string') out.item = out.item.split(a).join(b); continue }
    if (v === undefined) delete out[k]; else out[k] = v
  }
  return out
}

async function run(tx: Prisma.TransactionClient) {
  const slugs = [...new Set(OPS.map((o) => ('slug' in o ? o.slug : o.from)))]
  const products = await tx.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, sku: true, title: true, hsCode: true, descriptionShort: true, descriptionLong: true, seoTitle: true, seoDescription: true, specs: { select: { id: true, group: true, label: true, value: true, position: true } }, variants: true },
  })
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  const missing = slugs.filter((s) => !bySlug.has(s))
  if (missing.length) report.push(`not found: ${missing.join(' ')}`)
  let writes = 0

  for (const p of products) {
    const ops = OPS.filter((o) => ('slug' in o ? o.slug : o.from) === p.slug)
    // Product text and specs.
    const prod: Record<string, string | null> = {}
    for (const o of ops) {
      if (o.t === 'text') {
        let hit = false
        for (const f of PRODUCT_TEXT) { const cur = (prod[f] ?? p[f]) as string | null; if (cur?.includes(o.from)) { prod[f] = cur.split(o.from).join(o.to); hit = true } }
        for (const s of p.specs) if (s.value.includes(o.from)) { s.value = s.value.split(o.from).join(o.to); (s as { dirty?: boolean }).dirty = true; hit = true }
        if (hit) addEdit(p.slug, o.from, o.to)
      }
      if (o.t === 'product') for (const [k, v] of Object.entries(o.set)) if ((p as Record<string, unknown>)[k] !== v) { prod[k] = v ?? null; if (typeof (p as Record<string, unknown>)[k] === 'string' && v) addEdit(p.slug, (p as unknown as Record<string, string>)[k]!, v) }
    }
    const prodChanged = Object.keys(prod).filter((k) => prod[k] !== (p as Record<string, unknown>)[k])
    if (prodChanged.length) { writes++; report.push(`${p.slug}: ${prodChanged.join(', ')}`); if (WRITE) await tx.product.update({ where: { id: p.id }, data: Object.fromEntries(prodChanged.map((k) => [k, prod[k]])) }) }
    for (const s of p.specs as Array<typeof p.specs[number] & { dirty?: boolean }>) if (s.dirty) { writes++; if (WRITE) await tx.productSpec.update({ where: { id: s.id }, data: { value: s.value } }) }
    for (const o of ops) if (o.t === 'spec') {
      const s = p.specs.find((x) => x.label === o.label)
      if (o.value === null) { if (s) { writes++; report.push(`${p.slug}: spec ${o.label} removed`); if (WRITE) await tx.productSpec.delete({ where: { id: s.id } }) } continue }
      if (s && s.value === o.value) continue
      writes++; report.push(`${p.slug}: spec ${o.label} = ${o.value}`)
      if (s) addEdit(p.slug, s.value, o.value)
      if (WRITE) s ? await tx.productSpec.update({ where: { id: s.id }, data: { value: o.value } }) : await tx.productSpec.create({ data: { productId: p.id, group: p.specs[0]?.group ?? 'Specification', label: o.label, value: o.value, position: p.specs.length } })
    }
    // Rows.
    for (const o of ops) {
      if (o.t === 'delVariant') { const v = p.variants.find((x) => x.partNumber === o.pn); if (v) { writes++; report.push(`${p.slug}: row ${o.pn} removed`); if (WRITE) await tx.productVariant.delete({ where: { id: v.id } }) } continue }
      if (o.t !== 'variant') continue
      for (const v of p.variants.filter((x) => o.pn === '*' || x.partNumber === o.pn) as Row[]) {
        const data: Record<string, unknown> = {}
        for (const [k, val] of Object.entries(o.set ?? {})) if ((v as Record<string, unknown>)[k] !== val) { data[k] = val; const old = (v as Record<string, unknown>)[k]; if (typeof old === 'string' && typeof val === 'string') addEdit(p.slug, old, val) }
        if (o.dims) {
          const cur = (v.dimensions ?? {}) as Record<string, unknown>
          const next = applyDims(cur, o.dims)
          if (JSON.stringify(next) !== JSON.stringify(cur)) { data.dimensions = next; if (o.dims['@item']) { const [a, b] = o.dims['@item'] as [string, string]; addEdit(p.slug, a, b) } }
        }
        if (!Object.keys(data).length) continue
        Object.assign(v, data)
        writes++; report.push(`${p.slug}: row ${o.pn === '*' ? v.partNumber : o.pn} ${JSON.stringify(data).slice(0, 160)}`)
        if (WRITE) await tx.productVariant.update({ where: { id: v.id }, data: data as Prisma.ProductVariantUpdateInput })
      }
    }
    // Shelf.
    for (const o of ops) if (o.t === 'category') {
      const cat = await tx.category.findUniqueOrThrow({ where: { slug: o.to }, select: { id: true } })
      const cur = await tx.product.findUniqueOrThrow({ where: { id: p.id }, select: { categoryId: true } })
      if (cur.categoryId !== cat.id) { writes++; report.push(`${p.slug}: shelf → ${o.to}`); if (WRITE) await tx.product.update({ where: { id: p.id }, data: { categoryId: cat.id } }) }
    }
    // Slug.
    for (const o of ops) if (o.t === 'slug') {
      writes++; report.push(`slug ${o.from} → ${o.to}`)
      if (WRITE) {
        await tx.product.update({ where: { id: p.id }, data: { slug: o.to } })
        await tx.redirect.upsert({ where: { fromPath: `/p/${o.from}` }, update: { toPath: `/p/${o.to}`, isActive: true }, create: { fromPath: `/p/${o.from}`, toPath: `/p/${o.to}`, statusCode: 301, notes: 'FAQ programme data fix 2026-11-20: slug typo / wrong pressure class' } })
        await tx.$executeRaw`UPDATE product_faqs SET answer = replace(answer, ${`/p/${o.from}`}, ${`/p/${o.to}`}) WHERE answer LIKE ${`%/p/${o.from}%`}`
        await tx.$executeRaw`UPDATE products SET "descriptionLong" = replace("descriptionLong", ${`/p/${o.from}`}, ${`/p/${o.to}`}) WHERE "descriptionLong" LIKE ${`%/p/${o.from}%`}`
      }
    }
  }
  return writes
}

// ── Payloads ─────────────────────────────────────────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.json')) out.push(p) }
  return out
}
const esc = (s: string) => JSON.stringify(s).slice(1, -1)

function syncPayloads(): void {
  const files = walk(DATA).filter((f) => !f.includes('product-faqs'))
  const texts = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]))
  const unsynced: string[] = []
  for (const [slug, edits] of payloadEdits) {
    let synced = false
    for (const [f, t] of texts) {
      const at = t.search(new RegExp(`"slug":\\s*"${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
      if (at < 0) continue
      const next = t.slice(at + 10).search(/"slug":\s*"/)
      const end = next < 0 ? t.length : at + 10 + next
      let block = t.slice(at, end)
      for (const [a, b] of edits) block = block.split(esc(a)).join(esc(b))
      if (block !== t.slice(at, end)) { texts.set(f, t.slice(0, at) + block + t.slice(end)); synced = true }
    }
    if (!synced) unsynced.push(slug)
  }
  // Renamed slugs, wherever they appear (catalogue payloads and FAQ payloads).
  const renames = OPS.filter((o): o is Extract<Op, { t: 'slug' }> => o.t === 'slug')
  const all = walk(DATA)
  for (const f of all) {
    let t = texts.get(f) ?? readFileSync(f, 'utf8')
    for (const r of renames) t = t.split(r.from).join(r.to)
    if (t !== (texts.get(f) ?? readFileSync(f, 'utf8'))) texts.set(f, t)
  }
  let changed = 0
  for (const [f, t] of texts) if (t !== readFileSync(f, 'utf8')) { changed++; if (WRITE) writeFileSync(f, t); console.log(`payload: ${relative(DATA, f)}`) }
  console.log(`${changed} payload files ${WRITE ? 'patched' : 'would change'}; not from a repo payload: ${unsynced.length} (${unsynced.join(' ')})`)
}

async function main() {
  await ruleOps()
  const writes = await db.$transaction(run, { timeout: 900_000, maxWait: 30_000 })
  for (const l of report) console.log(l)
  console.log(`${writes} DB writes ${WRITE ? 'applied' : '(dry run)'}`)
  syncPayloads()
  await db.$disconnect()
}

main().catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1) })
