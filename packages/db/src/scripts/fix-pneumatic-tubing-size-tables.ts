/**
 * Rebuild the size tables of the 28 pneumatic tubing listings from their part
 * numbers and the makers' own published figures — 2026-11-19.
 *
 * WHY. The tubing rows came from a scraped export whose attributes were
 * shuffled between rows. On the live pages:
 *   - SMC TUZ/TUH/TRS polyurethane and nylon tube (0.8–1.2 MPa) showed 200 or
 *     1,000 bar: the roll-length code had landed in the pressure column;
 *   - "Tube O.D." held bend radii converted from inches (101.6, 152.4, 254);
 *   - T1075BU-20 said 100 m and T1075W-100 said 20 m;
 *   - every Parker fluoropolymer row carried the MINIMUM BURST pressure, not
 *     the working pressure (203-0400100: burst 80 bar, working 20 bar), and the
 *     25 ft rows carried something else again (0–2 bar);
 *   - descriptions repeated the bad range ("7 to 1,560 psi (0 to 108 bar)").
 * Found while writing product FAQs (docs/product-faq-plan.md §10).
 *
 * HOW. SMC and Parker part numbers encode the tube: TUZ0604BU-20 is TUZ,
 * 6 × 4 mm, blue, 20 m roll; 201-0400100-NT-100 is 201 PTFE, 4 mm OD, 1 mm
 * wall, natural, 100 ft. Each row is rebuilt from its part number, and its
 * pressure taken from `maker-ratings-2026-11-19.json` (SMC Best Pneumatics
 * catalogue; Parker Parflex catalogue 4660). Where the maker figure is not in
 * hand, a row keeps its existing pressure only if every row of the same size
 * agrees and the figure is plausible; otherwise the row shows no figure.
 * Nothing is guessed. ATP and Nycoil rows are left alone.
 *
 * The description's "Pressure stated by the maker" line is regenerated from
 * the rebuilt rows; wrong material/temperature lines are corrected.
 *
 * WRITES the catalogue payload (data/catalogue-maker-pneumatic-tubing-fittings/
 * catalogue.json — so a re-import does not bring the errors back) and, with
 * --write, the same rows to the database: variants matched by product + part
 * number, pressureBar and dimensions only; descriptions and the material spec.
 * One transaction per product. Idempotent.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-pneumatic-tubing-size-tables.ts [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient, Prisma } from '@prisma/client'

const db = new PrismaClient()
const DIR = resolve(__dirname, '../../data/catalogue-maker-pneumatic-tubing-fittings')
const CATALOGUE = resolve(DIR, 'catalogue.json')
const RATINGS = resolve(DIR, 'maker-ratings-2026-11-19.json')

type Dims = Record<string, string | number | null | undefined>
type Variant = { partNumber: string; position: number; pressureBar?: number | null; dimensions?: Dims | null }
type Product = {
  slug: string
  category: string
  title: string
  descriptionShort: string | null
  descriptionLong: string | null
  seoDescription?: string | null
  variants: Variant[]
}
type Ratings = {
  smcWorkingPressureBar: Record<string, Record<string, number>>
  smcInchSizesMm: Record<string, Record<string, [number, number]>>
  parkerFluoropolymer: Record<
    string,
    { odMm: number; idMm: number; wallMm: number; workingPressureBar: number; workingPressurePsi: number }
  >
  parkerAS81914: Record<string, { maxIdMm: number; maxOdMm: number }>
}

const SKIP = new Set(['atp-tubings', 'nycoil-tubings'])

const SMC_COLOURS: Record<string, string> = {
  B: 'Black', W: 'White', R: 'Red', BU: 'Blue', Y: 'Yellow', G: 'Green', C: 'Clear', YR: 'Orange',
  N: 'Translucent', BU1: 'Solid blue', BU2: 'Clear blue', BU3: 'Medium blue', BR1: 'Brown',
  G1: 'Solid green', G2: 'Clear green', G3: 'Neon green', G4: 'Dark green', GR1: 'Gray', GR2: 'Light gray',
  P1: 'Neon pink', PU1: 'Solid purple', PU2: 'Clear purple', R1: 'Solid red', R2: 'Clear red', S1: 'Silver',
  Y1: 'Solid yellow', Y2: 'Clear yellow', Y3: 'Neon yellow', YR1: 'Clear orange', YR2: 'Neon orange',
}
const SMC_SERIES: Record<string, string> = {
  T: 'SMC T nylon tube', TIA: 'SMC TIA nylon tube', TS: 'SMC TS soft nylon tube', TISA: 'SMC TISA soft nylon tube',
  TU: 'SMC TU polyurethane tube', TIUB: 'SMC TIUB polyurethane tube', TUH: 'SMC TUH hard polyurethane tube',
  TUZ: 'SMC TUZ wear-resistant polyurethane tube', TCU: 'SMC TCU polyurethane coil tube',
  TRS: 'SMC TRS flame-resistant soft nylon tube', TIRS: 'SMC TIRS flame-resistant soft nylon tube', TRB: 'SMC TRB flame-resistant double-layer tube',
  TRBU: 'SMC TRBU flame-resistant double-layer polyurethane tube', TRTU: 'SMC TRTU flame-resistant three-layer tube',
  TPH: 'SMC TPH clean polyolefin tube', TPS: 'SMC TPS clean soft polyolefin tube', TL: 'SMC TL Super PFA tube',
  TLM: 'SMC TLM PFA tube', TIL: 'SMC TIL Super PFA tube', TILB: 'SMC TIL Super PFA tube', TILM: 'SMC TILM PFA tube',
  TH: 'SMC TH FEP tube', TIH: 'SMC TIH FEP tube', TIHA: 'SMC TIH FEP tube', TIHB: 'SMC TIH FEP tube',
  TD: 'SMC TD modified PTFE tube', TID: 'SMC TID modified PTFE tube', TQ: 'SMC TQ two-layer fluoropolymer tube',
  TAS: 'SMC TAS antistatic soft nylon tube', TAU: 'SMC TAU antistatic polyurethane tube', TIV: 'SMC TIV tube',
  PEAPP: 'SMC PEAPP polyethylene tube',
}
const INCH_OD: Record<string, string> = {
  '01': '1/8"', '05': '3/16"', '07': '1/4"', '11': '3/8"', '13': '1/2"', '19': '3/4"', '25': '1"',
}
const INCH_OD_MM: Record<string, number> = { '01': 3.18, '05': 4.76, '07': 6.35, '11': 9.53, '13': 12.7, '19': 19.05, '25': 25.4 }
const FT_FOR_M: Record<string, string> = { '16': '50 ft', '33': '100 ft', '77': '250 ft', '153': '500 ft', '305': '1,000 ft' }

const PARKER_COLOURS: Record<string, string> = {
  NT: 'Natural', '0T': 'Black', '2T': 'Red', '5T': 'Green', '6T': 'Blue', '9T': 'White',
  BLK: 'Black', BLU: 'Blue', GRN: 'Green', RED: 'Red', TBL: 'Translucent blue', YEL: 'Yellow', WHT: 'White',
}

const r2 = (n: number) => Math.round(n * 100) / 100
const fmt = (n: number) => String(r2(n))

/** Metric SMC size code "0425" → [4, 2.5]; "3220" → [3.2, 2]. */
function smcMetricSize(code: string): [number, number] | null {
  if (code === '3220') return [3.2, 2]
  const od = Number(code.slice(0, 2))
  const x = code.slice(2)
  if (!od) return null
  const v = Number(x)
  const id = x.startsWith('0') ? Number(x[1]) : v < od ? v : v / 10
  return id > 0 && id < od ? [od, id] : null
}

type Rebuilt = { pressureBar: number | null; dimensions: Dims } | null

function rebuildSmc(pn: string, ratings: Ratings): { rebuilt: Rebuilt; series: string | null; size: string | null } {
  const metric = pn.match(/^(TRBU|TRTU|TRS|TRB|TUH|TUZ|TCU|TPH|TPS|TLM|TAS|TAU|TS|TU|TL|TH|TD|TQ|T)(\d{4})([A-Z]{1,2}\d?)?-(\d+)(?:-(\d+))?(?:-(X[0-9A-Z]+))?$/)
  const inch = pn.match(/^(TISA|TIUB|TIRS|TILB|TILM|TIHA|TIHB|TIA|TIL|TIH|TID|TIV)(\d{2})([A-Z]{1,2}\d?)?(?:-(\d+))?(?:-(X[0-9A-Z]+))?$/)
  const pe = pn.match(/^(PEAPP)(\d{2})([A-Z]{1,2}\d?)?-(\d+)$/)
  if (metric) {
    const [, series, code, colourCode, a, b, mto] = metric
    const size = smcMetricSize(code!)
    const isCoil = series === 'TCU'
    const lengthM = isCoil ? null : a!
    const table = ratings.smcWorkingPressureBar[series!]
    const pressure = table ? table[code!] ?? table['*'] ?? null : undefined
    const dims: Dims = {}
    let desc = SMC_SERIES[series!] ?? `SMC ${series} tube`
    if (size) {
      dims.OD = size[0]
      dims.insideDia = fmt(size[1])
      dims.wall = fmt((size[0] - size[1]) / 2)
      desc += `, ${fmt(size[0])} × ${fmt(size[1])} mm`
    }
    if (colourCode) {
      dims.colour = SMC_COLOURS[colourCode] ?? colourCode
      desc += `, ${(dims.colour as string).toLowerCase()}`
    }
    if (isCoil) desc += `, ${a} core${a === '1' ? '' : 's'}, ${b} coil turns`
    if (lengthM) {
      dims.length = `${lengthM} m`
      desc += `, ${lengthM} m roll`
    }
    if (mto) desc += ' (made to order)'
    dims.item = desc
    return { rebuilt: { pressureBar: pressure === undefined ? NaN : pressure, dimensions: dims }, series: series!, size: code! }
  }
  if (inch || pe) {
    const m = (inch ?? pe)!
    const [, series, code, colourCode, len] = m
    const mto = inch ? inch[5] : undefined
    const dims: Dims = {}
    let desc = SMC_SERIES[series!] ?? `SMC ${series} tube`
    const known = ratings.smcInchSizesMm[series!]?.[code!]
    if (series === 'PEAPP') {
      desc += `, ${Number(code)} mm`
    } else if (known) {
      dims.OD = known[0]
      dims.insideDia = fmt(known[1])
      dims.wall = fmt((known[0] - known[1]) / 2)
      desc += `, ${INCH_OD[code!] ?? code} (${fmt(known[0])} × ${fmt(known[1])} mm)`
    } else if (INCH_OD_MM[code!]) {
      dims.OD = INCH_OD_MM[code!]!
      desc += `, ${INCH_OD[code!]} OD`
    }
    if (colourCode) {
      dims.colour = SMC_COLOURS[colourCode] ?? colourCode
      desc += `, ${(dims.colour as string).toLowerCase()}`
    }
    if (len) {
      dims.length = FT_FOR_M[len] ? `${len} m (${FT_FOR_M[len]})` : `${len} m`
      desc += `, ${dims.length} roll`
    }
    if (mto) desc += ' (made to order)'
    dims.item = desc
    const table = ratings.smcWorkingPressureBar[series!]
    const pressure = table ? table[code!] ?? table['*'] ?? null : undefined
    return { rebuilt: { pressureBar: pressure === undefined ? NaN : pressure, dimensions: dims }, series: series!, size: code! }
  }
  return { rebuilt: null, series: null, size: null }
}

const inchFrac = (sixteenths: number): string => {
  const map: Record<number, string> = {
    2: '1/8"', 2.5: '5/32"', 3: '3/16"', 4: '1/4"', 5: '5/16"', 6: '3/8"', 7: '7/16"', 8: '1/2"', 10: '5/8"', 12: '3/4"', 16: '1"',
  }
  return map[sixteenths] ?? `${sixteenths}/16"`
}

function rebuildParker(pn: string, ratings: Ratings): { rebuilt: Rebuilt; group: string | null } {
  const fluoro = pn.match(/^(\d{3})-(\d{4})(\d{3})-([0-9A-Z]{2})-(\d+)$/)
  if (fluoro) {
    const [, series, odCode, wallCode, colourCode, lenFt] = fluoro
    const stem = `${series}-${odCode}${wallCode}`
    const metric = series!.startsWith('2')
    const material =
      { '01': 'PTFE', '03': 'FEP', '04': 'PFA', '05': 'high-purity PFA' }[series!.slice(1)] ?? 'fluoropolymer'
    const t = ratings.parkerFluoropolymer[stem]
    const od = t?.odMm ?? (metric ? Number(odCode) / 100 : (Number(odCode) / 1000) * 25.4)
    const wall = t?.wallMm ?? (metric ? Number(wallCode) / 100 : (Number(wallCode) / 1000) * 25.4)
    const id = t?.idMm ?? od - 2 * wall
    const odLabel = metric ? `${fmt(od)} mm OD × ${fmt(wall)} mm wall` : `${(Number(odCode) / 1000).toFixed(3)}" OD × ${(Number(wallCode) / 1000).toFixed(3)}" wall`
    const colour = PARKER_COLOURS[colourCode!] ?? colourCode!
    return {
      group: stem,
      rebuilt: {
        pressureBar: t ? t.workingPressureBar : null,
        dimensions: {
          item: `Parker ${series} ${material} tube, ${odLabel}, ${colour.toLowerCase()}, ${lenFt} ft`,
          OD: r2(od),
          insideDia: fmt(id),
          wall: fmt(wall),
          colour,
          length: `${lenFt} ft`,
        },
      },
    }
  }
  const convo = pn.match(/^(81914\/1-\d{4})-0TC$/)
  if (convo) {
    const t = ratings.parkerAS81914[convo[1]!]
    return {
      group: convo[1]!,
      rebuilt: {
        pressureBar: null,
        dimensions: {
          item: 'Parker SAE AS81914/1 convoluted PTFE tube, black, bulk coil',
          ...(t ? { OD: t.maxOdMm, insideDia: `${fmt(t.maxIdMm)} max` } : {}),
          colour: 'Black',
        },
      },
    }
  }
  const pu = pn.match(/^(95U|95FR|NBR|NNR)-(\d+(?:\.\d)?)(?:-(\d{3}))?(?:-([A-Z]{3}))?-(\d{4})$/)
  if (pu) {
    const [, series, dash, wallCode, colourCode, len] = pu
    const odIn = Number(dash) / 16
    const wallIn = wallCode ? Number(wallCode) / 1000 : null
    const material = { '95U': 'polyurethane', '95FR': 'flame-resistant polyurethane', NBR: 'nylon', NNR: 'nylon' }[series!]!
    const colour = colourCode ? PARKER_COLOURS[colourCode] ?? colourCode : series === 'NBR' ? 'Black' : 'Natural'
    const dims: Dims = {
      item: `Parker ${series} ${material} tube, ${inchFrac(Number(dash))} OD${wallIn ? ` × ${wallIn.toFixed(3)}" wall` : ''}, ${colour.toLowerCase()}, ${Number(len)} ft`,
      OD: r2(odIn * 25.4),
      colour,
      length: `${Number(len)} ft`,
    }
    if (wallIn) {
      dims.wall = fmt(wallIn * 25.4)
      dims.insideDia = fmt((odIn - 2 * wallIn) * 25.4)
    }
    return { group: `${series}-${dash}-${wallCode ?? ''}`, rebuilt: { pressureBar: NaN, dimensions: dims } }
  }
  const pum = pn.match(/^(95UM|EB)-(\d+)X([\d.]+)(?:-([A-Z]{3}))?-(\d{4})$/)
  if (pum) {
    const [, series, odS, wallS, colourCode, len] = pum
    const od = Number(odS)
    const wall = Number(wallS)
    const material = series === 'EB' ? 'polyethylene' : 'polyurethane'
    const colour = colourCode ? PARKER_COLOURS[colourCode] ?? colourCode : 'Natural'
    return {
      group: `${series}-${odS}X${wallS}`,
      rebuilt: {
        pressureBar: NaN,
        dimensions: {
          item: `Parker ${series} ${material} tube, ${od} × ${fmt(od - 2 * wall)} mm, ${colour.toLowerCase()}, ${Number(len)} ft`,
          OD: od,
          insideDia: fmt(od - 2 * wall),
          wall: fmt(wall),
          colour,
          length: `${Number(len)} ft`,
        },
      },
    }
  }
  // EB-53, PP-43, PPB-53: OD then ID in sixteenths of an inch.
  const frac = pn.match(/^(EB|PP|PPB)-(\d{1,2})(\d)-(\d{4})$/)
  if (frac) {
    const [, series, odS, idS, len] = frac
    const od = Number(odS)
    const id = Number(idS)
    const material = series === 'EB' ? 'polyethylene' : 'polypropylene'
    const colour = series === 'PPB' ? 'Black' : series === 'PP' ? 'Natural' : 'Natural'
    return {
      group: `${series}-${odS}${idS}`,
      rebuilt: {
        pressureBar: NaN,
        dimensions: {
          item: `Parker ${series} ${material} tube, ${inchFrac(od)} OD × ${inchFrac(id)} ID, ${colour.toLowerCase()}, ${Number(len)} ft`,
          OD: r2((od / 16) * 25.4),
          insideDia: fmt((id / 16) * 25.4),
          wall: fmt(((od - id) / 32) * 25.4),
          colour,
          length: `${Number(len)} ft`,
        },
      },
    }
  }
  return { rebuilt: null, group: null }
}

/**
 * Where no maker figure is in hand (NaN), keep the existing pressure only if
 * every row in the same size group agrees and it is plausible for unreinforced
 * plastic tube; otherwise show none.
 */
function settleUnrated(rows: { v: Variant; group: string | null; next: Rebuilt }[]) {
  const byGroup = new Map<string, Set<number>>()
  for (const r of rows) {
    if (!r.next || !Number.isNaN(r.next.pressureBar) || !r.group) continue
    const set = byGroup.get(r.group) ?? new Set()
    if (typeof r.v.pressureBar === 'number') set.add(r.v.pressureBar)
    byGroup.set(r.group, set)
  }
  for (const r of rows) {
    if (!r.next || !Number.isNaN(r.next.pressureBar)) continue
    const set = (r.group ? byGroup.get(r.group) : undefined) ?? new Set(typeof r.v.pressureBar === 'number' ? [r.v.pressureBar] : [])
    const only = set.size === 1 ? [...set][0] : null
    const lengthCode = Number(r.v.partNumber.match(/-(\d+)(?:-X[0-9A-Z]+)?$/)?.[1])
    const ok = typeof only === 'number' && only >= 3 && only <= 40 && only !== lengthCode
    r.next.pressureBar = ok ? only : null
  }
}

function pressureLine(variants: Variant[]): string | null {
  const ps = variants.map((v) => v.pressureBar).filter((p): p is number => typeof p === 'number')
  if (ps.length === 0) return null
  const lo = Math.min(...ps)
  const hi = Math.max(...ps)
  // psi is a conversion, not the maker's printed figure — rounded and marked as such.
  const psi = (b: number) => (Math.round((b * 14.5038) / 5) * 5).toLocaleString('en-US')
  const bar = lo === hi ? `${lo} bar (about ${psi(lo)} psi)` : `${lo} to ${hi} bar (about ${psi(lo)} to ${psi(hi)} psi)`
  const covered = ps.length < variants.length ? ', on the sizes the maker rates' : lo === hi ? '' : ', by size'
  return `Working pressure stated by the maker at room temperature: ${bar}${covered}`
}

const MATERIAL_FIXES: Record<string, { from: RegExp; to: string; short?: [RegExp, string] }[]> = {
  'smc-t-series-nylon-tubing': [
    { from: /<li>Material: Urethane<\/li>/, to: '<li>Material: Nylon 12</li>', short: [/ in urethane:/, ' in nylon 12:'] },
  ],
  'smc-ts-series-soft-nylon-tubing': [
    { from: /<li>Temperature: 140°F<\/li>/, to: '<li>Temperature: -40 to +100°C with air; water 0 to +50°C</li>' },
  ],
}

function fixDescription(p: Product, variants: Variant[]): { short: string | null; long: string | null } {
  let long = p.descriptionLong ?? ''
  let short = p.descriptionShort
  const line = pressureLine(variants)
  const re = /<li>(?:Working )?[Pp]ressure stated by the maker[^<]*<\/li>/
  if (re.test(long)) long = long.replace(re, line ? `<li>${line}</li>` : '')
  else if (line) long = long.replace(/(<li>Part numbers: \d+<\/li>)/, `<li>${line}</li>$1`)
  for (const f of MATERIAL_FIXES[p.slug] ?? []) {
    long = long.replace(f.from, f.to)
    if (f.short && short) short = short.replace(f.short[0], f.short[1])
  }
  return { short, long }
}

/**
 * Replace only the rewritten products' blocks in the payload text. The file
 * was written by another tool (1-space indent, `19.0` floats); re-serialising
 * the whole file would rewrite every other product's numbers too.
 */
function spliceProducts(text: string, products: Product[]): string {
  const lines = text.split('\n')
  for (const p of products) {
    const at = lines.findIndex((l) => l === `   "slug": ${JSON.stringify(p.slug)},`)
    if (at < 0) throw new Error(`payload block not found for ${p.slug}`)
    let start = at
    while (lines[start] !== '  {') start--
    let end = at
    while (!/^  \},?$/.test(lines[end]!)) end++
    const comma = lines[end]!.endsWith(',') ? ',' : ''
    const block = JSON.stringify(p, null, 1)
      .split('\n')
      .map((l) => `  ${l}`)
    block[block.length - 1] += comma
    lines.splice(start, end - start + 1, ...block)
  }
  return lines.join('\n')
}

async function main() {
  const write = process.argv.includes('--write')
  const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8')) as { products: Product[] }
  const ratings = JSON.parse(readFileSync(RATINGS, 'utf8')) as Ratings
  const tubing = catalogue.products.filter((p) => p.category === 'pneumatic-tubing' && !SKIP.has(p.slug))

  const summary: string[] = []
  const unparsed: string[] = []
  for (const p of tubing) {
    const rows = p.variants.map((v) => {
      const smc = p.slug.startsWith('smc-') ? rebuildSmc(v.partNumber, ratings) : null
      const parker = p.slug.startsWith('parker-') ? rebuildParker(v.partNumber, ratings) : null
      const next = smc?.rebuilt ?? parker?.rebuilt ?? null
      const group = smc ? (smc.series ? `${smc.series}${smc.size}` : null) : parker?.group ?? null
      if (!next) unparsed.push(`${p.slug}: ${v.partNumber}`)
      return { v, group, next }
    })
    settleUnrated(rows)
    let changed = 0
    for (const r of rows) {
      if (!r.next) continue
      const before = JSON.stringify([r.v.pressureBar ?? null, r.v.dimensions ?? null])
      r.v.pressureBar = r.next.pressureBar
      r.v.dimensions = r.next.dimensions
      if (JSON.stringify([r.v.pressureBar, r.v.dimensions]) !== before) changed++
    }
    const { short, long } = fixDescription(p, p.variants)
    const descChanged = short !== p.descriptionShort || long !== p.descriptionLong
    p.descriptionShort = short
    p.descriptionLong = long
    const ps = p.variants.map((v) => v.pressureBar).filter((x): x is number => typeof x === 'number')
    summary.push(
      `${p.slug}: ${changed}/${p.variants.length} rows changed, pressure ${ps.length ? `${Math.min(...ps)}–${Math.max(...ps)} bar on ${ps.length}` : 'none'}${descChanged ? ', description updated' : ''}`,
    )
  }
  for (const s of summary) console.log(s)
  if (unparsed.length) {
    console.log(`\n${unparsed.length} rows not decoded (left as they were):`)
    for (const u of unparsed) console.log(`  ${u}`)
  }

  writeFileSync(CATALOGUE, spliceProducts(readFileSync(CATALOGUE, 'utf8'), tubing))
  console.log(`\nPayload rewritten: ${CATALOGUE}`)
  if (!write) {
    console.log('Dry run for the database — add --write to apply.')
    return
  }

  for (const p of tubing) {
    const product = await db.product.findUnique({ where: { slug: p.slug }, select: { id: true } })
    if (!product) {
      console.log(`  skip ${p.slug}: not in the database`)
      continue
    }
    await db.$transaction(
      async (tx) => {
        for (const v of p.variants) {
          await tx.productVariant.updateMany({
            where: { productId: product.id, partNumber: v.partNumber },
            data: {
              pressureBar: v.pressureBar ?? null,
              dimensions: (v.dimensions ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            },
          })
        }
        await tx.product.update({
          where: { id: product.id },
          data: { descriptionShort: p.descriptionShort, descriptionLong: p.descriptionLong },
        })
      },
      { timeout: 60_000, maxWait: 10_000 },
    )
    console.log(`  wrote ${p.slug}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
