/**
 * Recompute the size ranges on the single- and double-ferrule tube fitting
 * listings from their own size tables.
 *
 * The importer took "smallest" and "largest" as the first and last variant in
 * part-number order, and part numbers sort as text: IH-TF-RU-10-6-SF (5/8")
 * comes before IH-TF-RU-2-1-SF (1/8"), and IH-TF-RU-8-6-SF (1/2") comes last.
 * So 41 single-ferrule listings said "5/8" to 1/2" tube" or "3/4" to 1/2"
 * tube", the per-end lines said things like "End 2: 3/8" tube to 3/8" tube" on a
 * 20-size reducing union, the metric connector said "2 to 38 tube" with no
 * unit, and one double-ferrule listing said "1-1/2" to 3/8"". The size tables
 * themselves showed the same text order to buyers: 5/8", 3/4", 1", 1/8", …
 *
 * This script reads each listing's variants, works out the true range on each
 * end by size, rewrites every place that states it (short description, SEO
 * description, the Sizes section of the long description, the "Size Range"
 * spec row and the sizes FAQ answer) and renumbers
 * `position` so the size table reads smallest to largest. Nothing else changes.
 *
 * Idempotent: every value is recomputed from the variants, so a second run
 * finds nothing to change.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-ferrule-size-ranges.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const CATEGORIES = ['single-ferrule-tube-fittings', 'double-ferrule-tube-fittings']
/**
 * Adapter shelves where a catalogue-wide audit found the same fault on a
 * handful of listings. Their ends are threads, not tube: the headline range
 * is the first end's, written without the word "tube".
 */
const ADAPTER_CATEGORIES = ['stainless-steel-jic-adapters', 'stainless-steel-orb-adapters', 'stainless-steel-npt-pipe-adapters']
const PORTS = ['portLabel', 'port2Label', 'port3Label'] as const

/** Leading size of a label in inches: `1-1/2" tube` → 1.5, `12 mm tube` → 12/25.4. */
function sizeOf(label: string): number {
  const mm = label.match(/^(\d+(?:\.\d+)?)\s*mm\b/)
  if (mm) return Number(mm[1]) / 25.4
  const inch = label.match(/^(?:(\d+)-)?(\d+)(?:\/(\d+))?"/)
  if (!inch) return Number.POSITIVE_INFINITY
  const whole = inch[1] ? Number(inch[1]) : 0
  const frac = inch[3] ? Number(inch[2]) / Number(inch[3]) : Number(inch[2])
  return whole + frac
}

/** `1/2" tube (smooth)` → `1/2"`; `12 mm tube` → `12 mm`. */
function sizeText(label: string): string {
  const m = label.match(/^(\d+(?:\.\d+)?\s*mm|(?:\d+-)?\d+(?:\/\d+)?")/)
  return m ? m[1] : label
}

const isTube = (label: string) => /\btube\b/.test(label)

function range(labels: string[]): { lo: string; hi: string } | null {
  if (labels.length === 0) return null
  const sorted = [...labels].sort((a, b) => sizeOf(a) - sizeOf(b))
  return { lo: sorted[0], hi: sorted[sorted.length - 1] }
}

function rangeText(labels: string[]): string | null {
  const r = range(labels.filter((l) => Number.isFinite(sizeOf(l))))
  if (!r) return null
  const lo = sizeText(r.lo)
  const hi = sizeText(r.hi)
  return lo === hi ? lo : `${lo} to ${hi}`
}

/** Overall tube-end range across every end, e.g. `1/16" to 1"` or `2 mm to 38 mm`. */
function tubeRange(labels: string[]): string | null {
  const r = range(labels.filter(isTube))
  if (!r) return null
  const lo = sizeText(r.lo)
  const hi = sizeText(r.hi)
  return lo === hi ? lo : `${lo} to ${hi}`
}

const esc = (s: string) => s.replace(/"/g, '&quot;')

/** `17 part numbers, 1/4" to 2"` — the count, then one or two inch sizes. */
const SIZE_SPAN = (noun: string, q: string) => new RegExp(`(\\d+ ${noun}, )[\\d/-]+${q}(?: to [\\d/-]+${q})?`)

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const products = await db.product.findMany({
    where: { category: { slug: { in: [...CATEGORIES, ...ADAPTER_CATEGORIES] } } },
    select: {
      category: { select: { slug: true } },
      id: true,
      sku: true,
      slug: true,
      descriptionShort: true,
      descriptionLong: true,
      seoDescription: true,
      variants: { select: { id: true, position: true, portLabel: true, port2Label: true, port3Label: true } },
      specs: { where: { label: 'Size Range' }, select: { id: true, value: true } },
      faqs: { select: { id: true, answer: true } },
    },
  })

  let textChanged = 0
  let reordered = 0
  const slugs: string[] = []

  for (const p of products) {
    if (p.variants.length === 0) continue
    const all = p.variants.flatMap((v) => PORTS.map((k) => v[k]).filter((x): x is string => !!x))
    const adapter = ADAPTER_CATEGORIES.includes(p.category?.slug ?? '')
    // On an adapter the headline range is the first end's (`21 part numbers,
    // 1/4" to 2"` on a JIC × NPT elbow is the JIC end), so compare with that.
    const overall = adapter ? rangeText(p.variants.map((v) => v.portLabel).filter((x): x is string => !!x)) : tubeRange(all)
    if (!overall) continue
    const unit = adapter ? '' : ' tube'

    let short = p.descriptionShort ?? ''
    let seo = p.seoDescription ?? ''
    let long = p.descriptionLong ?? ''

    if (adapter) {
      // Match the size tokens only (`1/8"`, `2-1/2"`), never the prose after them.
      short = short.replace(SIZE_SPAN('part numbers', '"'), `$1${overall}`)
      seo = seo.replace(SIZE_SPAN('sizes', '"'), `$1${overall}`)
      long = long.replace(SIZE_SPAN('part numbers', '&quot;'), `$1${esc(overall)}`)
    } else {
      short = short.replace(/(\d+ part numbers, ).*? tube(?=;|\.)/, `$1${overall} tube`)
      seo = seo.replace(/(\d+ sizes, ).*? tube(?=,|\.)/, `$1${overall} tube`)
      long = long.replace(/(<p>\d+ part numbers, ).*? tube\./, `$1${esc(overall)} tube.`)
    }

    // Only inside the Sizes section: the Construction list above it also has
    // "End 1: tube end (nut and ferrule)" lines, which must not be touched.
    const start = long.indexOf('<h3>Sizes</h3>')
    if (start >= 0) {
      const next = long.indexOf('<h3>', start + 1)
      const end = next >= 0 ? next : long.length
      let sizes = long.slice(start, end)
      PORTS.forEach((k, i) => {
        const r = range(p.variants.map((v) => v[k]).filter((x): x is string => !!x))
        if (!r) return
        const text = r.lo === r.hi ? r.lo : `${r.lo} to ${r.hi}`
        sizes = sizes.replace(new RegExp(`(<li>End ${i + 1}: )[^<]*(</li>)`), `$1${esc(text)}$2`)
      })
      long = long.slice(0, start) + sizes + long.slice(end)
    }

    // The same range is repeated in the "Size Range" spec row and in the
    // "What sizes are available?" FAQ answer.
    const specWrites = p.specs
      .filter((sp) => !adapter || sp.value.includes(' to '))
      .map((sp) => ({ id: sp.id, from: sp.value, to: `${overall}${unit}` }))
      .filter((w) => w.from !== w.to)
    const faqWrites = p.faqs
      .map((f) => ({ id: f.id, from: f.answer, to: adapter ? f.answer.replace(SIZE_SPAN('part numbers', '"'), `$1${overall}`) : f.answer.replace(/(\d+ part numbers, ).*? tube\./, `$1${overall} tube.`) }))
      .filter((w) => w.from !== w.to)

    const changed = specWrites.length > 0 || faqWrites.length > 0 || short !== (p.descriptionShort ?? '') || seo !== (p.seoDescription ?? '') || long !== (p.descriptionLong ?? '')

    const order = [...p.variants].sort((a, b) => {
      for (const k of PORTS) {
        const d = sizeOf(a[k] ?? '') - sizeOf(b[k] ?? '')
        if (d !== 0 && Number.isFinite(d)) return d
      }
      return 0
    })
    const moves = order.map((v, i) => ({ id: v.id, from: v.position, to: i })).filter((m) => m.from !== m.to)

    if (!changed && moves.length === 0) continue
    if (changed) textChanged++
    if (moves.length) reordered++
    slugs.push(p.slug)
    console.log(`${p.sku}: ${changed ? `range -> ${overall}` : 'text ok'}${moves.length ? `, ${moves.length} rows re-sorted` : ''}`)

    if (process.argv.includes('--verbose') && changed) {
      const show = (a: string, b: string) => { if (a !== b) console.log(`   - ${a.match(/\d+ (?:part numbers|sizes), [^.;]*|<li>End[^<]*/g)?.join(' | ')}\n   + ${b.match(/\d+ (?:part numbers|sizes), [^.;]*|<li>End[^<]*/g)?.join(' | ')}`) }
      for (const w of [...specWrites, ...faqWrites]) console.log(`   - ${w.from.slice(0, 80)}\n   + ${w.to.slice(0, 80)}`)
      show(p.descriptionShort ?? '', short); show(p.seoDescription ?? '', seo); show(p.descriptionLong ?? '', long)
    }
    if (dryRun) continue
    await db.$transaction([
      ...(changed
        ? [db.product.update({ where: { id: p.id }, data: { descriptionShort: short, seoDescription: seo, descriptionLong: long } })]
        : []),
      ...specWrites.map((w) => db.productSpec.update({ where: { id: w.id }, data: { value: w.to } })),
      ...faqWrites.map((w) => db.productFaq.update({ where: { id: w.id }, data: { answer: w.to } })),
      ...moves.map((m) => db.productVariant.update({ where: { id: m.id }, data: { position: m.to } })),
    ])
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}${textChanged} listings re-stated, ${reordered} size tables re-sorted`)
  console.log(`slugs: ${slugs.join(' ')}`)
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
