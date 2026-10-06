/**
 * Corrects catalogue data found wrong while writing the 2026-10-06 article
 * waves, and two category links in live articles. Content only: no deploy, no
 * cache purge.
 *
 * What changes, and why, is in rules.ts (products) and posts.ts (articles).
 * In outline:
 *   - API 6B against 6BX on the 3K and 5K flow iron, wellhead and valve pages;
 *     ring numbers on the BOP, casing spool and tubing head pages; the bolting
 *     of a 13-5/8" 10K flange
 *   - manual gate valves called fail close; what an API 6A material-class
 *     suffix means; shell-test multipliers at 5K
 *   - template citations: cam and groove, KC, ISO 10380 "PSL", EN 13648-1,
 *     NPT as ISO 7-1, metric as DIN 3852-2, Guillemin, tensioner API 17J
 *   - values in the wrong row or unit: PVC bend radius, ISO 13795 towing kN,
 *     fender "proof load", nylon rope inch sizes, a polypropylene breaking
 *     load, Molykote units, the Danforth range, Fig 602 valve pressure class,
 *     Fig 1003 test pressures
 *   - an O-ring page written from the steel-adapter template
 *   - 18 slugs that spelled out the error, each moved with a 301 and every
 *     product, article and page link to it rewritten
 *
 * Every rule must change something on a first run and every guard in rules.ts
 * must come up empty, or nothing is written. Each product is its own
 * transaction. `--rerun` accepts rules that have nothing left to do.
 *
 * Not in scope, and reported instead: "API monogram traceability" and OEM
 * interchange claims on the BOP and valve templates, and the GB/T 554 bollard
 * loads (each listing matches its LG sheet; the 2008 edition calls the same
 * figures safe working load, the 1996 one breaking load — the conservative
 * reading stays).
 *
 * Live as caches expire: redirects within a minute, articles within an hour,
 * product pages about hourly, shelves within a day.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-listing-data-fixes/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-listing-data-fixes/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import type { Prisma } from '@prisma/client'
import { BlogBlocksSchema, scoreProductContent, wordCount } from '@indus/domain'

import { db } from '../../index'
import { recordSlugRedirect } from '../../slug-redirect'
import { syncArticleLinks } from '../blog-article-import'
import {
  inScope,
  planIsEmpty,
  planProduct,
  rewriteProductHrefs,
  type ProductPlan,
  type ProductState,
  type Scope,
} from './plan'
import { applyPostFix, mapStrings, POST_FIXES } from './posts'
import {
  CATEGORY_MOVES,
  FIELD_SETS,
  GUARDS,
  PVC_BEND,
  SLUG_MOVES,
  SPEC_RULES,
  TEMPLATE_OPTIONS,
  TEXT_RULES,
  VARIANT_RULES,
} from './rules'

const DRY_RUN = process.argv.includes('--dry-run')
const RERUN = process.argv.includes('--rerun')
const VERBOSE = process.argv.includes('--verbose')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)

/** Each product writes alone; a batch transaction over the pooler times out (see merge-and-asme.ts). */
const TX = { timeout: 30_000, maxWait: 10_000 } as const

/** Below this, a product with no size rows is noindex (indexability rules, 2026-09-26). */
const INDEX_FLOOR = 30

type Tx = Prisma.TransactionClient
type Row = ProductState & { id: string; slug: string; categoryId: string | null }

const log = (line: string) => console.log(line)

function snippet(text: string, at: number, width = 70): string {
  return text.slice(Math.max(0, at - width), at + width).replace(/\s+/g, ' ')
}

/** Where two strings first differ, shown from both sides. */
function diff(before: string, after: string): string {
  let i = 0
  while (i < before.length && i < after.length && before[i] === after[i]) i++
  return `      − …${snippet(before, i)}…\n      + …${snippet(after, i)}…`
}

function insertAfter(options: readonly string[], add: string, after: string): string[] {
  const at = options.indexOf(after)
  return [...options.slice(0, at + 1), add, ...options.slice(at + 1)]
}

async function main(): Promise<void> {
  const errors: string[] = []

  // ── Load ───────────────────────────────────────────────────────────────────
  const active = await db.product.findMany({ where: { status: 'active' }, select: { sku: true } })
  const activeSkus = active.map((p) => p.sku)
  const activeSet = new Set(activeSkus)

  const scopes: Scope[] = [
    ...TEXT_RULES.map((r) => r.scope),
    ...SPEC_RULES.map((r) => r.scope),
    ...VARIANT_RULES.map((r) => r.scope),
    ...GUARDS.map((g) => g.scope),
  ]
  const named = new Set<string>([
    ...scopes.flatMap((s) => (s instanceof RegExp ? [] : [...s])),
    ...FIELD_SETS.map((f) => f.sku),
    ...SLUG_MOVES.map((m) => m.sku),
    ...CATEGORY_MOVES.map((m) => m.sku),
  ])
  for (const sku of named)
    if (!activeSet.has(sku)) errors.push(`SKU ${sku} is not an active product`)
  const patterns = scopes.filter((s): s is RegExp => s instanceof RegExp)
  const candidates = activeSkus.filter(
    (sku) => named.has(sku) || patterns.some((re) => inScope(re, sku))
  )

  const rows: Row[] = await db.product.findMany({
    where: { sku: { in: candidates } },
    select: {
      id: true,
      sku: true,
      slug: true,
      categoryId: true,
      title: true,
      seoTitle: true,
      seoDescription: true,
      descriptionShort: true,
      descriptionLong: true,
      specs: {
        select: { id: true, label: true, value: true, unit: true },
        orderBy: { position: 'asc' },
      },
      faqs: { select: { id: true, question: true, answer: true }, orderBy: { position: 'asc' } },
      images: { select: { id: true, alt: true }, orderBy: { position: 'asc' } },
      variants: {
        select: { id: true, partNumber: true, dimensions: true },
        orderBy: { position: 'asc' },
      },
    },
  })
  const bySku = new Map(rows.map((r) => [r.sku, r]))

  // ── Plan ───────────────────────────────────────────────────────────────────
  const rules = {
    fieldSets: FIELD_SETS,
    text: TEXT_RULES,
    specs: SPEC_RULES,
    variants: VARIANT_RULES,
  }
  const plans = new Map<string, ProductPlan>()
  const totals = new Map<string, number>()
  for (const row of rows) {
    const plan = planProduct(row, rules)
    plans.set(row.sku, plan)
    for (const [id, n] of plan.hits) totals.set(id, (totals.get(id) ?? 0) + n)
  }

  const ruleIds = [
    ...FIELD_SETS.map((r) => r.id),
    ...TEXT_RULES.map((r) => r.id),
    ...SPEC_RULES.map((r) => r.id),
    ...VARIANT_RULES.map((r) => r.id),
  ]
  const duplicates = ruleIds.filter((id, i) => ruleIds.indexOf(id) !== i)
  if (duplicates.length) errors.push(`duplicate rule ids: ${duplicates.join(', ')}`)
  if (!RERUN) {
    for (const id of ruleIds)
      if (!totals.get(id)) errors.push(`rule ${id} changes nothing — check its find text`)
  }

  for (const guard of GUARDS) {
    for (const row of rows) {
      if (!inScope(guard.scope, row.sku)) continue
      for (const text of plans.get(row.sku)!.after) {
        const m = guard.pattern.exec(text)
        if (m) errors.push(`guard — ${guard.why}: ${row.sku} …${snippet(text, m.index, 60)}…`)
      }
    }
  }

  // The PVC summaries quote the size table; check it still says what they will.
  for (const [sku, want] of Object.entries(PVC_BEND)) {
    const column = (key: string) =>
      (bySku.get(sku)?.variants ?? [])
        .map((v) => Number((v.dimensions as Record<string, unknown> | null)?.[key]))
        .filter(Number.isFinite)
    const radii = column('bendRadius')
    const kg = column('weightPerMetre')
    if (Math.min(...radii) !== want.min || Math.max(...radii) !== want.max) {
      errors.push(
        `pvc: ${sku} bend radii run ${Math.min(...radii)}–${Math.max(...radii)} mm, rules say ${want.min}–${want.max}`
      )
    }
    if (Math.min(...kg) !== want.kgMin || Math.max(...kg) !== want.kgMax) {
      errors.push(
        `pvc: ${sku} weights run ${Math.min(...kg)}–${Math.max(...kg)} kg/m, rules say ${want.kgMin}–${want.kgMax}`
      )
    }
  }

  // ── Slugs, shelves, template options ───────────────────────────────────────
  const moves: Array<{ sku: string; id: string; from: string; to: string }> = []
  for (const m of SLUG_MOVES) {
    const row = bySku.get(m.sku)
    if (!row || row.slug === m.to) continue
    if (row.slug !== m.from) {
      errors.push(`slug: ${m.sku} is at ${row.slug}, expected ${m.from}`)
      continue
    }
    const clash = await db.product.findUnique({ where: { slug: m.to }, select: { sku: true } })
    if (clash) errors.push(`slug: ${m.to} is already ${clash.sku}`)
    moves.push({ ...m, id: row.id })
  }
  if (!RERUN && !moves.length && SLUG_MOVES.length) errors.push('slug: every move is already done')

  const shelfMoves: Array<{ sku: string; categoryId: string; to: string }> = []
  for (const m of CATEGORY_MOVES) {
    const cat = await db.category.findUnique({
      where: { slug: m.to },
      select: { id: true, isPublished: true },
    })
    if (!cat?.isPublished) {
      errors.push(`shelf: ${m.to} missing or unpublished`)
      continue
    }
    const row = bySku.get(m.sku)
    if (row && row.categoryId !== cat.id)
      shelfMoves.push({ sku: m.sku, categoryId: cat.id, to: m.to })
    else if (!RERUN) errors.push(`shelf: ${m.sku} is already on ${m.to}`)
  }

  const optionChanges: Array<{ id: string; label: string; before: string[]; after: string[] }> = []
  for (const t of TEMPLATE_OPTIONS) {
    const field = await db.specTemplateField.findFirst({
      where: { key: t.key, template: { slug: t.template } },
      select: { id: true, options: true },
    })
    const options = Array.isArray(field?.options) ? (field.options as string[]) : null
    if (!field || !options)
      errors.push(`template: ${t.template}.${t.key} not found or has no options`)
    else if (options.includes(t.add)) {
      if (!RERUN) errors.push(`template: ${t.template}.${t.key} already offers ${t.add}`)
    } else if (!options.includes(t.after))
      errors.push(`template: ${t.template}.${t.key} has no ${t.after}`)
    else
      optionChanges.push({
        id: field.id,
        label: `${t.template}.${t.key}`,
        before: options,
        after: insertAfter(options, t.add, t.after),
      })
  }

  // ── Links to the moved slugs, and the article fixes ────────────────────────
  const allMoves = SLUG_MOVES.map(({ from, to }) => ({ from, to }))
  const linkers = await db.product.findMany({
    where: { OR: allMoves.map((m) => ({ descriptionLong: { contains: `/p/${m.from}` } })) },
    select: { id: true, sku: true, descriptionLong: true },
  })
  const hrefOnly: Array<{ id: string; sku: string; before: string; after: string; hits: number }> =
    []
  for (const p of linkers) {
    const plan = plans.get(p.sku)
    const current = plan?.fields.descriptionLong ?? p.descriptionLong ?? ''
    const r = rewriteProductHrefs(current, allMoves)
    if (!r.hits) continue
    if (plan) {
      plan.fields.descriptionLong = r.text
      plan.hits.set('product-hrefs', r.hits)
    } else hrefOnly.push({ id: p.id, sku: p.sku, before: current, after: r.text, hits: r.hits })
  }

  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true, body: true },
  })
  const postChanges: Array<{
    id: string
    slug: string
    before: unknown
    body: string | null
    blocks: unknown
    newBody: string | null
    notes: string[]
  }> = []
  for (const post of posts) {
    let blocks = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []) as Array<
      Record<string, unknown>
    >
    const notes: string[] = []
    for (const fix of POST_FIXES.filter((f) => f.slug === post.slug)) {
      const r = applyPostFix(blocks, fix)
      blocks = r.blocks
      if (r.hits) {
        notes.push(
          fix.kind === 'tile'
            ? `tile ${fix.from} → ${fix.to.slug}`
            : fix.kind === 'text'
              ? `"${fix.find}" → "${fix.replace}"`
              : `unlinked "${fix.text}" (${fix.href})`
        )
      } else if (!RERUN) errors.push(`post ${post.slug}: ${fix.kind} fix found nothing`)
    }
    const hrefs = mapStrings(blocks, (s) => rewriteProductHrefs(s, allMoves))
    if (hrefs.hits) notes.push(`${hrefs.hits} product link(s) to moved slugs`)
    const body = post.body == null ? null : rewriteProductHrefs(post.body, allMoves)
    if (body?.hits) notes.push(`${body.hits} product link(s) in body`)
    if (!notes.length) continue
    const parsed = BlogBlocksSchema.safeParse(hrefs.value)
    if (!parsed.success) {
      errors.push(`post ${post.slug}: blocks no longer parse — ${parsed.error.issues[0]?.message}`)
      continue
    }
    postChanges.push({
      id: post.id,
      slug: post.slug,
      before: post.bodyBlocks,
      body: post.body,
      blocks: parsed.data,
      newBody: body?.text ?? null,
      notes,
    })
  }
  for (const fix of POST_FIXES) {
    if (!posts.some((p) => p.slug === fix.slug)) errors.push(`post ${fix.slug} not found`)
  }

  const pages = await db.pageContent.findMany({ select: { id: true, key: true, sections: true } })
  const pageChanges: Array<{
    id: string
    key: string
    before: unknown
    after: unknown
    hits: number
  }> = []
  for (const page of pages) {
    const r = mapStrings(page.sections, (s) => rewriteProductHrefs(s, allMoves))
    if (r.hits)
      pageChanges.push({
        id: page.id,
        key: page.key,
        before: page.sections,
        after: r.value,
        hits: r.hits,
      })
  }

  const work = rows.filter(
    (r) =>
      !planIsEmpty(plans.get(r.sku)!) ||
      moves.some((m) => m.sku === r.sku) ||
      shelfMoves.some((m) => m.sku === r.sku)
  )

  // Deleting spec rows or rewriting a page moves its content score. A page
  // without size rows that falls under the floor turns noindex — refuse that.
  const scoreRows = await db.product.findMany({
    where: { id: { in: work.map((r) => r.id) } },
    select: SCORE_SELECT,
  })
  for (const s of scoreRows) {
    const plan = plans.get(s.sku)!
    const projected = score({
      ...s,
      descriptionShort: plan.fields.descriptionShort ?? s.descriptionShort,
      descriptionLong: plan.fields.descriptionLong ?? s.descriptionLong,
      _count: {
        ...s._count,
        specs: s._count.specs - plan.specDeletes.length,
        faqs: plan.faqReplace ? plan.faqReplace.length : s._count.faqs,
      },
    })
    if (s._count.variants === 0 && s.contentScore >= INDEX_FLOOR && projected < INDEX_FLOOR) {
      errors.push(
        `score: ${s.sku} would fall from ${s.contentScore} to ${projected} with no size rows — it would turn noindex`
      )
    }
  }

  // ── Report ─────────────────────────────────────────────────────────────────
  log(
    `${DRY_RUN ? '[dry-run] ' : ''}${work.length} product(s) to change, ${hrefOnly.length} more for links only`
  )
  for (const id of ruleIds) log(`  ${String(totals.get(id) ?? 0).padStart(4)}  ${id}`)
  for (const m of moves) log(`  move  /p/${m.from}\n     →  /p/${m.to}`)
  for (const m of shelfMoves) log(`  shelf ${m.sku} → /c/${m.to}`)
  for (const o of optionChanges)
    log(`  options ${o.label}: [${o.before.join(', ')}] → [${o.after.join(', ')}]`)
  for (const p of hrefOnly) log(`  links ${p.sku}: ${p.hits}`)
  for (const p of postChanges) log(`  post  ${p.slug}: ${p.notes.join('; ')}`)
  for (const p of pageChanges) log(`  page  ${p.key}: ${p.hits} link(s)`)
  if (VERBOSE) {
    for (const row of work) {
      const plan = plans.get(row.sku)!
      log(`\n  ${row.sku}`)
      for (const [key, after] of Object.entries(plan.fields))
        log(`    ${key}\n${diff((row[key as keyof ProductState] as string) ?? '', after)}`)
      for (const s of plan.specUpdates) {
        const before = row.specs.find((x) => x.id === s.id)!
        log(
          `    spec ${before.label}: ${before.value}${before.unit ? ` [${before.unit}]` : ''}  →  ${s.label}: ${s.value}${s.unit ? ` [${s.unit}]` : ''}`
        )
      }
      for (const id of plan.specDeletes) {
        const before = row.specs.find((x) => x.id === id)!
        log(`    spec ${before.label}: ${before.value}  →  deleted`)
      }
      for (const f of plan.faqUpdates) {
        const before = row.faqs.find((x) => x.id === f.id)!
        log(`    faq ${before.question}\n${diff(before.answer, f.answer)}`)
      }
      if (plan.faqReplace) log(`    faqs replaced: ${row.faqs.length} → ${plan.faqReplace.length}`)
      for (const a of plan.altUpdates) log(`    alt → ${a.alt}`)
      for (const v of plan.variantUpdates) {
        const before = row.variants.find((x) => x.id === v.id)!
        log(
          `    variant ${v.partNumber}: ${JSON.stringify(before.dimensions)}  →  ${JSON.stringify(v.dimensions)}`
        )
      }
    }
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
      {
        takenAt: new Date().toISOString(),
        products: work,
        hrefOnly: hrefOnly.map(({ id, sku, before }) => ({ id, sku, descriptionLong: before })),
        templateFields: optionChanges.map(({ id, before }) => ({ id, options: before })),
        posts: postChanges.map(({ id, slug, before, body }) => ({
          id,
          slug,
          bodyBlocks: before,
          body,
        })),
        pages: pageChanges.map(({ id, key, before }) => ({ id, key, sections: before })),
      },
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  // ── Write ──────────────────────────────────────────────────────────────────
  for (const o of optionChanges) {
    await db.specTemplateField.update({ where: { id: o.id }, data: { options: o.after } })
  }

  for (const row of work) {
    const plan = plans.get(row.sku)!
    const move = moves.find((m) => m.sku === row.sku)
    const shelf = shelfMoves.find((m) => m.sku === row.sku)
    await db.$transaction(async (tx: Tx) => {
      await tx.product.update({
        where: { id: row.id },
        data: {
          ...plan.fields,
          ...(move ? { slug: move.to } : {}),
          ...(shelf ? { categoryId: shelf.categoryId } : {}),
        },
      })
      for (const s of plan.specUpdates) {
        await tx.productSpec.update({
          where: { id: s.id },
          data: {
            label: s.label,
            value: s.value,
            unit: s.unit,
            ...(s.detach ? { templateFieldId: null } : {}),
          },
        })
      }
      if (plan.specDeletes.length)
        await tx.productSpec.deleteMany({ where: { id: { in: plan.specDeletes } } })
      if (plan.faqReplace) {
        await tx.productFaq.deleteMany({ where: { productId: row.id } })
        await tx.productFaq.createMany({
          data: plan.faqReplace.map((f, position) => ({
            productId: row.id,
            question: f.question,
            answer: f.answer,
            position,
          })),
        })
      }
      for (const f of plan.faqUpdates) {
        await tx.productFaq.update({
          where: { id: f.id },
          data: { question: f.question, answer: f.answer },
        })
      }
      for (const a of plan.altUpdates)
        await tx.productImage.update({ where: { id: a.id }, data: { alt: a.alt } })
      for (const v of plan.variantUpdates) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { dimensions: v.dimensions as Prisma.InputJsonValue },
        })
      }
      if (move) {
        await recordSlugRedirect(tx, {
          fromPath: `/p/${move.from}`,
          toPath: `/p/${move.to}`,
          statusCode: 301,
          notes: 'Listing data fixes 2026-10-06: slug named a wrong specification',
        })
      }
    }, TX)
  }
  log(`products written: ${work.length}`)

  for (const p of hrefOnly) {
    await db.product.update({ where: { id: p.id }, data: { descriptionLong: p.after } })
  }
  for (const p of postChanges) {
    await db.blogPost.update({
      where: { id: p.id },
      data: {
        bodyBlocks: p.blocks as Prisma.InputJsonValue,
        ...(p.newBody != null ? { body: p.newBody } : {}),
      },
    })
    await syncArticleLinks(p.id, p.blocks as Parameters<typeof syncArticleLinks>[1])
  }
  for (const p of pageChanges) {
    await db.pageContent.update({
      where: { id: p.id },
      data: { sections: p.after as Prisma.InputJsonValue },
    })
  }
  log(
    `links written: ${hrefOnly.length} product(s), ${postChanges.length} article(s), ${pageChanges.length} page(s)`
  )

  await rescore([...work.map((r) => r.id), ...hrefOnly.map((p) => p.id)])
}

const SCORE_SELECT = {
  id: true,
  sku: true,
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

type ScoreRow = Prisma.ProductGetPayload<{ select: typeof SCORE_SELECT }>

/** The same inputs backfill-product-content-scores.ts uses. */
function score(p: Pick<ScoreRow, Exclude<keyof ScoreRow, 'id' | 'sku' | 'contentScore'>>): number {
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

/** Recomputes contentScore for the products this run wrote. */
async function rescore(ids: string[]): Promise<void> {
  const products = await db.product.findMany({ where: { id: { in: ids } }, select: SCORE_SELECT })
  let changed = 0
  for (const p of products) {
    const next = score(p)
    if (next === p.contentScore) continue
    changed++
    await db.product.update({ where: { id: p.id }, data: { contentScore: next } })
    log(`  score ${p.sku}: ${p.contentScore} → ${next}`)
  }
  log(`content scores recomputed: ${changed} changed`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
