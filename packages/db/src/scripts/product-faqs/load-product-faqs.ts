/**
 * Product FAQ programme — check a family payload and (with --write) replace
 * each product's FAQs with it.
 *
 * Plan: docs/product-faq-plan.md. The checks below ARE the review gate
 * (decision 4: review is minimal), so a payload that fails any hard check is
 * not written at all — not even the products that pass.
 *
 * Inputs:
 *   --facts=<json>    output of dump-facts.ts for the same family (uncommitted)
 *   --payload=<json>  packages/db/data/product-faqs/<wave>/<family>.json
 *   --guard=<txt>     supplier-name guard list, kept OUTSIDE the repo
 *                     (default ~/Documents/Indus Supplier Research/supplier-name-guard.txt)
 *   --write           actually write; without it this is a dry run
 *
 * Payload shape:
 *   {
 *     "family": "pneumatic-tubing",
 *     "hold": "optional — reason this payload must not be written yet",
 *     "extraFacts": [{ "fact": "ISO 8434-1 is the 24° cone standard", "source": "ISO 8434-1:2018" }],
 *     "products": [{ "slug": "…", "faqs": [{ "slot": "A", "q": "…?", "a": "…" }] }]
 *   }
 *
 * `extraFacts` is how a figure or standard that is not in the database gets
 * into an answer: it must be stated with its source, once per family.
 *
 * Writing: one transaction per product (pooler — see the db-scripts memory):
 * delete the product's FAQs, insert the payload's in order, recompute the
 * content score. Every write bumps `contentUpdatedAt` (sitemap lastmod) by
 * trigger, so a product whose stored FAQs already equal the payload — same
 * questions, answers and order — is skipped, not rewritten. Without that, a
 * re-run of a whole wave to fix three answers re-dated every product in it,
 * and the sitemap claimed hundreds of pages changed that had not.
 * Idempotent: a second run writes nothing.
 *
 * Links: answers may carry `[text](/path)`. Do NOT --write a payload with
 * links before the FAQ link renderer (faq-answer.ts) is deployed, or the
 * brackets show as text on the live page. --allow-links is the explicit
 * acknowledgement.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/load-product-faqs.ts \
 *     --facts=… --payload=… [--write] [--allow-links]
 */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { faqAnswerLinks, faqAnswerPlainText, scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

type Faq = { slot: string; q: string; a: string }
type Payload = {
  family: string
  /** Set while a payload must not be written (e.g. its source data needs fixing first). */
  hold?: string
  extraFacts?: { fact: string; source: string }[]
  products: { slug: string; faqs: Faq[] }[]
}
type FactsProduct = {
  id: string
  slug: string
  title: string
  availability: { kind: string }
  [k: string]: unknown
}
type Facts = { products: FactsProduct[]; [k: string]: unknown }

const TARGET = 12
const MIN = 10
const STATIC_PATHS = new Set(['/contact', '/services', '/resources', '/brands', '/blog', '/markets'])
// Claims that need support in the facts before an answer may make them.
const GUARDED_CLAIMS = [
  /\bAPI\s?(5CT|5L|6A|6D|7K|16A|16C|16D|17J|610)\b/gi,
  /\bmonogram/gi,
  /\bNACE\b/gi,
  /\bATEX\b/gi,
  /\bDNV\b/gi,
  /\bPED\b/g,
  /\bCE[- ]marked\b/gi,
  /\bcertified\b/gi,
]
// An answer must never tell a buyer our own page is wrong — fix the data instead.
const SELF_CRITICISM = /\b(data errors?|typo|(our|the) (size )?table[^.]*\b(conflicts?|incorrect(ly)?|wrong|errors?)\b|rows?[^.]*\b(conflicts?|incorrect(ly)?|errors?)\b|inconsistent)/i
const VAGUE_QUESTION = /^(what|is|are|does|do|can|how|which|where|why)\b(\s+\w+){0,2}\s+(it|this|they|these)\b/i

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit?.slice(name.length + 3)
}

/** Every number-like token in a text: 1/2, 3,000, 6.4, 1-1/2, -40 … */
function numbers(text: string): string[] {
  return (text.match(/\d+(?:[.,/]\d+)*/g) ?? [])
    .map((n) => n.replace(/,(?=\d{3}\b)/g, ''))
    .filter((n) => !/^(1|2)$/.test(n)) // "one or two", list counts — too common to police
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/,(?=\d{3}\b)/g, '').replace(/\s+/g, ' ')
}

function firstSentence(a: string): string {
  const m = faqAnswerPlainText(a).match(/^.+?[.!?](\s|$)/s)
  return (m ? m[0] : a).trim()
}

async function validPaths(): Promise<Set<string>> {
  const [products, categories, posts] = await Promise.all([
    db.product.findMany({ where: { status: 'active' }, select: { slug: true } }),
    db.category.findMany({ where: { isPublished: true }, select: { slug: true } }),
    db.blogPost.findMany({ where: { isPublished: true, deletedAt: null }, select: { slug: true } }),
  ])
  return new Set([
    ...STATIC_PATHS,
    ...products.map((p) => `/p/${p.slug}`),
    ...categories.map((c) => `/c/${c.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ])
}

async function main() {
  const factsPath = arg('facts')
  const payloadPath = arg('payload')
  const guardPath =
    arg('guard') ?? join(homedir(), 'Documents', 'Indus Supplier Research', 'supplier-name-guard.txt')
  const write = process.argv.includes('--write')
  const allowLinks = process.argv.includes('--allow-links')
  if (!factsPath || !payloadPath) throw new Error('--facts and --payload are required')
  if (!existsSync(guardPath)) throw new Error(`supplier-name guard list not found: ${guardPath}`)

  const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8')) as Payload
  const guard = readFileSync(guardPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
  const paths = await validPaths()

  const familyCorpus = normalise(
    JSON.stringify({ ...facts, products: undefined }) + JSON.stringify(payload.extraFacts ?? []),
  )
  const errors: string[] = []
  const warnings: string[] = []
  const answerUse = new Map<string, string[]>()
  let linkCount = 0

  for (const item of payload.products) {
    const fp = facts.products.find((p) => p.slug === item.slug)
    const where = item.slug
    if (!fp) {
      errors.push(`${where}: not in the facts file`)
      continue
    }
    const corpus = normalise(JSON.stringify(fp)) + ' ' + familyCorpus
    if (item.faqs.length > TARGET) errors.push(`${where}: ${item.faqs.length} FAQs, max ${TARGET}`)
    if (item.faqs.length < MIN) errors.push(`${where}: ${item.faqs.length} FAQs, min ${MIN}`)
    else if (item.faqs.length < TARGET) warnings.push(`${where}: ${item.faqs.length} FAQs (target ${TARGET})`)

    const seenQ = new Set<string>()
    let commercial = 0
    for (const [i, f] of item.faqs.entries()) {
      const at = `${where} #${i + 1}`
      const plain = faqAnswerPlainText(f.a)
      if (!f.q.trim().endsWith('?')) errors.push(`${at}: question does not end with "?"`)
      if (f.q.length < 25 || f.q.length > 160) errors.push(`${at}: question length ${f.q.length} (25–160)`)
      if (VAGUE_QUESTION.test(f.q)) errors.push(`${at}: question says "it/this" instead of naming the product: ${f.q}`)
      if (SELF_CRITICISM.test(plain)) errors.push(`${at}: answer says our own data is wrong — fix the data, not the FAQ`)
      if (seenQ.has(normalise(f.q))) errors.push(`${at}: duplicate question`)
      seenQ.add(normalise(f.q))
      if (plain.length < 120 || plain.length > 650) errors.push(`${at}: answer length ${plain.length} (120–650)`)
      const lead = firstSentence(f.a)
      if (lead.length > 260) errors.push(`${at}: first sentence ${lead.length} chars — must answer on its own, ≤260`)
      if (f.slot === 'M') commercial++

      for (const n of numbers(f.q + ' ' + plain)) {
        if (!corpus.includes(n)) errors.push(`${at}: number "${n}" not found in the facts or extraFacts`)
      }
      for (const re of GUARDED_CLAIMS) {
        for (const m of (f.q + ' ' + plain).matchAll(re)) {
          if (!corpus.includes(m[0].toLowerCase())) errors.push(`${at}: claim "${m[0]}" not supported by the facts`)
        }
      }
      for (const name of guard) {
        const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (re.test(f.q) || re.test(f.a)) errors.push(`${at}: SUPPLIER NAME "${name}"`)
      }
      for (const href of faqAnswerLinks(f.a)) {
        linkCount++
        const bare = href.replace(/[?#].*$/, '')
        if (!paths.has(bare)) errors.push(`${at}: link ${href} is not a live page`)
        if (bare === `/p/${item.slug}`) errors.push(`${at}: links to its own page`)
      }
      if (/\]\(/.test(plain)) errors.push(`${at}: malformed link markup`)

      const key = normalise(plain)
      answerUse.set(key, [...(answerUse.get(key) ?? []), at])
    }
    if (commercial > 2) errors.push(`${where}: ${commercial} commercial (M) FAQs, max 2`)
    const m = item.faqs.find((f) => f.slot === 'M')
    if (m && fp.availability.kind === 'ex_stock' && !/Dubai/.test(m.a)) {
      errors.push(`${where}: commercial FAQ on an ex-stock product must state the Dubai stock (decision 5)`)
    }
    if (m && fp.availability.kind !== 'ex_stock' && /in stock/i.test(m.a)) {
      errors.push(`${where}: product is ${fp.availability.kind}, commercial FAQ must not claim stock`)
    }
  }
  for (const [, uses] of answerUse) {
    if (uses.length > 3) errors.push(`same answer on ${uses.length} products: ${uses.slice(0, 4).join(', ')}…`)
  }
  // extraFacts are committed with the payload, so the supplier guard applies to them too.
  for (const [i, e] of (payload.extraFacts ?? []).entries()) {
    for (const name of guard) {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(e.fact) || re.test(e.source)) errors.push(`extraFacts #${i + 1}: SUPPLIER NAME "${name}"`)
    }
  }

  const missing = facts.products.filter((p) => !payload.products.some((x) => x.slug === p.slug))
  for (const p of missing) warnings.push(`${p.slug}: in the family but not in the payload`)

  console.log(
    `${payload.family}: ${payload.products.length} products, ` +
      `${payload.products.reduce((n, p) => n + p.faqs.length, 0)} FAQs, ${linkCount} links`,
  )
  for (const w of warnings) console.log(`  warn  ${w}`)
  for (const e of errors) console.log(`  ERROR ${e}`)
  if (errors.length) {
    console.log(`${errors.length} errors — nothing written.`)
    process.exitCode = 1
    return
  }
  if (payload.hold) console.log(`  HOLD  ${payload.hold}`)
  if (!write) {
    console.log('Checks passed. Dry run — add --write to replace the FAQs.')
    return
  }
  if (payload.hold) throw new Error(`Payload is on hold: ${payload.hold}`)
  if (linkCount > 0 && !allowLinks) {
    throw new Error('Payload has links. Pass --allow-links only once the FAQ link renderer is deployed.')
  }

  const failed: string[] = []
  let unchanged = 0
  for (const item of payload.products) {
    const fp = facts.products.find((p) => p.slug === item.slug)!
    const stored = await db.productFaq.findMany({
      where: { productId: fp.id },
      orderBy: { position: 'asc' },
      select: { question: true, answer: true },
    })
    if (sameFaqs(stored, item.faqs)) {
      unchanged++
      continue
    }
    // One transaction per product: delete + insert, so a failure leaves the old set intact.
    // Under load a transaction can queue behind others; retry once rather than abort the run.
    let ok = false
    for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
      try {
        await db.$transaction(
          async (tx) => {
            await tx.productFaq.deleteMany({ where: { productId: fp.id } })
            await tx.productFaq.createMany({
              data: item.faqs.map((f, i) => ({ productId: fp.id, question: f.q.trim(), answer: f.a.trim(), position: i })),
            })
          },
          { timeout: 120_000, maxWait: 30_000 },
        )
        ok = true
      } catch (e) {
        console.log(`  retry ${attempt} ${item.slug}: ${(e as Error).message.split('\n').at(-1)?.slice(0, 160)}`)
      }
    }
    if (!ok) {
      failed.push(item.slug)
      continue
    }
    await rescore(fp.id)
    console.log(`  wrote ${item.faqs.length} → ${item.slug}`)
  }
  if (unchanged) console.log(`  unchanged ${unchanged} (already match the payload, not rewritten)`)
  if (failed.length) {
    console.log(`FAILED ${failed.length}: ${failed.join(' ')}`)
    process.exitCode = 1
  }
}

/** Stored FAQs equal the payload's, in order, after the same trim the write applies. */
function sameFaqs(stored: { question: string; answer: string }[], faqs: Faq[]): boolean {
  return (
    stored.length === faqs.length &&
    stored.every((s, i) => s.question === faqs[i]!.q.trim() && s.answer === faqs[i]!.a.trim())
  )
}

async function rescore(productId: string) {
  const p = await db.product.findUniqueOrThrow({
    where: { id: productId },
    include: {
      _count: { select: { faqs: true, specs: true, crossReferences: true, documents: true, images: true } },
    },
  })
  const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const score = scoreProductContent({
    descriptionShortWords: words(p.descriptionShort ?? ''),
    descriptionLongWords: words(p.descriptionLong ?? ''),
    faqCount: p._count.faqs,
    specCount: p._count.specs,
    crossReferenceCount: p._count.crossReferences,
    documentCount: p._count.documents,
    imageCount: p._count.images,
    hasBrand: Boolean(p.brandId),
    hasCategory: Boolean(p.categoryId),
    hasFocusKeyword: Boolean(p.focusKeyword),
    hasSeoTitleAndDescription: Boolean(p.seoTitle && p.seoDescription),
    hasCommerceAttributes: Boolean(p.weightKg && p.countryOfOrigin && p.mpn),
  })
  await db.product.update({ where: { id: productId }, data: { contentScore: score.score } })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
