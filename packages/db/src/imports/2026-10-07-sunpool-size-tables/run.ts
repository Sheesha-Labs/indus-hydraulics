/**
 * Size tables for the Sunpool listings, from Sunpool's own catalogue pages and
 * the three part-number lists those pages link (Storz, KC, universal air
 * couplings). Before this none of the 120 Sunpool listings had one.
 *
 * The payload is built by packages/db/data/sunpool-size-tables/build.py,
 * which documents its sources and every value it refuses. Per listing:
 *   - a size-table row for each size Sunpool names, Indus part number
 *     `<SKU>-<size code>`; Storz adapters and fire department connections get
 *     one row per Storz-end and other-end combination;
 *   - a "Sunpool sizes" block appended to the description — lug distances,
 *     ferrule and nipple dimensions, clamping ranges and Sunpool part numbers
 *     where Sunpool publishes them — between `sunpool-sizes` markers so a
 *     re-run replaces it;
 *   - on the older listings, the generic "Size range" line (and the FAQ that
 *     repeats it) replaced by what Sunpool states for the product, and the
 *     family paragraph's wrong size span removed;
 *   - on those same listings, the description's "Material" and "Working
 *     pressure" lines (and their FAQs) set to the listing's own spec rows,
 *     which carry Sunpool's values, wherever the two disagree. A line Sunpool
 *     says nothing about is left alone.
 *
 * Refuses a product that already has size rows it did not write, a "Size
 * range" line or spec that is not the value it expects to replace, and an
 * unmarked Sunpool block. Rows are matched by part number. Each product is one
 * transaction. Content only — product pages pick it up as their cache expires
 * (about an hour).
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-sunpool-size-tables/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-sunpool-size-tables/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { Prisma } from '@prisma/client'
import { scoreProductContent, wordCount } from '@indus/domain'

import { db } from '../../index'

type Tx = Prisma.TransactionClient

type PayloadVariant = {
  partNumber: string
  position: number
  hoseInch: string | null
  portLabel: string | null
  port2Label: string | null
}
type PayloadListing = {
  variants: PayloadVariant[]
  tableHtml: string | null
  sizeRange: string | null
  edits: Array<{ find: string; replace: string }>
  specs: Array<{ label: string; from: string; to: string }>
  alignToSpecs: boolean
  source: string
}

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const
const START = '<!-- sunpool-sizes:start -->'
const END = '<!-- sunpool-sizes:end -->'
const SIZE_FAQ = 'What sizes are available?'
const FAQ_TAIL = '. Specify the exact size on the RFQ'
/** Description lines that must not contradict the spec row holding Sunpool's value. */
const ALIGN = [
  { line: 'Material', spec: 'Materials Available', faq: 'What material is the body?' },
  { line: 'Working pressure', spec: 'Working Pressure', faq: 'What is the working pressure?' },
] as const

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeHtml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

/** A spec value as a description line: the importer's ':;' joins tidied, a repeated label dropped. */
export function specText(label: string, value: string): string {
  const v = value.replace(/:;\s*/g, ': ').trim()
  return label === 'Working Pressure'
    ? v.replace(/^Working Pressure:\s*/i, '').replace(/\.$/, '')
    : v
}

export function withTable(html: string | null, table: string): string {
  const base = html ?? ''
  const a = base.indexOf(START)
  const b = base.indexOf(END)
  if (a >= 0 && b > a) return base.slice(0, a) + table + base.slice(b + END.length)
  return `${base.trimEnd()}\n${table}`
}

/** Every exact `find` replaced; returns the text and how many it replaced. */
export function applyEdits(
  text: string,
  edits: PayloadListing['edits']
): { text: string; hits: number } {
  let hits = 0
  let out = text
  for (const e of edits) {
    const parts = out.split(e.find)
    hits += parts.length - 1
    out = parts.join(e.replace)
  }
  return { text: out, hits }
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^$|()[\]{}\\/]/g, '\\$&')

/** The description's one `<li><strong>{label}:</strong> …</li>` line, set to `value` (HTML). Null when there is not exactly one. */
export function setLine(
  source: string,
  label: string,
  value: string
): { html: string; was: string } | null {
  const re = new RegExp(`<li><strong>${escapeRegExp(label)}:</strong>\\s*(.*?)</li>`, 'g')
  const lines = [...source.matchAll(re)]
  if (lines.length !== 1) return null
  const line = `<li><strong>${label}:</strong> ${value}</li>`
  return { html: source.replace(lines[0]![0], () => line), was: lines[0]![1]! }
}

/** The description's one "Size range" line, set to `range`. Null when there is not exactly one. */
export function setSizeLine(html: string, range: string): { html: string; was: string } | null {
  return setLine(html, 'Size range', range)
}

/** The "What sizes are available?" answer leads with the range; swap that lead. */
export function setFaqLead(answer: string, range: string): { answer: string; was: string } | null {
  const i = answer.indexOf(FAQ_TAIL)
  if (i < 0) return null
  return { answer: range + answer.slice(i), was: answer.slice(0, i) }
}

/** jsonb stores object keys in its own order; compare values, not text. */
const sameVariant = (
  a: PayloadVariant,
  b: {
    position: number
    hoseInch: string | null
    portLabel: string | null
    port2Label: string | null
    dimensions: unknown
  }
) =>
  a.position === b.position &&
  a.hoseInch === b.hoseInch &&
  a.portLabel === b.portLabel &&
  a.port2Label === b.port2Label &&
  b.dimensions == null

async function main(): Promise<void> {
  const payload = JSON.parse(
    readFileSync(join(__dirname, '../../../data/sunpool-size-tables/payload.json'), 'utf8')
  ) as Record<string, PayloadListing>
  const skus = Object.keys(payload)
  const errors: string[] = []

  const products = await db.product.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true,
      sku: true,
      status: true,
      brand: { select: { slug: true } },
      descriptionLong: true,
      variants: {
        select: {
          id: true,
          partNumber: true,
          position: true,
          hoseInch: true,
          portLabel: true,
          port2Label: true,
          dimensions: true,
        },
      },
      faqs: { select: { id: true, question: true, answer: true } },
      specs: { select: { id: true, label: true, value: true } },
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))
  for (const sku of skus) {
    const p = bySku.get(sku)
    if (!p) errors.push(`${sku}: not found`)
    else if (p.status !== 'active') errors.push(`${sku}: not active`)
    else if (p.brand?.slug !== 'sunpool') errors.push(`${sku}: not a Sunpool listing`)
  }

  // No other product may already hold one of these part numbers.
  const planned = skus.flatMap((sku) => payload[sku]!.variants.map((v) => v.partNumber))
  if (new Set(planned).size !== planned.length) errors.push('duplicate part numbers in the payload')
  const clash = await db.productVariant.findMany({
    where: { partNumber: { in: planned } },
    select: { partNumber: true, product: { select: { sku: true } } },
  })
  for (const c of clash) {
    if (!c.partNumber.startsWith(`${c.product.sku}-`))
      errors.push(`${c.partNumber} already belongs to ${c.product.sku}`)
  }

  type Plan = {
    sku: string
    id: string
    create: PayloadVariant[]
    update: Array<PayloadVariant & { id: string }>
    remove: string[]
    descriptionLong: string | null
    faqs: Array<{ id: string; answer: string }>
    specs: Array<{ id: string; value: string }>
    notes: string[]
  }
  const plans: Plan[] = []
  for (const sku of skus) {
    const p = bySku.get(sku)
    if (!p) continue
    const want = payload[sku]!
    const notes: string[] = []

    const foreign = p.variants.filter((v) => !v.partNumber.startsWith(`${sku}-`))
    if (foreign.length) {
      errors.push(
        `${sku}: has ${foreign.length} size row(s) this runner did not write (${foreign[0]!.partNumber}) — refusing`
      )
      continue
    }
    const have = new Map(p.variants.map((v) => [v.partNumber, v]))
    const create = want.variants.filter((v) => !have.has(v.partNumber))
    const update = want.variants
      .filter((v) => have.has(v.partNumber) && !sameVariant(v, have.get(v.partNumber)!))
      .map((v) => ({ ...v, id: have.get(v.partNumber)!.id }))
    const keep = new Set(want.variants.map((v) => v.partNumber))
    const remove = p.variants.filter((v) => !keep.has(v.partNumber)).map((v) => v.id)

    // Description: family-paragraph edits, the size line, then the Sunpool block.
    let html = p.descriptionLong ?? ''
    if (/<h3>Sunpool sizes<\/h3>/.test(html) && !html.includes(START)) {
      errors.push(`${sku}: description already has an unmarked Sunpool block`)
    }
    const edited = applyEdits(html, want.edits)
    html = edited.text
    if (edited.hits) notes.push(`${edited.hits} family-paragraph edit(s)`)
    let oldRange: string | null = null
    if (want.sizeRange) {
      const set = setSizeLine(html, want.sizeRange)
      if (!set) errors.push(`${sku}: expected exactly one "Size range" line in the description`)
      else {
        oldRange = set.was
        if (set.was !== want.sizeRange) notes.push(`size range "${set.was}" → "${want.sizeRange}"`)
        html = set.html
      }
    }
    // Material / pressure lines that contradict the listing's own spec rows.
    const faqTo = new Map<string, { from: string; to: string }>()
    if (want.alignToSpecs) {
      for (const a of ALIGN) {
        const spec = p.specs.find((x) => x.label === a.spec)
        if (!spec) continue
        const to = specText(a.spec, spec.value)
        // Sunpool's reducing Guillemin page prints its size list in the Material row,
        // and the spec row copied it. Sizes are not a material.
        if (a.line === 'Material' && /\d"/.test(to)) {
          notes.push(`"${a.spec}" spec holds sizes, not a material — line left`)
          continue
        }
        const set = setLine(html, a.line, escapeHtml(to))
        if (!set) continue
        const was = unescapeHtml(set.was)
        if (was === to) continue
        html = set.html
        faqTo.set(a.faq, { from: was, to })
        notes.push(`${a.line.toLowerCase()} "${was}" → "${to}"`)
      }
    }
    if (want.tableHtml) html = withTable(html, want.tableHtml)

    // FAQs: the same edits, the size answer's lead, and the aligned answers.
    const faqs: Plan['faqs'] = []
    for (const f of p.faqs) {
      let answer = applyEdits(f.answer, want.edits).text
      const align = faqTo.get(f.question)
      if (align) {
        if (answer === align.from) answer = align.to
        else if (answer !== align.to)
          errors.push(
            `${sku}: FAQ "${f.question}" says "${answer}", not "${align.from}" — refusing to overwrite`
          )
      }
      if (want.sizeRange && f.question === SIZE_FAQ) {
        const set = setFaqLead(answer, want.sizeRange)
        if (!set) errors.push(`${sku}: size FAQ does not lead with a range`)
        else if (set.was !== want.sizeRange && set.was !== oldRange) {
          errors.push(
            `${sku}: size FAQ says "${set.was}", not the description's "${oldRange}" — refusing to overwrite`
          )
        } else answer = set.answer
      }
      if (answer !== f.answer) faqs.push({ id: f.id, answer })
    }
    if (faqs.length) notes.push(`${faqs.length} FAQ answer(s)`)

    const specs: Plan['specs'] = []
    for (const s of want.specs) {
      const row = p.specs.find((x) => x.label === s.label)
      if (!row) errors.push(`${sku}: no "${s.label}" spec`)
      else if (row.value === s.to) continue
      else if (row.value !== s.from)
        errors.push(`${sku}: "${s.label}" is "${row.value}", expected "${s.from}"`)
      else specs.push({ id: row.id, value: s.to })
    }
    if (specs.length) notes.push(`${specs.length} spec(s)`)

    plans.push({
      sku,
      id: p.id,
      create,
      update,
      remove,
      descriptionLong: html === (p.descriptionLong ?? '') ? null : html,
      faqs,
      specs,
      notes,
    })
  }

  const work = plans.filter(
    (x) =>
      x.create.length ||
      x.update.length ||
      x.remove.length ||
      x.descriptionLong ||
      x.faqs.length ||
      x.specs.length
  )
  log(`${DRY_RUN ? '[dry-run] ' : ''}${work.length} of ${skus.length} listings to change`)
  log(
    `  size rows: +${sum(work, (x) => x.create.length)} created, ${sum(work, (x) => x.update.length)} updated, ${sum(work, (x) => x.remove.length)} removed`
  )
  log(
    `  descriptions: ${work.filter((x) => x.descriptionLong).length}; FAQ answers: ${sum(work, (x) => x.faqs.length)}; specs: ${sum(work, (x) => x.specs.length)}`
  )
  for (const x of work) {
    log(
      `  ${x.sku}: +${x.create.length}/~${x.update.length}/-${x.remove.length}${x.descriptionLong ? ', description' : ''}${x.notes.length ? ` (${x.notes.join('; ')})` : ''}`
    )
  }

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN) return
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
          variants: p.variants,
          faqs: p.faqs.filter((f) => x.faqs.some((g) => g.id === f.id)),
          specs: p.specs.filter((s) => x.specs.some((t) => t.id === s.id)),
        }
      }),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  for (const x of work) {
    await db.$transaction(async (tx: Tx) => {
      if (x.remove.length) await tx.productVariant.deleteMany({ where: { id: { in: x.remove } } })
      for (const v of x.update) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            position: v.position,
            hoseInch: v.hoseInch,
            portLabel: v.portLabel,
            port2Label: v.port2Label,
            dimensions: Prisma.DbNull,
          },
        })
      }
      if (x.create.length) {
        await tx.productVariant.createMany({
          data: x.create.map((v) => ({
            productId: x.id,
            partNumber: v.partNumber,
            position: v.position,
            hoseInch: v.hoseInch,
            portLabel: v.portLabel,
            port2Label: v.port2Label,
          })),
        })
      }
      if (x.descriptionLong)
        await tx.product.update({
          where: { id: x.id },
          data: { descriptionLong: x.descriptionLong },
        })
      for (const f of x.faqs)
        await tx.productFaq.update({ where: { id: f.id }, data: { answer: f.answer } })
      for (const s of x.specs)
        await tx.productSpec.update({ where: { id: s.id }, data: { value: s.value } })
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

/** The description changed length; keep contentScore in step with it. */
async function rescore(ids: string[]): Promise<void> {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      contentScore: true,
      descriptionShort: true,
      descriptionLong: true,
      brandId: true,
      categoryId: true,
      focusKeyword: true,
      seoTitle: true,
      seoDescription: true,
      weightKg: true,
      countryOfOrigin: true,
      mpn: true,
      _count: {
        select: { faqs: true, specs: true, crossReferences: true, documents: true, images: true },
      },
    },
  })
  let changed = 0
  for (const p of products) {
    const score = scoreProductContent({
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
    if (score === p.contentScore) continue
    changed++
    await db.product.update({ where: { id: p.id }, data: { contentScore: score } })
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
