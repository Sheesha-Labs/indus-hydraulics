/**
 * Product FAQ programme, Wave 1 (Pneumatics) — data pass.
 *
 * Writing 12 FAQs per product made the writers read every row of the
 * pneumatics shelves; this script fixes what they found (findings files stay
 * outside the repo). Rules are written once against a plain product object and
 * run twice: on the live database row and on the catalogue payload that
 * created it, so a re-import does not bring the errors back.
 *
 * Generic rules (all Wave 1 shelves):
 *   1. A pressure column holding the bottom of the range the row text states
 *      ("30 - 100 Psi" stored as 30) takes the top of the range.
 *   2. Parker tie-rod / round-body model codes (1.50BB4MA…, 1.06DSR…): the
 *      leading figure is the bore — a rod diameter in the bore column moves to
 *      rodIn; a missing stroke is read from the trailing figure.
 *   3. Truncated mount names are restored from the row text.
 *   4. Odd fractions from decimals ("2 9/25\"") go back to decimals.
 *   5. HS codes: 8482 (bearings) on valves, 9032 and 8421.29 on air filters.
 *   6. The "Pressure stated by the maker" line is rebuilt from the rows.
 * Then targeted fixes per listing (titles, specs copied from one model onto a
 * whole range, row text, rows filed on the wrong listing).
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-wave1-pneumatics-data.ts [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const DATA = join(__dirname, '../../data')
const PAYLOADS = [
  'catalogue-maker-pneumatic-cylinders',
  'catalogue-maker-pneumatic-valves',
  'catalogue-maker-air-preparation',
  'catalogue-maker-pneumatic-grippers-vacuum',
  'catalogue-maker-pneumatic-tubing-fittings',
].map((d) => join(DATA, d, 'catalogue.json'))

const SHELVES = [
  'pneumatic-cylinders',
  'air-preparation-frl',
  'pneumatic-solenoid-valves',
  'pneumatic-grippers-actuators',
  'pneumatic-flow-check-valves',
  'pneumatic-safety-lockout-valves',
  'pneumatic-control-valves',
  'vacuum-components',
  'air-motors',
  'pneumatic-fittings-silencers',
]

type Dims = Record<string, unknown>
type Spec = { label: string; value: string; [k: string]: unknown }
type Variant = { partNumber: string; position: number; dimensions: Dims | null; [k: string]: unknown }
type P = {
  slug: string
  title: string
  seoTitle: string | null
  focusKeyword: string | null
  descriptionShort: string | null
  descriptionLong: string | null
  seoDescription: string | null
  hsCode: string | null
  category: string
  weightKg?: string | number | null
  specs: Spec[]
  variants: Variant[]
  [k: string]: unknown
}

const log: string[] = []
const note = (slug: string, msg: string) => log.push(`${slug}: ${msg}`)

// ── helpers ────────────────────────────────────────────────────────────────
const num = (x: unknown): number | null => (typeof x === 'number' ? x : typeof x === 'string' && /^\d+(\.\d+)?$/.test(x) ? Number(x) : null)
const item = (v: Variant) => String(v.dimensions?.item ?? '')
const rows = (p: P, re: RegExp) => p.variants.filter((v) => re.test(v.partNumber))
function setDim(p: P, v: Variant, key: string, value: unknown) {
  v.dimensions ??= {}
  if (JSON.stringify(v.dimensions[key]) === JSON.stringify(value)) return
  if (value === null || value === undefined) delete v.dimensions[key]
  else v.dimensions[key] = value
}
function setItem(p: P, re: RegExp, from: RegExp | string, to: string) {
  for (const v of rows(p, re)) setDim(p, v, 'item', item(v).replace(from, to))
}
function dropSpec(p: P, label: string | RegExp, valueRe?: RegExp) {
  p.specs = p.specs.filter(
    (s) => !((typeof label === 'string' ? s.label === label : label.test(s.label)) && (!valueRe || valueRe.test(s.value))),
  )
}
function setSpec(p: P, label: string, value: string) {
  const s = p.specs.find((x) => x.label === label)
  if (s) s.value = value
}
function retitle(p: P, title: string) {
  if (p.title === title) return
  const old = p.title
  const swap = (s: string | null) => (s ? s.split(old).join(title) : s)
  p.descriptionShort = swap(p.descriptionShort)
  p.descriptionLong = swap(p.descriptionLong)
  p.seoDescription = swap(p.seoDescription)
  p.seoTitle = p.seoTitle === old ? title : swap(p.seoTitle)
  if (p.focusKeyword === old.toLowerCase()) p.focusKeyword = title.toLowerCase()
  p.title = title
}

// ── generic rules ──────────────────────────────────────────────────────────
const PSI_RANGE = /(\d{1,3}(?:\.\d+)?)\s*(?:-|–|to)\s*(\d{2,3}(?:\.\d+)?)\s*psi/i
function ruleRangeTop(p: P) {
  for (const v of p.variants) {
    const m = PSI_RANGE.exec(item(v))
    if (!m) continue
    const lo = Number(m[1])
    const hi = Number(m[2])
    if (!(hi > lo)) continue
    for (const k of ['maxPsi', 'ratedPsi']) if (num(v.dimensions?.[k]) === lo) setDim(p, v, k, hi)
  }
}

const PARKER_CODE = /^(\d{1,2}\.\d{2})[A-Z]/
const TRAILING_STROKE = /(\d{1,3}\.\d{2})$/
function ruleParkerBore(p: P) {
  if (!/^parker-(4ma|2mnr|sr|srm|srd|srdm)-/.test(p.slug)) return
  for (const v of p.variants) {
    const m = PARKER_CODE.exec(v.partNumber)
    if (!m) continue
    const bore = Number(m[1]) === 1.06 ? 1.0625 : Number(m[1])
    const cur = num(v.dimensions?.boreIn)
    if (cur !== null && Math.abs(cur - bore) > 0.01) {
      if (cur < bore && v.dimensions?.rodIn === undefined) setDim(p, v, 'rodIn', cur)
      setDim(p, v, 'boreIn', bore)
    } else if (cur === null) setDim(p, v, 'boreIn', bore)
    const s = TRAILING_STROKE.exec(v.partNumber)
    if (s && v.dimensions?.strokeIn === undefined) setDim(p, v, 'strokeIn', Number(s[1]))
  }
}

const MOUNT_FULL = /([A-Z][A-Za-z ,/-]*Mounting \(NFPA [A-Z0-9]+\))/
function ruleMount(p: P) {
  for (const v of p.variants) {
    const mt = v.dimensions?.mount
    if (typeof mt !== 'string' || mt.endsWith(')')) continue
    const m = MOUNT_FULL.exec(item(v))
    if (m && m[1]!.startsWith(mt.slice(0, 20))) setDim(p, v, 'mount', m[1])
  }
}

function ruleFractions(p: P) {
  for (const v of p.variants) {
    const t = item(v)
    const fixed = t.replace(/(\d+) (\d+)\/(25|50)"/g, (_, w, n, d) => `${(Number(w) + Number(n) / Number(d)).toFixed(2)}"`)
    if (fixed !== t) setDim(p, v, 'item', fixed)
  }
}

const HS_VALVE = '8481200080'
const HS_FILTER = '8421398015'
function ruleHs(p: P) {
  const t = p.title
  if (p.hsCode?.startsWith('8482')) p.hsCode = HS_VALVE
  if (p.hsCode?.startsWith('9032')) {
    if (/filter/i.test(t) && !/regulator/i.test(t)) p.hsCode = HS_FILTER
    else if (/valve/i.test(t)) p.hsCode = HS_VALVE
    else p.hsCode = null // lubricators etc.: no code beats the wrong chapter
  }
  if (/filter/i.test(t) && !/regulator/i.test(t) && (p.hsCode?.startsWith('842129') || p.hsCode === '848110')) p.hsCode = HS_FILTER
}

const MAKER_PRESSURE = /<li>Pressure stated by the maker:[^<]*<\/li>/
function rulePressureLine(p: P) {
  if (!p.descriptionLong || !MAKER_PRESSURE.test(p.descriptionLong)) return
  const ps = p.variants
    .map((v) => num(v.dimensions?.maxPsi) ?? num(v.dimensions?.ratedPsi))
    .filter((x): x is number => x !== null)
  const bar = (x: number) => Math.round(x / 14.5038)
  const fmt = (x: number) => x.toLocaleString('en-US')
  let line = ''
  if (ps.length) {
    const lo = Math.min(...ps)
    const hi = Math.max(...ps)
    line =
      lo === hi
        ? `<li>Pressure stated by the maker: ${fmt(lo)} psi (${bar(lo)} bar)</li>`
        : `<li>Pressure stated by the maker: ${fmt(lo)} to ${fmt(hi)} psi (${bar(lo)} to ${bar(hi)} bar), by size</li>`
  }
  p.descriptionLong = p.descriptionLong.replace(MAKER_PRESSURE, line)
}

// ── targeted fixes (slug → edit) ───────────────────────────────────────────
const TARGETED: Record<string, (p: P) => void> = {}
const on = (slugs: string | RegExp, fn: (p: P) => void) => {
  if (typeof slugs === 'string') TARGETED[slugs] = fn
  else TARGETED[`re:${slugs.source}`] = fn
}

// Air motors
on(/^ingersoll-rand-/, (p) => {
  dropSpec(p, 'Application', /Equipmentas/)
  if (/m00[24]-series/.test(p.slug) || p.variants.some((v) => /RVR/.test(v.partNumber))) dropSpec(p, 'Reversible', /^No$/)
})
on('ingersoll-rand-3800-series-in-line-planetary-gear-multi-vane-air-motors', (p) => {
  dropSpec(p, 'Application', /Equipmentas/)
})

// FRL
on('dixon-series-1-frls-b07-series-miniature-filters-regulators', (p) => {
  p.variants = p.variants.filter((v) => v.partNumber !== 'PND-B07-202MGC')
  dropSpec(p, 'Drain Type')
})
const NORGREN_LOW = /^norgren-(excelon-)?plus-8[24]-series-air-(filter-regulators|regulators|micro-fog-lubricators)$/
on(NORGREN_LOW, (p) => {
  for (const v of p.variants) if ((num(v.dimensions?.maxPsi) ?? 99) <= 5) setDim(p, v, 'maxPsi', null)
})
on('norgren-excelon-plus-82-series-air-filters', (p) => {
  dropSpec(p, 'Includes', /0\.01 Micron/)
})
on('parker-filters', (p) => {
  retitle(p, 'Parker Portable Hydraulic Filter Unit Elements')
  p.category = 'hydraulic-filters'
})
on('parker-main-line-compressed-air-filters', (p) => {
  for (const v of rows(p, /^AOPX/)) setDim(p, v, 'type', 'Coalescing (1 Micron)')
  for (const v of rows(p, /^ACSPX/)) setDim(p, v, 'type', 'Activated Carbon (Oil Vapour)')
  setItem(p, /^A[AO]PX030GN/, /\b1 Inch Npt/i, '1 1/2 Inch Npt')
})
on(/^parker-p31-mini-global-modular-/, (p) => {
  for (const s of p.specs) s.value = s.value.replace(/\b5 mm Particulate/, '5 Micron Particulate').replace(/\b0\.01 mm Coalescing/, '0.01 Micron Coalescing').replace(/Baffles Intered/, 'Baffles Sintered')
})
on('parker-pneumatic-regulator-nonrising-knob', (p) => {
  for (const v of p.variants) {
    const m = /(\d{3}) Psi/i.exec(item(v))
    if (m && num(v.dimensions?.maxPsi) === 125 && Number(m[1]) > 125) setDim(p, v, 'maxPsi', Number(m[1]))
  }
  if (p.variants.some((v) => /R119/.test(v.partNumber))) dropSpec(p, /^Adj/)
})
on('parker-p3nf-h-flow-general-industrial-coalescing-filters', (p) => {
  retitle(p, 'Parker P3NF Hi-Flow General Industrial Particulate and Coalescing Filters')
  dropSpec(p, 'Type', /Particulate/)
})
on('wilkerson-filter-regulators', (p) => {
  dropSpec(p, /^(Body Material|Bowl Material|Seal Material)$/, /Stainless|Fluoro/i)
})

// Control valves
on('parker-miniature-high-speed-pneumatic-logic-control-valves', (p) => {
  for (const v of p.variants) if (num(v.dimensions?.maxPsi) === 44 && /3\s*-\s*8 bar/i.test(item(v))) setDim(p, v, 'maxPsi', 116)
})
on(/^parker-b-series-single-air-piloted-valves-/, (p) => {
  for (const v of p.variants) {
    const m = /(\d+(?: \d+)?\/\d+) Inch Port/.exec(item(v))
    if (m) setDim(p, v, 'ports', `${m[1]}"`)
  }
})
on('parker-viking-xtreme-series-manual-mechanical-valves-3-way-2-position-inline-perpendicular-lever', (p) => {
  const size: Record<string, string> = { A: '1/8"', B: '1/4"', C: '3/8"', D: '1/2"' }
  for (const v of p.variants) {
    const m = /^P2L([ABCD])/.exec(v.partNumber)
    if (m) setDim(p, v, 'ports', size[m[1]!])
  }
})
on('parker-n-series-valve-air-pilot-3-way', (p) => setItem(p, /^N35441091$/, '1 1/2 Inch Inlet', '1/2 Inch Inlet'))

// Cylinders
const FOURMA_1P = /^parker-4ma-series-tie-rod-pneumatic-cylinders-1-inch-bore/
on(FOURMA_1P, (p) => {
  dropSpec(p, 'Design', /Based On Model/i)
  if (/short-female|intermediate-male|full-male|small-male|lip-seal-piston/.test(p.slug)) {
    dropSpec(p, 'Connection Type')
    dropSpec(p, 'Mounting Mode')
  }
  const t = p.title.replace(/, 1 Inch Bore(?=,|$)/, '')
  if (t !== p.title) retitle(p, t)
  if (p.seoTitle) p.seoTitle = p.seoTitle.replace(/, 1 Inch Bore(?=,|$)/, '')
})
on('parker-4ma-series-tie-rod-pneumatic-cylinders-1-inch-bore-lip-seal-piston', (p) => {
  retitle(p, 'Parker 4MA Series Tie Rod Pneumatic Cylinder, Lip Seal Piston, 2" Bore, 4" Stroke')
  p.seoTitle = 'Parker 4MA Tie Rod Air Cylinder, Lip Seal Piston, 2" Bore, 4" Stroke'
  dropSpec(p, 'Design', /Based On Model/i)
})
on('parker-4ma-series-tie-rod-pneumatic-cylinders-1-inch-bore-short-female-rod-number-3', (p) => {
  retitle(p, 'Parker 4MA Series Tie Rod Pneumatic Cylinder, Short Female, 8" Bore, 23" Stroke')
  p.seoTitle = 'Parker 4MA Tie Rod Air Cylinder, Short Female, 8" Bore, 23" Stroke'
  dropSpec(p, 'Design', /Based On Model/i)
  if (p.weightKg !== undefined) p.weightKg = null
})
on('parker-lp-series-compact-pneumatic-cylinders-1-inch-bore', (p) =>
  retitle(p, 'Parker LP Series Compact Pneumatic Cylinders, 1-1/8 to 4 Inch Bore, 1P Part Numbers'),
)
on('parker-lpm-series-compact-pneumatic-cylinders-1-inch-bore', (p) =>
  retitle(p, 'Parker LPM Series Compact Pneumatic Cylinders, 1-1/8 to 4 Inch Bore, 1P Part Numbers'),
)
on(/^parker-p1f-series-/, (p) => {
  for (const v of p.variants) {
    const m = /^P1F-[A-Z](\d{3})/.exec(v.partNumber)
    if (!m) continue
    const mm = Number(m[1])
    const t = item(v).replace(/\b(\d{2,3}) mm Bore/, (all, b) => (Number(b) === mm ? all : `${mm} mm Bore`))
    setDim(p, v, 'item', t)
  }
})

// Grippers
on(/^destaco-dgc-/, (p) => {
  for (const v of rows(p, /^DGC-45/)) if (num(v.dimensions?.strokeIn) === 1.81) setDim(p, v, 'strokeIn', 1.18)
})
on('destaco-dpds-series-compact-robust-parallel-grippers', (p) => {
  for (const v of rows(p, /^DPDS-056M-006$/)) setDim(p, v, 'boreIn', 0.563)
})
on('destaco-rps-series-parallel-grippers-sealed', (p) => {
  for (const v of p.variants) if (num(v.dimensions?.boreIn) === 46.1) setDim(p, v, 'boreIn', 1.815)
})
on('destaco-pneumatic-grippers', (p) => retitle(p, 'Destaco Gripper Accessories, Sensor Kits and Power Slides'))
on('destaco-g110-series-grippers', (p) => retitle(p, 'Destaco G110 Series Gripper Finger Kits'))
on(/^destaco-/, (p) => {
  if (!/clamp/i.test(p.title)) dropSpec(p, /^(Handle Color|Spindle Included)$/)
})

// Flow and check valves
on('smc-speed-control-valve-with-5-32-tube-size', (p) => setSpec(p, 'Air Line Connection', '5/32" Tube'))
on(/^smc-speed-control-valve-with-/, (p) => setSpec(p, 'Body Material', 'Brass'))
on('smc-air-cylinder-speed-controls', (p) => {
  setItem(p, /^AS4201FG-N04-13S$/, /1\/8 Inch Port Size, 3\/16 Inch Tube Size/, '1/2 Inch Port Size, 1/2 Inch Tube Size')
  setItem(p, /^AS1211F-M5-/, /NPT x Tube, 1\/8 Inch Valve Port Size/, 'M5 x Tube')
  setItem(p, /^AS1201F-U10\/32-/, /NPT x Tube/, '10-32 UNF x Tube')
  setSpec(p, 'Connection Type', 'R (BSPT), NPT, M5 or 10-32 UNF x Tube, or Tube x Tube, by part number')
})
on('smc-akm-series-check-valve', (p) => setSpec(p, 'Thread Type', 'Rc, NPT or G, by part number'))
on('smc-exhaust-port-flow-controls', (p) => {
  for (const v of rows(p, /^ASN2-(01|N04-S)$/)) if (/145 ?psi/i.test(item(v))) setDim(p, v, 'maxPsi', 145)
})

// Safety, relief and lockout
on('parker-global-soft-start-valves-p32s-series', (p) => {
  for (const v of p.variants) if (num(v.dimensions?.maxPsi) === 44) setDim(p, v, 'maxPsi', 250)
})
on('dixon-standard-safety-pop-off-valves', (p) => {
  dropSpec(p, 'Application', /Water Only/i)
  setSpec(p, 'Type', 'Safety Pop-Off Valve')
})

// Solenoid valves
on(/^(parker-b-series-(single|double)-solenoid-valves-4-way-2-position|parker-solenoid-air-control-valve-2-way-normally-closed|numatics-solenoid-air-control-valve-4-way-3-position-5-port|numatics-solenoid-air-control-valve-4-way-2-position-5-port-detented)$/, (p) => {
  // Minimum pilot / operating pressure stored as the maximum; no maximum on the row.
  for (const v of p.variants) if ((num(v.dimensions?.maxPsi) ?? 99) <= 35) setDim(p, v, 'maxPsi', null)
})
on(/^smc-solenoid-air-control-valve-5-way-2-position(-5-port)?$/, (p) => {
  for (const v of p.variants) {
    const mp = num(v.dimensions?.maxPsi)
    if ((mp === 15 || mp === 22) && /^(SY|VQZ)/.test(v.partNumber)) setDim(p, v, 'maxPsi', 101)
  }
  setItem(p, /^VFS2100-5FZ$/, /110-120 ?V ?AC/i, '24V DC')
  for (const v of rows(p, /^VFS2100-5FZ$/)) setDim(p, v, 'powerSupply', '24V DC')
  dropSpec(p, /^(Series|Actuator Type|Center Position|Return Action)$/)
})
on(/^smc-solenoid-air-control-valve-5-way-3-position(-5-port)?$/, (p) => dropSpec(p, 'Center Position'))
on(/^smc-solenoid-air-control-valve-[45]-way-3-position/, (p) => {
  for (const v of rows(p, /^SV\d300/)) setDim(p, v, 'item', item(v).replace(/\b(\d\.\d+) ?CFM\b/, 'Cv $1'))
})
on('smc-valve', (p) => {
  setItem(p, /^VP4150/, /(?:^|(?<=[^\d.]))(?:0\.)*2 MPa to 0\.9 MPa/, '0.2 MPa to 0.9 MPa')
  for (const v of p.variants) setDim(p, v, 'item', item(v).replace(/,?\s*Driving Type Show More/g, ''))
})
on('smc-pvq-series-proportional-valve', (p) => {
  setSpec(p, 'Seal Type', 'Soft Seal')
  dropSpec(p, 'Plumbing', /Soft Seal/)
})
on('smc-sy7000-series-manifold', (p) => {
  retitle(p, 'SMC SY7000 and SY9000 Series Manifolds')
  dropSpec(p, 'Stations')
  for (const v of rows(p, /^SS5Y9-/)) setDim(p, v, 'item', item(v).replace(/ \d+ Inch Port Size/, ''))
})
on(/^smc-(ss3y1|ss3yj5|ss3yj7|ss5yj7|ss5y5)-series-manifold$/, (p) => dropSpec(p, 'Stations'))
on('smc-vt4-series-solenoid-valve', (p) => {
  retitle(p, 'SMC VPA Series Air Pilot Valves')
  p.category = 'pneumatic-control-valves'
  dropSpec(p, /^(Switching Type|Pilot No\.?)$/)
})

on('aro-alpha-series-pneumatic-valves', (p) => {
  // 50 psi is the bottom of the 50 to 150 psi range the sibling rows state.
  for (const v of p.variants) if (num(v.dimensions?.maxPsi) === 50) setDim(p, v, 'maxPsi', null)
})

// Vacuum
on(/^smc-vacuum-pad-/, (p) => dropSpec(p, /^(Pad Material|Durometer|Temp\.?.*)$/))

// Rows filed on the wrong listing → the listing of their own series.
const MOVES: { from: string; re: RegExp; to: string }[] = [
  { from: 'wilkerson-frls-l16-series-economist-compact-lubricators', re: /^L18-/, to: 'wilkerson-l18-economist-lubricators' },
  { from: 'wilkerson-frls-l16-series-economist-compact-lubricators', re: /^L28-/, to: 'wilkerson-l28-economist-lubricators' },
  { from: 'wilkerson-frls-l16-series-economist-compact-lubricators', re: /^L30-/, to: 'wilkerson-l30-economist-lubricators' },
  { from: 'wilkerson-air-regulators', re: /^R30-/, to: 'wilkerson-r30-regulators' },
  { from: 'wilkerson-filter-regulators', re: /^BB3-/, to: 'wilkerson-frls-bb3-series-miniature-filters-regulators' },
  { from: 'wilkerson-filter-regulators', re: /^CB6-/, to: 'wilkerson-frls-cb6-series-compact-filters-regulators' },
  { from: 'destaco-2p-series-parallel-grippers', re: /^16503P-H$/, to: 'destaco-3p-series-parallel-grippers' },
]

const pressures = (p: P) =>
  JSON.stringify(p.variants.map((v) => [v.partNumber, v.dimensions?.maxPsi ?? null, v.dimensions?.ratedPsi ?? null]))

function applyAll(products: Map<string, P>, scope: (p: P) => boolean) {
  const was = new Map([...products.values()].map((p) => [p.slug, pressures(p)] as const))
  for (const p of products.values()) {
    if (!scope(p)) continue
    ruleRangeTop(p)
    ruleParkerBore(p)
    ruleMount(p)
    ruleFractions(p)
    ruleHs(p)
    for (const [k, fn] of Object.entries(TARGETED)) {
      if (k.startsWith('re:') ? new RegExp(k.slice(3)).test(p.slug) : k === p.slug) fn(p)
    }
  }
  for (const m of MOVES) {
    const a = products.get(m.from)
    const b = products.get(m.to)
    if (!a || !b) continue
    const moving = a.variants.filter((v) => m.re.test(v.partNumber))
    a.variants = a.variants.filter((v) => !m.re.test(v.partNumber))
    let pos = Math.max(-1, ...b.variants.map((v) => v.position)) + 1
    for (const v of moving) b.variants.push({ ...v, position: pos++ })
  }
  // Only where a pressure column changed: other lines carry a maker figure the rows do not repeat.
  for (const p of products.values()) if (scope(p) && pressures(p) !== was.get(p.slug)) rulePressureLine(p)
}

// ── database side ──────────────────────────────────────────────────────────
async function loadDb(): Promise<{ map: Map<string, P>; ids: Map<string, string>; cats: Map<string, string> }> {
  const cats = new Map((await db.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id] as const))
  const shelfIds = SHELVES.map((s) => cats.get(s)).filter((x): x is string => !!x)
  const ps = await db.product.findMany({
    where: { status: 'active', categoryId: { in: shelfIds } },
    include: { specs: { orderBy: { position: 'asc' } }, variants: { orderBy: { position: 'asc' } }, category: { select: { slug: true } } },
  })
  const map = new Map<string, P>()
  const ids = new Map<string, string>()
  for (const p of ps) {
    ids.set(p.slug, p.id)
    map.set(p.slug, {
      slug: p.slug,
      title: p.title,
      seoTitle: p.seoTitle,
      focusKeyword: p.focusKeyword,
      descriptionShort: p.descriptionShort,
      descriptionLong: p.descriptionLong,
      seoDescription: p.seoDescription,
      hsCode: p.hsCode,
      category: p.category!.slug,
      weightKg: p.weightKg?.toString() ?? null,
      specs: p.specs.map((s) => ({ label: s.label, value: s.value, id: s.id })),
      variants: p.variants.map((v) => ({ partNumber: v.partNumber, position: v.position, dimensions: (v.dimensions as Dims | null) ?? null, id: v.id })),
    })
  }
  return { map, ids, cats }
}

const PRODUCT_FIELDS = ['title', 'seoTitle', 'focusKeyword', 'descriptionShort', 'descriptionLong', 'seoDescription', 'hsCode'] as const

async function main() {
  const write = process.argv.includes('--write')

  // Database: before / after.
  const { map, ids, cats } = await loadDb()
  const before = new Map([...map].map(([k, v]) => [k, JSON.parse(JSON.stringify(v)) as P]))
  applyAll(map, () => true)

  const ops: { slug: string; what: string[]; run: (tx: Prisma.TransactionClient) => Promise<void> }[] = []
  const owner = new Map<string, string>() // partNumber → slug after the edit
  for (const p of map.values()) for (const v of p.variants) owner.set(v.partNumber, p.slug)
  for (const [slug, p] of map) {
    const b = before.get(slug)!
    const what: string[] = []
    const data: Prisma.ProductUpdateInput = {}
    for (const f of PRODUCT_FIELDS) if (p[f] !== b[f]) { (data as Record<string, unknown>)[f] = p[f]; what.push(f) }
    if (p.category !== b.category) { data.category = { connect: { id: cats.get(p.category)! } }; what.push(`category→${p.category}`) }
    if ((p.weightKg ?? null) !== (b.weightKg ?? null)) { data.weightKg = p.weightKg === null ? null : new Prisma.Decimal(String(p.weightKg)); what.push('weightKg') }
    const specDrops = b.specs.filter((s) => !p.specs.some((x) => x.id === s.id))
    const specEdits = p.specs.filter((s) => b.specs.find((x) => x.id === s.id)?.value !== s.value)
    if (specDrops.length) what.push(`-${specDrops.length} specs (${specDrops.map((s) => s.label).join(', ')})`)
    if (specEdits.length) what.push(`~${specEdits.length} specs (${specEdits.map((s) => s.label).join(', ')})`)
    const bv = new Map(b.variants.map((v) => [v.partNumber, v]))
    const dimEdits = p.variants.filter((v) => bv.has(v.partNumber) && JSON.stringify(bv.get(v.partNumber)!.dimensions) !== JSON.stringify(v.dimensions))
    const movedIn = p.variants.filter((v) => !bv.has(v.partNumber))
    const gone = b.variants.filter((v) => !owner.has(v.partNumber))
    if (dimEdits.length) what.push(`${dimEdits.length} rows edited`)
    if (movedIn.length) what.push(`${movedIn.length} rows moved in (${movedIn.map((v) => v.partNumber).join(', ')})`)
    if (gone.length) what.push(`${gone.length} rows deleted (${gone.map((v) => v.partNumber).join(', ')})`)
    if (!what.length) continue
    const id = ids.get(slug)!
    ops.push({
      slug,
      what,
      run: async (tx) => {
        if (Object.keys(data).length) await tx.product.update({ where: { id }, data })
        if (specDrops.length) await tx.productSpec.deleteMany({ where: { id: { in: specDrops.map((s) => s.id as string) } } })
        for (const s of specEdits) await tx.productSpec.update({ where: { id: s.id as string }, data: { value: s.value } })
        for (const v of dimEdits) await tx.productVariant.update({ where: { id: v.id as string }, data: { dimensions: (v.dimensions ?? Prisma.JsonNull) as Prisma.InputJsonValue } })
        for (const v of movedIn) await tx.productVariant.update({ where: { id: v.id as string }, data: { productId: id, position: v.position, dimensions: (v.dimensions ?? Prisma.JsonNull) as Prisma.InputJsonValue } })
        if (gone.length) await tx.productVariant.deleteMany({ where: { id: { in: gone.map((v) => v.id as string) } } })
      },
    })
  }
  for (const o of ops) console.log(`${o.slug}: ${o.what.join('; ')}`)
  console.log(`\n${ops.length} products change in the database.`)

  // Payloads: same rules on the products the database change touches.
  const touched = new Set(ops.map((o) => o.slug))
  for (const file of PAYLOADS) {
    const text = readFileSync(file, 'utf8')
    const cat = JSON.parse(text) as { products: P[] }
    const pm = new Map(cat.products.map((p) => [p.slug, p] as const))
    const pb = new Map([...pm].map(([k, v]) => [k, JSON.stringify(v)]))
    applyAll(pm, (p) => touched.has(p.slug))
    const changed = [...pm.values()].filter((p) => JSON.stringify(p) !== pb.get(p.slug))
    if (!changed.length) continue
    writeFileSync(file, spliceProducts(text, changed))
    console.log(`payload ${file.split('/data/')[1]}: ${changed.length} products rewritten`)
  }

  if (!write) {
    console.log('\nDry run for the database — add --write to apply.')
    return
  }
  for (const o of ops) {
    await db.$transaction((tx) => o.run(tx), { timeout: 900_000, maxWait: 10_000 })
    console.log(`  wrote ${o.slug}`)
  }
}

/** Replace only the given products' blocks; the file's other bytes stay as they are. */
function spliceProducts(text: string, products: P[]): string {
  const lines = text.split('\n')
  for (const p of products) {
    const at = lines.findIndex((l) => l === `   "slug": ${JSON.stringify(p.slug)},`)
    if (at < 0) throw new Error(`payload block not found for ${p.slug}`)
    let start = at
    while (lines[start] !== '  {') start--
    let end = at
    while (!/^  \},?$/.test(lines[end]!)) end++
    const comma = lines[end]!.endsWith(',') ? ',' : ''
    const block = JSON.stringify(p, null, 1).split('\n').map((l) => `  ${l}`)
    block[block.length - 1] += comma
    lines.splice(start, end - start + 1, ...block)
  }
  return lines.join('\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
