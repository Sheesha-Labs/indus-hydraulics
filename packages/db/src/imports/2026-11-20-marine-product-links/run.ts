/**
 * Applies ./plans.ts: article links for unlinked Marine products. Content, not
 * code — no deploy. Purge `_N_T_/blog/<slug>` afterwards.
 *
 * Validation runs in full before anything is written: every product is active
 * and indexable, every phrase is found as a whole word outside headings and
 * existing links, no article links the same page twice, every edited block
 * parses. Idempotent: links already present, SKUs already embedded and shelves
 * already listed are reported and skipped. A rollback file of every touched
 * article's previous `bodyBlocks` is written before the first update.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-marine-product-links/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-marine-product-links/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { BlogBlocksSchema, estimateReadingMinutes, type BlogBlockInput } from '@indus/domain'
import type { Prisma } from '@prisma/client'
import { writeFileSync } from 'node:fs'

import { db } from '../../index'
import { hrefsIn, linkPhraseInHtml } from '../2026-10-06-blog-inline-links/link-text'
import { MARINE_LINK_PLANS, MAX_EMBED } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)
const LEAD_MIN_OFFSET = 25
const LINKABLE = new Set(['paragraph', 'prose', 'lead'])
const MAX_HTML: Record<string, number> = { paragraph: 4000, lead: 2000, prose: 20000 }
const STOCK_MARK = '<!-- fill-in:stock-list -->'

type Block = { type: string; html?: string; skus?: string[] } & Record<string, unknown>

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function main(): Promise<void> {
  const errors: string[] = []
  const slugs = Object.keys(MARINE_LINK_PLANS)

  // ── shelves and products, live ───────────────────────────────────────────
  const shelfSlugs = [...new Set(Object.values(MARINE_LINK_PLANS).flatMap((p) => p.stockLists ?? []))]
  const shelves = await db.category.findMany({
    where: { slug: { in: shelfSlugs }, isPublished: true },
    select: {
      slug: true,
      name: true,
      products: { where: { status: 'active', robotsIndex: true }, select: { slug: true, title: true }, orderBy: { title: 'asc' } },
    },
  })
  const shelfBySlug = new Map(shelves.map((s) => [s.slug, s]))
  for (const s of shelfSlugs) if (!shelfBySlug.get(s)?.products.length) errors.push(`shelf ${s} is not published or has no live products`)

  const linkSlugs = Object.values(MARINE_LINK_PLANS).flatMap((p) => (p.links ?? []).map((l) => l.href.slice(3)))
  const embedSkus = Object.values(MARINE_LINK_PLANS).flatMap((p) => p.embedAdd ?? [])
  const [liveBySlug, liveBySku] = await Promise.all([
    db.product.findMany({ where: { slug: { in: linkSlugs }, status: 'active', robotsIndex: true }, select: { slug: true } }),
    db.product.findMany({ where: { sku: { in: embedSkus }, status: 'active', robotsIndex: true }, select: { sku: true } }),
  ])
  const okSlug = new Set(liveBySlug.map((p) => p.slug))
  const okSku = new Set(liveBySku.map((p) => p.sku))
  for (const s of linkSlugs) if (!okSlug.has(s)) errors.push(`product /p/${s} is not active and indexable`)
  for (const s of embedSkus) if (!okSku.has(s)) errors.push(`SKU ${s} is not active and indexable`)

  const posts = await db.blogPost.findMany({
    where: { slug: { in: slugs }, isPublished: true, deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const postBySlug = new Map(posts.map((p) => [p.slug, p]))
  for (const s of slugs) if (!postBySlug.has(s)) errors.push(`${s}: not found or not live`)

  type Planned = { id: string; slug: string; blocks: BlogBlockInput[]; before: unknown; changes: string[] }
  const planned: Planned[] = []
  let newLinks = 0
  let skipped = 0

  for (const slug of slugs) {
    const post = postBySlug.get(slug)
    if (!post) continue
    const plan = MARINE_LINK_PLANS[slug]!
    const blocks = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []).map((b) => ({ ...(b as object) })) as Block[]
    const proseHrefs = () => blocks.flatMap((b) => (LINKABLE.has(b.type) && b.html ? hrefsIn(b.html) : []))
    const changes: string[] = []

    // in-text links
    for (const link of plan.links ?? []) {
      if (proseHrefs().includes(link.href)) {
        changes.push(`= "${link.phrase}" already linked`)
        skipped++
        continue
      }
      let done = false
      for (const b of blocks) {
        if (done || !LINKABLE.has(b.type) || !b.html || b.html.includes(STOCK_MARK)) continue
        const r = linkPhraseInHtml(b.html, link.phrase, link.href, { minOffset: b.type === 'lead' ? LEAD_MIN_OFFSET : 0 })
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

    // product_embed additions
    if (plan.embedAdd?.length) {
      const embeds = blocks.filter((b) => b.type === 'product_embed')
      if (embeds.length !== 1) errors.push(`${slug}: ${embeds.length} product_embed blocks (need exactly 1)`)
      else {
        const e = embeds[0]!
        const skus = [...(e.skus ?? [])]
        for (const sku of plan.embedAdd) {
          if (skus.includes(sku)) {
            changes.push(`= ${sku} already embedded`)
            skipped++
          } else {
            skus.push(sku)
            changes.push(`+ embed ${sku}`)
            newLinks++
          }
        }
        if (skus.length > MAX_EMBED) errors.push(`${slug}: product_embed would hold ${skus.length} SKUs (max ${MAX_EMBED})`)
        e.skus = skus
      }
    }

    // stock lists
    for (const shelfSlug of plan.stockLists ?? []) {
      const shelf = shelfBySlug.get(shelfSlug)
      if (!shelf) continue
      const heading = `on our ${esc(shelf.name)} shelf:</p>`
      const existing = blocks.find((b) => b.html?.includes(STOCK_MARK))
      if (existing?.html?.includes(heading)) {
        changes.push(`= ${shelf.name} shelf already listed`)
        skipped++
        continue
      }
      const linked = new Set(proseHrefs())
      const items = shelf.products.filter((p) => !linked.has(`/p/${p.slug}`))
      if (!items.length) continue
      const ul = `<ul>${items.map((p) => `<li><a href="/p/${p.slug}">${esc(p.title)}</a></li>`).join('')}</ul>`
      if (existing) existing.html = `${existing.html}<p>And ${heading}${ul}`
      else {
        const at = blocks.findIndex((b) => b.type === 'product_embed')
        const block: Block = { type: 'prose', html: `${STOCK_MARK}<h3>What we list</h3><p>Every listing ${heading}${ul}` }
        blocks.splice(at === -1 ? blocks.length : at, 0, block)
      }
      changes.push(`+ ${shelf.name} shelf list: ${items.length} link(s)`)
      newLinks += items.length
    }

    // Only this plan's hrefs: a few articles already carry an older duplicate.
    const after = proseHrefs()
    const before = new Set(blocks.length ? (post.bodyBlocks as Block[]).flatMap((b) => (LINKABLE.has(b.type) && b.html ? hrefsIn(b.html) : [])) : [])
    for (const h of new Set(after)) {
      if (before.has(h)) continue
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
