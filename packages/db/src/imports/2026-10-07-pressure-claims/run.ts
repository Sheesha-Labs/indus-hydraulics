/**
 * Working pressures nobody published.
 *
 * The 2026-05-07 coupling import, and the Bauer listings before it, gave every
 * listing in a family the same "Working pressure" line — "Up to 16 bar (232
 * psi) — typical fire-service Storz rating", "Up to 600 psi (frac water)" —
 * written from a family template, not from Sunpool or Sealfast. Sunpool rates
 * even its heavy-duty KC nipple at 300 psi; Sealfast rates the aluminium
 * crowfoot sandblast end at 110 psi, against a template "up to 300 psi". The
 * line sat in three places on each page: the description's spec list, the
 * spec table and the "What is the working pressure?" FAQ.
 *
 * Per listing carrying a template line:
 *   - where the listing's own spec row holds the manufacturer's figure
 *     (Sealfast's 150 psi crowfoot ends, 110 psi sandblast end), the
 *     description line and the FAQ are set to it;
 *   - B16.5 flanges get the standard's ambient ratings for carbon steel and
 *     for stainless, instead of the carbon-steel figure alone;
 *   - every other listing says the rating is not published and that we check
 *     it with the manufacturer, and the template spec row is deleted.
 * The family paragraphs' "up to 300 psi" (sandblast) and "up to 600 psi"
 * (ground joint) go too, in the description and in the FAQ that repeats it.
 *
 * Refuses to write if a template line would survive anywhere, if a FAQ answer
 * says something other than the line it repeats, or if a family edit misses on
 * a first run. Content only; each product is one transaction.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-pressure-claims/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-pressure-claims/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'
import { scoreProductContent, wordCount } from '@indus/domain'

import { db } from '../../index'

type Tx = Prisma.TransactionClient

const DRY_RUN = process.argv.includes('--dry-run')
const RERUN = process.argv.includes('--rerun')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const

/** The template lines, exactly as the importers wrote them. */
export const TEMPLATE_LINES: readonly string[] = [
  'Up to 16 bar (232 psi) — typical fire-service Storz rating',
  'Up to 16 bar (232 psi) — typical Bauer water-transfer service rating',
  'Up to 16 bar (232 psi) — typical ring-lock water-transfer service',
  'Up to 16 bar (232 psi)',
  'Up to 600 psi (frac water); 250 psi (suction service)',
  'Up to 600 psi (steam) / 1000 psi (cold-service air-water)',
  'Up to 300 psi (sandblast service); refer to host hose rating',
  'Up to 14 bar (per host composite-hose rating, EN 13765:2015 Type 3)',
  'Up to 250 psi (typical crowfoot air / water service)',
  'Up to 250 psi (typical hose-nipple service)',
  'Up to 250 psi (NPT × hose barb service)',
  'Up to 150 psi (typical garden hose / water service)',
  'Up to 150 psi (typical garden / industrial hose mender service)',
  'ANSI Class 150 (285 psi WP) or Class 300 (740 psi WP) per ASME B16.5 ratings',
]

/** Flanges made to ASME B16.5, which rates them by class, material group and temperature. */
export const B16_5_FLANGES: ReadonlySet<string> = new Set([
  'IH-FLG-WELDING-NECK-FLANGE',
  'IH-FLG-SLIP-ON-FLANGE',
  'IH-FLG-SOCKET-WELD-FLANGE',
  'IH-FLG-LAP-JOINT-FLANGE',
  'IH-FLG-THREADED-FLANGE',
  'IH-FLG-FLAT-FLANGE',
  'IH-FLG-BLIND-FLANGE',
])
export const B16_5_TEXT =
  'ASME B16.5 at ambient temperature: Class 150 is 285 psi in A105 carbon steel and 275 psi in 304 or 316 stainless; Class 300 is 740 psi and 720 psi. The rating falls as temperature rises.'

/** Family-paragraph sentences that state the same unsourced figures. */
export const FAMILY_EDITS: ReadonlyArray<{ find: string; replace: string }> = [
  {
    find: 'shops. Pressure-rated for typical sandblast service (up to 300 psi).',
    replace: 'shops.',
  },
  {
    find: 'for high-pressure steam and air service up to 600 psi.',
    replace: 'for steam and air service.',
  },
]

const LINE_LABEL = 'Working pressure'
const SPEC_LABEL = 'Working Pressure'
const FAQ_QUESTION = 'What is the working pressure?'

export const notPublishedLine = (brand: string) =>
  `Not published by ${brand}. Give us your working pressure and medium and we will check it with the manufacturer.`
export const notPublishedFaq = (brand: string) =>
  `${brand} does not publish a working pressure for this part. Give us your working pressure and medium when you enquire and we will check it with the manufacturer before you order.`

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeHtml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

const LINE = /<li><strong>Working pressure:<\/strong>\s*(.*?)<\/li>/g

/** The description's one working-pressure line: its text, and the HTML with it replaced. */
export function workingPressureLine(
  html: string
): { text: string; set: (v: string) => string } | null {
  const hits = [...html.matchAll(LINE)]
  if (hits.length !== 1) return null
  const [whole, inner] = [hits[0]![0], hits[0]![1]!]
  return {
    text: unescapeHtml(inner),
    set: (v: string) =>
      html.replace(whole, () => `<li><strong>${LINE_LABEL}:</strong> ${escapeHtml(v)}</li>`),
  }
}

/** A spec value as a line: the importer's ':;' joins tidied, a repeated label dropped. */
export function specText(value: string): string {
  return value
    .replace(/:;\s*/g, ': ')
    .replace(/^Working Pressure:\s*/i, '')
    .replace(/\.$/, '')
    .trim()
}

export type Decision =
  | { kind: 'sourced'; text: string }
  | { kind: 'b16.5'; text: string }
  | { kind: 'not-published'; line: string; faq: string }

/** What a listing carrying a template line should say instead. */
export function decide(sku: string, brand: string, spec: string | null): Decision {
  if (spec != null && !TEMPLATE_LINES.includes(spec))
    return { kind: 'sourced', text: specText(spec) }
  if (B16_5_FLANGES.has(sku)) return { kind: 'b16.5', text: B16_5_TEXT }
  return { kind: 'not-published', line: notPublishedLine(brand), faq: notPublishedFaq(brand) }
}

export function applyFamilyEdits(text: string): { text: string; hits: number } {
  let hits = 0
  let out = text
  for (const e of FAMILY_EDITS) {
    const parts = out.split(e.find)
    hits += parts.length - 1
    out = parts.join(e.replace)
  }
  return { text: out, hits }
}

async function main(): Promise<void> {
  const products = await db.product.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      sku: true,
      brand: { select: { name: true } },
      descriptionLong: true,
      specs: { select: { id: true, label: true, value: true } },
      faqs: { select: { id: true, question: true, answer: true } },
      ...SCORE_FIELDS,
    },
  })

  const errors: string[] = []
  type Plan = {
    id: string
    sku: string
    kind: Decision['kind'] | 'family-only'
    descriptionLong: string | null
    faqs: Array<{ id: string; answer: string }>
    specUpdate: { id: string; value: string } | null
    specDelete: string | null
  }
  const plans: Plan[] = []
  let familyHits = 0

  for (const p of products) {
    const html = p.descriptionLong ?? ''
    const line = workingPressureLine(html)
    const spec = p.specs.find((s) => s.label === SPEC_LABEL) ?? null
    const faq = p.faqs.find((f) => f.question === FAQ_QUESTION) ?? null
    const carries =
      (line && TEMPLATE_LINES.includes(line.text)) ||
      (spec && TEMPLATE_LINES.includes(spec.value)) ||
      (faq && TEMPLATE_LINES.includes(faq.answer))
    const family = applyFamilyEdits(html)
    const familyFaqs = p.faqs.map((f) => ({ ...f, edited: applyFamilyEdits(f.answer) }))
    const familyCount = family.hits + familyFaqs.reduce((a, f) => a + f.edited.hits, 0)
    if (!carries && !familyCount) continue
    familyHits += familyCount

    let next = family.text
    const faqs = new Map<string, string>()
    for (const f of familyFaqs) if (f.edited.hits) faqs.set(f.id, f.edited.text)
    let specUpdate: Plan['specUpdate'] = null
    let specDelete: string | null = null
    let kind: Plan['kind'] = 'family-only'

    if (carries) {
      const brand = p.brand?.name ?? 'the manufacturer'
      const d = decide(p.sku, brand, spec?.value ?? null)
      kind = d.kind
      const lineText = d.kind === 'not-published' ? d.line : d.text
      const faqText = d.kind === 'not-published' ? d.faq : d.text
      const nextLine = workingPressureLine(next)
      if (nextLine) next = nextLine.set(lineText)
      else if (line) errors.push(`${p.sku}: working-pressure line lost by a family edit`)
      if (faq) {
        const current = faqs.get(faq.id) ?? faq.answer
        if (current !== faqText) {
          if (!TEMPLATE_LINES.includes(current) && current !== line?.text) {
            errors.push(
              `${p.sku}: pressure FAQ says "${current}" — not the template line; refusing`
            )
          } else faqs.set(faq.id, faqText)
        }
      }
      if (spec && TEMPLATE_LINES.includes(spec.value)) {
        if (d.kind === 'b16.5') specUpdate = { id: spec.id, value: d.text }
        else specDelete = spec.id
      }
    }

    // Nothing from the template may survive on the page.
    const survivors = [next, ...p.faqs.map((f) => faqs.get(f.id) ?? f.answer)]
      .concat(
        p.specs.filter((s) => s.id !== specDelete && s.id !== specUpdate?.id).map((s) => s.value)
      )
      .filter(
        (t) =>
          TEMPLATE_LINES.some((l) => t.includes(l)) || FAMILY_EDITS.some((e) => t.includes(e.find))
      )
    if (survivors.length)
      errors.push(`${p.sku}: template pressure text survives (${survivors[0]!.slice(0, 80)}…)`)

    // A page losing a spec row must stay above the index gate unless size rows hold it.
    const projected = score({
      ...p,
      descriptionLong: next,
      _count: { ...p._count, specs: p._count.specs - (specDelete ? 1 : 0) },
    })
    if (projected < 30 && p._count.variants === 0)
      errors.push(`${p.sku}: content score would fall to ${projected}`)

    plans.push({
      id: p.id,
      sku: p.sku,
      kind,
      descriptionLong: next === html ? null : next,
      faqs: [...faqs].map(([id, answer]) => ({ id, answer })),
      specUpdate,
      specDelete,
    })
  }

  if (!RERUN && plans.length && familyHits === 0)
    errors.push('family edits matched nothing — refusing a first run')
  const work = plans.filter(
    (x) => x.descriptionLong || x.faqs.length || x.specUpdate || x.specDelete
  )
  const by = (k: Plan['kind']) => work.filter((x) => x.kind === k).length
  log(`${DRY_RUN ? '[dry-run] ' : ''}${work.length} listings to change`)
  log(
    `  not published: ${by('not-published')}; manufacturer's figure: ${by('sourced')}; B16.5: ${by('b16.5')}; family paragraph only: ${by('family-only')}`
  )
  log(
    `  descriptions: ${work.filter((x) => x.descriptionLong).length}; FAQ answers: ${sum(work, (x) => x.faqs.length)}; spec rows deleted: ${work.filter((x) => x.specDelete).length}, updated: ${work.filter((x) => x.specUpdate).length}; family-sentence hits: ${familyHits}`
  )
  for (const x of work) log(`  ${x.sku}: ${x.kind}`)

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
  const before = new Map(products.map((p) => [p.id, p]))
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      work.map((x) => {
        const p = before.get(x.id)!
        return {
          sku: x.sku,
          descriptionLong: p.descriptionLong,
          faqs: p.faqs.filter((f) => x.faqs.some((g) => g.id === f.id)),
          specs: p.specs.filter((s) => s.id === x.specDelete || s.id === x.specUpdate?.id),
        }
      }),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  for (const x of work) {
    await db.$transaction(async (tx: Tx) => {
      if (x.descriptionLong)
        await tx.product.update({
          where: { id: x.id },
          data: { descriptionLong: x.descriptionLong },
        })
      for (const f of x.faqs)
        await tx.productFaq.update({ where: { id: f.id }, data: { answer: f.answer } })
      if (x.specUpdate)
        await tx.productSpec.update({
          where: { id: x.specUpdate.id },
          data: { value: x.specUpdate.value },
        })
      if (x.specDelete) await tx.productSpec.delete({ where: { id: x.specDelete } })
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
  descriptionShort: true,
  brandId: true,
  categoryId: true,
  focusKeyword: true,
  seoTitle: true,
  seoDescription: true,
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

/** A deleted spec row and a shorter line move the score; keep it in step. */
async function rescore(ids: string[]): Promise<void> {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, descriptionLong: true, ...SCORE_FIELDS },
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
