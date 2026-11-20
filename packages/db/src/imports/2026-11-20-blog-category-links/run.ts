/**
 * Applies the article-to-category links in ./plans.ts to the live articles.
 *
 * The 2026-10-06 inline-links runner, pointed at a new plan: same validation,
 * same idempotency, same one-row-per-article writes. See ./plans.ts for why
 * and for the rules the plan follows.
 *
 * Content, not code: no deploy. Articles revalidate within the hour
 * (`revalidate = 3600`); purge `_N_T_/blog/<slug>` to see one sooner.
 *
 * Validation runs in full before anything is written:
 *   - every href is a published category;
 *   - every phrase is found as a whole word, outside headings, existing links
 *     and the lead's first words;
 *   - no article ends up linking the same page twice from its prose;
 *   - every edited block still parses and fits its field limit.
 *
 * Idempotent: a link whose href is already in the article's prose is reported
 * as done and skipped. A rollback file of every touched article's previous
 * `bodyBlocks` is written before the first update.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-blog-category-links/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-blog-category-links/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { BlogBlocksSchema, estimateReadingMinutes, type BlogBlockInput } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'
import { writeFileSync } from 'node:fs'

import { hrefsIn, htmlText, linkPhraseInHtml } from '../2026-10-06-blog-inline-links/link-text'
import { CATEGORY_LINK_PLANS as INLINE_PLANS } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

/** Characters of lead text kept clear of links: the drop cap and its line. */
const LEAD_MIN_OFFSET = 25

type HtmlBlock = { type: string; html?: string }
const LINKABLE = new Set(['paragraph', 'prose', 'lead'])
const APPENDABLE = new Set(['paragraph', 'lead'])
const MAX_HTML: Record<string, number> = { paragraph: 4000, lead: 2000, prose: 20000 }

async function main(): Promise<void> {
  const errors: string[] = []
  const slugs = Object.keys(INLINE_PLANS)

  // ── every href, against the live tables ──────────────────────────────────
  const hrefs = new Set<string>()
  for (const plan of Object.values(INLINE_PLANS)) {
    for (const l of plan.links ?? []) hrefs.add(l.href)
    for (const a of plan.add ?? []) for (const h of hrefsIn(a.html)) hrefs.add(h)
  }
  const productSlugs = [...hrefs].filter((h) => h.startsWith('/p/')).map((h) => h.slice(3))
  const categorySlugs = [...hrefs].filter((h) => h.startsWith('/c/')).map((h) => h.slice(3))
  for (const h of hrefs) if (!h.startsWith('/p/') && !h.startsWith('/c/')) errors.push(`unsupported href ${h}`)
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { slug: { in: productSlugs }, status: 'active', robotsIndex: true },
      select: { slug: true },
    }),
    db.category.findMany({ where: { slug: { in: categorySlugs }, isPublished: true }, select: { slug: true } }),
  ])
  const liveProducts = new Set(products.map((p) => p.slug))
  const liveCategories = new Set(categories.map((c) => c.slug))
  for (const s of productSlugs) if (!liveProducts.has(s)) errors.push(`product /p/${s} is not active and indexable`)
  for (const s of categorySlugs) if (!liveCategories.has(s)) errors.push(`category /c/${s} is not published`)

  // ── articles ─────────────────────────────────────────────────────────────
  const posts = await db.blogPost.findMany({
    where: { slug: { in: slugs }, isPublished: true, deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const bySlug = new Map(posts.map((p) => [p.slug, p]))
  for (const slug of slugs) if (!bySlug.has(slug)) errors.push(`${slug}: not found or not live`)

  type Planned = { id: string; slug: string; blocks: BlogBlockInput[]; before: unknown; changes: string[] }
  const planned: Planned[] = []
  let newLinks = 0
  let skipped = 0

  for (const slug of slugs) {
    const post = bySlug.get(slug)
    if (!post) continue
    const plan = INLINE_PLANS[slug]!
    const blocks = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []).map((b) => ({ ...(b as object) })) as Array<
      HtmlBlock & Record<string, unknown>
    >
    const proseHrefs = () => blocks.flatMap((b) => (LINKABLE.has(b.type) && b.html ? hrefsIn(b.html) : []))
    const changes: string[] = []

    const planHrefs = [
      ...(plan.links ?? []).map((l) => l.href),
      ...(plan.add ?? []).flatMap((a) => hrefsIn(a.html)),
    ]
    const dup = planHrefs.find((h, i) => planHrefs.indexOf(h) !== i)
    if (dup) errors.push(`${slug}: the plan links ${dup} twice`)

    for (const link of plan.links ?? []) {
      if (proseHrefs().includes(link.href)) {
        changes.push(`= "${link.phrase}" already linked`)
        skipped++
        continue
      }
      let done = false
      for (const b of blocks) {
        if (done || !LINKABLE.has(b.type) || !b.html) continue
        const r = linkPhraseInHtml(b.html, link.phrase, link.href, {
          minOffset: b.type === 'lead' ? LEAD_MIN_OFFSET : 0,
        })
        if (r.linked) {
          b.html = r.html
          done = true
        }
      }
      if (done) {
        changes.push(`+ "${link.phrase}" → ${link.href}`)
        newLinks++
      } else errors.push(`${slug}: phrase not found as a whole word in prose: "${link.phrase}"`)
    }

    for (const add of plan.add ?? []) {
      if (blocks.some((b) => b.html?.includes(add.html.trim()))) {
        changes.push(`= sentence after "${add.after.slice(0, 40)}…" already present`)
        skipped++
        continue
      }
      const target = blocks.find((b) => APPENDABLE.has(b.type) && b.html && htmlText(b.html).includes(add.after))
      if (!target) {
        errors.push(`${slug}: no paragraph or lead contains "${add.after}"`)
        continue
      }
      target.html = `${target.html}${add.html}`
      const added = hrefsIn(add.html)
      changes.push(`+ sentence: ${added.join(', ')}`)
      newLinks += added.length
    }

    // One prose link per page: a second anchor to the same URL adds nothing.
    const after = proseHrefs()
    for (const h of new Set(planHrefs)) {
      const n = after.filter((x) => x === h).length
      if (n > 1) errors.push(`${slug}: ${h} is linked ${n} times in the prose`)
    }
    for (const b of blocks) {
      const max = MAX_HTML[b.type]
      if (max && b.html && b.html.length > max) errors.push(`${slug}: a ${b.type} block is ${b.html.length} chars (max ${max})`)
    }
    const parsed = BlogBlocksSchema.safeParse(blocks)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`${slug}: ${issue.path.join('.')}: ${issue.message}`)
      continue
    }
    if (changes.some((c) => c.startsWith('+'))) planned.push({ id: post.id, slug, blocks: blocks as BlogBlockInput[], before: post.bodyBlocks, changes })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} article(s) to update, ${newLinks} new link(s), ${skipped} already done`)
  for (const p of planned) {
    console.log(`  /blog/${p.slug}`)
    for (const c of p.changes) console.log(`      ${c}`)
  }
  if (DRY_RUN) return
  if (!ROLLBACK_FILE) {
    console.error('refusing to write without --rollback-file=<absolute path>')
    process.exitCode = 1
    return
  }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(planned.map((p) => ({ id: p.id, slug: p.slug, bodyBlocks: p.before }))))
  console.log(`rollback written: ${ROLLBACK_FILE}`)

  for (const p of planned) {
    const parsed = BlogBlocksSchema.parse(p.blocks)
    await db.blogPost.update({
      where: { id: p.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(p.blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(parsed),
      },
    })
    console.log(`  ✓ /blog/${p.slug}`)
  }
  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
