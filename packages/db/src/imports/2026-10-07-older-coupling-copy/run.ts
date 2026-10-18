/**
 * Product-specific copy for the 108 coupling listings still written from the
 * May 2026 family template: the 98 Storz, KC, Guillemin, composite, flange,
 * sandblast, crowfoot, ground joint, ring lock, pin lug, shank, hose nipple
 * and mender listings of the Sealfast / Sunpool coupling import, and the 10
 * Sealfast Bauer listings written the same way.
 *
 * The template gave every listing in a family the same lines — "End A:
 * Coupling face — standard", "Threaded / barbed back per variant", a seal and
 * a standard nobody stated ("Industrial KC nipple pattern", "DIN 14301" on
 * every Storz part, a Guillemin "gasket on the female end" on a symmetrical
 * coupling, Bauer "DIN 2501 PN 10" flanges that Sealfast draws as ASA Class
 * 150), a family paragraph with unsourced history, and a short description
 * calling every part "Sealfast / Sunpool". The payload, built by
 * packages/db/data/older-coupling-copy/build.py, holds per listing the ends,
 * seal and standard the supplier supports (or nothing), a one-line summary and
 * Sunpool's own bullets, and per family a rewritten paragraph and service
 * notes.
 *
 * Per listing this rebuilds the description around the lines earlier runners
 * already corrected — size range, material, working pressure — keeping them
 * and the size-table block as they are (Sealfast size lines and the three
 * flanged Bauer pressures come from the payload), rewrites the short and SEO
 * descriptions, updates or deletes the matching FAQ answers and spec rows,
 * and adds the 150 psi spec row Sealfast's flanged Bauer drawings publish.
 *
 * Refuses a listing whose description is neither the template nor this
 * runner's own output, or that is missing a line it keeps. Content only; each
 * product is one transaction; a re-run is a no-op.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-older-coupling-copy/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-older-coupling-copy/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { Prisma } from '@prisma/client'
import { scoreProductContent, wordCount } from '@indus/domain'

import { db } from '../../index'

type Tx = Prisma.TransactionClient

export type Family = { about: string; selection: string; article: [string, string] }
export type Listing = {
  family: string
  what: string
  endA: string | null
  endB: string | null
  seal: string | null
  standard: string | null
  size: string | null
  pressure: string | null
  material?: string | null
  notes: string[]
}
type Payload = {
  families: Record<string, Family>
  howToOrder: string
  listings: Record<string, Listing>
}

const DRY_RUN = process.argv.includes('--dry-run')
const PREVIEW = (
  process.argv.find((a) => a.startsWith('--preview='))?.slice('--preview='.length) ?? ''
)
  .split(',')
  .filter(Boolean)
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const

export const MARK = '<!-- coupling-copy -->'
const TEMPLATE_SIGNATURE = '<h3>Family context</h3>'
const BLOCKS = [
  ['<!-- sunpool-sizes:start -->', '<!-- sunpool-sizes:end -->'],
  ['<!-- sealfast-sizes:start -->', '<!-- sealfast-sizes:end -->'],
] as const
const BRANDS: Record<string, { name: string; country: string }> = {
  sunpool: { name: 'Sunpool', country: 'Taiwan' },
  sealfast: { name: 'Sealfast', country: 'USA' },
}
/** Phrases of the template that must not survive anywhere on a rewritten page. */
export const TEMPLATE_PHRASES = [
  'per variant',
  'Coupling face — standard',
  'Industrial KC nipple pattern',
  'DIN 14301',
  'Perrot',
  'Holedall',
  'EN 13765:2015 (composite hose fitting standard)',
  'B16.21',
  'Sealfast / Sunpool',
  'DIN 2501',
  'Rubber gasket on the female end',
  'Welded or threaded; gasket per service',
]

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const unesc = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

/** The raw (HTML) value of `<li><strong>{label}:</strong> …</li>`, if there is exactly one. */
export function li(html: string, ...labels: string[]): string | null {
  for (const label of labels) {
    const hits = [...html.matchAll(new RegExp(`<li><strong>${label}:</strong>\\s*(.*?)</li>`, 'g'))]
    if (hits.length === 1) return hits[0]![1]!.trim()
  }
  return null
}

/** The marker-delimited size blocks earlier runners appended, verbatim and in order. */
export function sizeBlocks(html: string): string[] {
  const out: Array<[number, string]> = []
  for (const [start, end] of BLOCKS) {
    const a = html.indexOf(start)
    const b = html.indexOf(end)
    if (a >= 0 && b > a) out.push([a, html.slice(a, b + end.length)])
  }
  return out.sort((x, y) => x[0] - y[0]).map(([, block]) => block)
}

export type Current = {
  title: string
  brand: string
  family: string
  type: string
  size: string
  material: string
  pressure: string
  blocks: string[]
}

export function describe(c: Current, l: Listing, f: Family, howToOrder: string): string {
  const b = BRANDS[c.brand]!
  const line = (label: string, raw: string) => `<li><strong>${label}:</strong> ${raw}</li>`
  const config = [
    line('Coupling family', c.family),
    line('Coupling type', c.type),
    ...(l.endA ? [line('End A', esc(l.endA))] : []),
    ...(l.endB ? [line('End B', esc(l.endB))] : []),
  ]
  const specs = [
    line('Size range', l.size ? esc(l.size) : c.size),
    line('Material', l.material ? esc(l.material) : c.material),
    line('Working pressure', l.pressure ? esc(l.pressure) : c.pressure),
    ...(l.seal ? [line('Seal', esc(l.seal))] : []),
    ...(l.standard ? [line('Standard', esc(l.standard))] : []),
  ]
  const parts = [
    MARK,
    `<p>The <strong>${esc(c.title)}</strong> is a ${c.family} from the ${b.name} (${b.country}) industrial coupling range. Indus Hydraulics is an authorised distributor in the UAE.</p>`,
    '<h3>Configuration</h3>',
    `<ul>\n${config.join('\n')}\n</ul>`,
    '<h3>Specifications</h3>',
    `<ul>\n${specs.join('\n')}\n</ul>`,
    ...(l.notes.length
      ? [
          '<h3>Manufacturer notes</h3>',
          `<ul>\n${l.notes.map((n) => `<li>${esc(n)}</li>`).join('\n')}\n</ul>`,
        ]
      : []),
    '<h3>About the family</h3>',
    `<p>${esc(f.about)}</p>`,
    '<h3>Selection and service notes</h3>',
    `<p>${esc(f.selection)}</p>`,
    '<h3>How to order</h3>',
    `<p>${esc(howToOrder)}</p>`,
    `<p>Further reading: <a href="/blog/${f.article[0]}">${esc(f.article[1])}</a>.</p>`,
    ...c.blocks,
  ]
  return parts.join('\n')
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function sizePhrase(size: string): string {
  return /^\d/.test(size) && !/range/.test(size) ? `Sizes ${size}.` : `${cap(size)}.`
}

export function shortDescription(c: Current, l: Listing): string {
  const b = BRANDS[c.brand]!
  const size = l.size ?? unesc(c.size)
  const material = l.material ?? unesc(c.material)
  return `${c.title} — ${l.what}. ${sizePhrase(size)} ${material.replace(/\.$/, '')}. Supplied by ${b.name} (${b.country}); RFQ-only via Indus Hydraulics authorised distribution.`
}

export function seoDescription(c: Current, l: Listing): string {
  const b = BRANDS[c.brand]!
  const size = l.size ?? unesc(c.size)
  const tail = `${b.name} (${b.country}), RFQ via Indus Hydraulics.`
  const options = [
    `${cap(l.what)}. ${sizePhrase(size)} ${tail}`,
    `${cap(l.what)}. ${tail}`,
    `${cap(l.what)}.`,
  ]
  return options.find((o) => o.length <= 160) ?? options.at(-1)!
}

export function endsAnswer(l: Listing): string | null {
  if (!l.endA && !l.endB) return null
  return [l.endA ? `End A: ${l.endA}.` : null, l.endB ? `End B: ${l.endB}.` : null]
    .filter(Boolean)
    .join(' ')
}

const FAQ_SIZE_TAIL =
  '. Specify the exact size on the RFQ — manufacturer offers multiple sizes per part code; lead time depends on size and material.'

async function main(): Promise<void> {
  const payload = JSON.parse(
    readFileSync(join(__dirname, '../../../data/older-coupling-copy/payload.json'), 'utf8')
  ) as Payload
  const skus = Object.keys(payload.listings)
  const fields = await db.specTemplateField.findMany({
    where: { template: { slug: 'industrial-coupling-spec' } },
    select: { id: true, key: true, label: true, group: true, position: true },
  })
  const pressureField = fields.find((f) => f.key === 'working_pressure')
  if (!pressureField) throw new Error('industrial-coupling-spec has no working_pressure field')

  const products = await db.product.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true,
      sku: true,
      status: true,
      title: true,
      descriptionLong: true,
      descriptionShort: true,
      seoDescription: true,
      brand: { select: { slug: true } },
      specs: { select: { id: true, label: true, value: true } },
      faqs: { select: { id: true, question: true, answer: true } },
      ...SCORE_FIELDS,
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))
  const errors: string[] = []

  type Plan = {
    sku: string
    id: string
    product: { descriptionLong?: string; descriptionShort?: string; seoDescription?: string }
    faqUpdates: Array<{ id: string; answer: string }>
    faqDeletes: string[]
    specUpdates: Array<{ id: string; value: string }>
    specDeletes: string[]
    specCreates: Array<{ label: string; value: string }>
  }
  const plans: Plan[] = []

  for (const sku of skus) {
    const p = bySku.get(sku)
    const l = payload.listings[sku]!
    const f = payload.families[l.family]!
    if (!p) {
      errors.push(`${sku}: not found`)
      continue
    }
    if (p.status !== 'active') errors.push(`${sku}: not active`)
    const brand = p.brand?.slug ?? ''
    if (!BRANDS[brand]) {
      errors.push(`${sku}: brand ${brand} is not Sunpool or Sealfast`)
      continue
    }
    const html = p.descriptionLong ?? ''
    if (!html.includes(TEMPLATE_SIGNATURE) && !html.includes(MARK)) {
      errors.push(
        `${sku}: description is neither the family template nor this runner's output — refusing`
      )
      continue
    }
    const c: Current = {
      title: p.title,
      brand,
      family: li(html, 'Coupling family') ?? '',
      type: li(html, 'Coupling type') ?? '',
      size: li(html, 'Size range') ?? '',
      material: li(html, 'Material', 'Materials available') ?? '',
      pressure: li(html, 'Working pressure') ?? '',
      blocks: sizeBlocks(html),
    }
    const lost = (['family', 'type', 'size', 'material', 'pressure'] as const).filter((k) => !c[k])
    if (lost.length) {
      errors.push(`${sku}: no ${lost.join(', ')} line to keep`)
      continue
    }

    const next = {
      descriptionLong: describe(c, l, f, payload.howToOrder),
      descriptionShort: shortDescription(c, l),
      seoDescription: seoDescription(c, l),
    }
    const plan: Plan = {
      sku,
      id: p.id,
      product: {},
      faqUpdates: [],
      faqDeletes: [],
      specUpdates: [],
      specDeletes: [],
      specCreates: [],
    }
    for (const k of ['descriptionLong', 'descriptionShort', 'seoDescription'] as const) {
      if (next[k] !== (p[k] ?? '')) plan.product[k] = next[k]
    }

    // FAQ answers.
    const set = (id: string, current: string, answer: string | null) => {
      if (answer == null) plan.faqDeletes.push(id)
      else if (answer !== current) plan.faqUpdates.push({ id, answer })
    }
    for (const q of p.faqs) {
      if (/^What is an? /.test(q.question) && !/pressure/.test(q.question))
        set(q.id, q.answer, f.about)
      else if (q.question === 'What are the end configurations?') set(q.id, q.answer, endsAnswer(l))
      else if (q.question === 'What sizes are available?' && l.size)
        set(q.id, q.answer, `${l.size}${FAQ_SIZE_TAIL}`)
      else if (q.question === 'What is the working pressure?' && l.pressure)
        set(q.id, q.answer, l.pressure)
      else if (/^What material/.test(q.question) && l.material) set(q.id, q.answer, l.material)
      else if (/^What seal/.test(q.question)) set(q.id, q.answer, l.seal)
      else if (q.question === 'Is this product compliant with industry standards?')
        set(q.id, q.answer, l.standard)
    }

    // Spec rows.
    const spec = (label: string, value: string | null) => {
      const row = p.specs.find((s) => s.label === label)
      if (!row) {
        if (value != null) plan.specCreates.push({ label, value })
        return
      }
      if (value == null) plan.specDeletes.push(row.id)
      else if (value !== row.value) plan.specUpdates.push({ id: row.id, value })
    }
    spec('End A Configuration', l.endA)
    spec('End B Configuration', l.endB)
    spec('Seal / Gasket', l.seal)
    spec('Applicable Standards', l.standard)
    if (l.size) spec('Size Range', l.size)
    if (l.pressure) spec('Working Pressure', l.pressure)
    if (l.material) spec('Materials Available', l.material)
    for (const cr of plan.specCreates) {
      if (cr.label !== 'Working Pressure')
        errors.push(`${sku}: would create an unexpected "${cr.label}" spec row`)
    }

    // Nothing from the template may survive.
    const after = [
      next.descriptionLong,
      next.descriptionShort,
      next.seoDescription,
      ...p.faqs
        .filter((q) => !plan.faqDeletes.includes(q.id))
        .map((q) => plan.faqUpdates.find((u) => u.id === q.id)?.answer ?? q.answer),
      ...p.specs
        .filter((s) => !plan.specDeletes.includes(s.id))
        .map((s) => plan.specUpdates.find((u) => u.id === s.id)?.value ?? s.value),
    ]
    for (const phrase of TEMPLATE_PHRASES) {
      const hit = after.find((t) => t.includes(phrase))
      if (hit) errors.push(`${sku}: "${phrase}" survives (${hit.slice(0, 60)}…)`)
    }

    // A page losing FAQs or spec rows must stay above the index gate unless size rows hold it.
    const projected = score({
      ...p,
      descriptionLong: next.descriptionLong,
      descriptionShort: next.descriptionShort,
      seoDescription: next.seoDescription,
      _count: {
        ...p._count,
        faqs: p._count.faqs - plan.faqDeletes.length,
        specs: p._count.specs - plan.specDeletes.length + plan.specCreates.length,
      },
    })
    if (projected < 30 && p._count.variants === 0)
      errors.push(`${sku}: content score would fall to ${projected}`)

    if (PREVIEW.includes(sku)) {
      log(
        `\n===== ${sku}\n${next.descriptionLong}\nSHORT: ${next.descriptionShort}\nSEO (${next.seoDescription.length}): ${next.seoDescription}`
      )
      for (const u of plan.faqUpdates)
        log(`FAQ ~ ${p.faqs.find((q) => q.id === u.id)!.question} => ${u.answer.slice(0, 160)}`)
      for (const d of plan.faqDeletes) log(`FAQ - ${p.faqs.find((q) => q.id === d)!.question}`)
      for (const u of plan.specUpdates)
        log(`SPEC ~ ${p.specs.find((s) => s.id === u.id)!.label} => ${u.value}`)
      for (const d of plan.specDeletes) log(`SPEC - ${p.specs.find((s) => s.id === d)!.label}`)
      for (const cr of plan.specCreates) log(`SPEC + ${cr.label} => ${cr.value}`)
    }

    plans.push(plan)
  }

  const work = plans.filter(
    (x) =>
      Object.keys(x.product).length ||
      x.faqUpdates.length ||
      x.faqDeletes.length ||
      x.specUpdates.length ||
      x.specDeletes.length ||
      x.specCreates.length
  )
  log(`${DRY_RUN ? '[dry-run] ' : ''}${work.length} of ${skus.length} listings to change`)
  log(
    `  descriptions: ${work.filter((x) => x.product.descriptionLong).length}; short: ${work.filter((x) => x.product.descriptionShort).length}; SEO: ${work.filter((x) => x.product.seoDescription).length}`
  )
  log(
    `  FAQ answers: ${sum(work, (x) => x.faqUpdates.length)} updated, ${sum(work, (x) => x.faqDeletes.length)} deleted; spec rows: ${sum(work, (x) => x.specUpdates.length)} updated, ${sum(work, (x) => x.specDeletes.length)} deleted, ${sum(work, (x) => x.specCreates.length)} created`
  )
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN || !work.length) return
  if (!SNAPSHOT) {
    console.error('--snapshot=<path> is required to write: it is the rollback')
    process.exitCode = 1
    return
  }
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      work.map((x) => {
        const p = bySku.get(x.sku)!
        return {
          sku: x.sku,
          descriptionLong: p.descriptionLong,
          descriptionShort: p.descriptionShort,
          seoDescription: p.seoDescription,
          faqs: p.faqs.filter(
            (q) => x.faqDeletes.includes(q.id) || x.faqUpdates.some((u) => u.id === q.id)
          ),
          specs: p.specs.filter(
            (s) => x.specDeletes.includes(s.id) || x.specUpdates.some((u) => u.id === s.id)
          ),
        }
      }),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  for (const x of work) {
    await db.$transaction(async (tx: Tx) => {
      if (Object.keys(x.product).length)
        await tx.product.update({ where: { id: x.id }, data: x.product })
      for (const u of x.faqUpdates)
        await tx.productFaq.update({ where: { id: u.id }, data: { answer: u.answer } })
      if (x.faqDeletes.length)
        await tx.productFaq.deleteMany({ where: { id: { in: x.faqDeletes } } })
      for (const u of x.specUpdates)
        await tx.productSpec.update({ where: { id: u.id }, data: { value: u.value } })
      if (x.specDeletes.length)
        await tx.productSpec.deleteMany({ where: { id: { in: x.specDeletes } } })
      for (const cr of x.specCreates) {
        await tx.productSpec.create({
          data: {
            productId: x.id,
            group: pressureField.group ?? 'Performance',
            label: pressureField.label,
            value: cr.value,
            position: pressureField.position,
            templateFieldId: pressureField.id,
            isFilterable: true,
          },
        })
      }
    }, TX)
  }
  log(`written: ${work.length} listings`)
  await rescore(work.map((x) => x.id))
}

function sum<T>(xs: T[], f: (x: T) => number): number {
  return xs.reduce((a, x) => a + f(x), 0)
}

function log(line: string): void {
  console.log(line)
}

const SCORE_FIELDS = {
  contentScore: true,
  brandId: true,
  categoryId: true,
  focusKeyword: true,
  seoTitle: true,
  weightKg: true,
  countryOfOrigin: true,
  mpn: true,
  _count: {
    select: {
      faqs: true,
      specs: true,
      crossReferences: true,
      documents: true,
      images: true,
      variants: true,
    },
  },
} as const

type Scored = {
  descriptionShort: string | null
  descriptionLong: string | null
  brandId: string | null
  categoryId: string | null
  focusKeyword: string | null
  seoTitle: string | null
  seoDescription: string | null
  weightKg: unknown
  countryOfOrigin: string | null
  mpn: string | null
  _count: {
    faqs: number
    specs: number
    crossReferences: number
    documents: number
    images: number
  }
}

function score(p: Scored): number {
  return scoreProductContent({
    descriptionShortWords: wordCount(p.descriptionShort),
    descriptionLongWords: wordCount(p.descriptionLong),
    faqCount: p._count.faqs,
    specCount: p._count.specs,
    crossReferenceCount: p._count.crossReferences,
    documentCount: p._count.documents,
    imageCount: p._count.images,
    hasBrand: p.brandId != null,
    hasCategory: p.categoryId != null,
    hasFocusKeyword: !!p.focusKeyword?.trim(),
    hasSeoTitleAndDescription: !!p.seoTitle?.trim() && !!p.seoDescription?.trim(),
    hasCommerceAttributes: p.weightKg != null && !!p.countryOfOrigin?.trim() && !!p.mpn?.trim(),
  }).score
}

/** Descriptions, FAQs and spec rows changed; keep contentScore in step. */
async function rescore(ids: string[]): Promise<void> {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      descriptionShort: true,
      descriptionLong: true,
      seoDescription: true,
      ...SCORE_FIELDS,
    },
  })
  let changed = 0
  for (const p of products) {
    const s = score(p)
    if (s === p.contentScore) continue
    changed++
    await db.product.update({ where: { id: p.id }, data: { contentScore: s } })
  }
  log(`content scores recomputed: ${changed} changed`)
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
