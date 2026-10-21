/**
 * Add a "What we list" section — a link to every active listing on the mapped shelves — to existing blog posts.
 *
 * Why: a 2026-10-21 audit found ~1,000 active products on shelves that already had an article written about them,
 * but those articles linked only the handful of SKUs in their product block. Rewriting forty-odd old seed files to add
 * a list each would be churn; this script owns the lists instead, from the mapping in fill-in-stock-lists.map.ts.
 *
 * How: for each mapped post it reads the stored bodyBlocks, removes any block this script added before (each one
 * starts with the STOCK_LIST_MARKER comment), builds fresh prose blocks from the live catalogue, inserts them ahead of
 * the post's product block (or ahead of its closing blocks), validates with BlogBlocksSchema, recomputes reading time
 * and re-syncs the post's product/category links. Idempotent: a second run rewrites the same blocks.
 *
 * Caveat: re-running a post's original seed importer replaces its bodyBlocks and drops the list. Run this script again
 * after any such re-import.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/fill-in-stock-lists.ts [--dry-run] [--only=<post-slug>]
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes } from '@indus/domain'
import type { BlogBlocks } from '@indus/domain'

import { syncBlogPostLinks } from '../blog-links'
import { FILL_INS } from './fill-in-stock-lists.map'

const db = new PrismaClient()

const STOCK_LIST_MARKER = '<!-- fill-in:stock-list -->'
/** ProseBlockSchema allows 20,000 characters; leave headroom. */
const MAX_HTML = 18000
/** Blocks that close an article; the list goes in front of the first of them if there is no product block. */
const CLOSING = new Set(['faq_block', 'references', 'related_articles', 'as_of_stamp', 'cta_block', 'market_reach'])

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type Block = { type: string; html?: string; [k: string]: unknown }

function buildBlocks(intro: string, items: { slug: string; title: string }[]): Block[] {
  const lis = items.map((p) => `<li><a href="/p/${p.slug}">${esc(p.title)}</a></li>`)
  const blocks: Block[] = []
  let head = `${STOCK_LIST_MARKER}<h3>What we list</h3><p>${intro}</p><ul>`
  let cur: string[] = []
  for (const li of lis) {
    if (head.length + cur.join('').length + li.length + 5 > MAX_HTML) {
      blocks.push({ type: 'prose', html: `${head}${cur.join('')}</ul>` })
      head = `${STOCK_LIST_MARKER}<ul>`
      cur = []
    }
    cur.push(li)
  }
  blocks.push({ type: 'prose', html: `${head}${cur.join('')}</ul>` })
  return blocks
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length)
  const entries = only ? FILL_INS.filter((f) => f.post === only) : FILL_INS

  const allShelves = [...new Set(entries.flatMap((e) => e.shelves))]
  const cats = await db.category.findMany({ where: { slug: { in: allShelves } }, select: { id: true, slug: true, name: true } })
  const catBySlug = new Map(cats.map((c) => [c.slug, c]))
  const missingCats = allShelves.filter((s) => !catBySlug.has(s))
  if (missingCats.length) throw new Error(`unknown categories: ${missingCats.join(', ')}`)

  let linked = 0
  let problems = 0
  const touched: string[] = []

  for (const entry of entries) {
    const post = await db.blogPost.findUnique({ where: { slug: entry.post }, select: { id: true, slug: true, status: true, bodyBlocks: true } })
    if (!post || post.status !== 'published') {
      console.log(`  ! ${entry.post}: not found or not published`)
      problems++
      continue
    }

    const shelves = entry.shelves.map((s) => catBySlug.get(s)!)
    const products = await db.product.findMany({
      where: { status: 'active', categoryId: { in: shelves.map((c) => c.id) } },
      select: { slug: true, title: true, categoryId: true },
      orderBy: { title: 'asc' },
    })
    // Keep shelf order, then title order within a shelf.
    const order = new Map(shelves.map((c, i) => [c.id, i]))
    products.sort((a, b) => order.get(a.categoryId!)! - order.get(b.categoryId!)! || a.title.localeCompare(b.title))
    if (products.length === 0) {
      console.log(`  ! ${entry.post}: no active products on ${entry.shelves.join(', ')}`)
      problems++
      continue
    }

    const names = shelves.map((c) => c.name)
    const shelfText = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]!}`
    const intro = `Every listing on our ${esc(shelfText)} ${names.length === 1 ? 'shelf' : 'shelves'}:`
    const listBlocks = buildBlocks(intro, products)

    const existing = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []) as Block[]
    const kept = existing.filter((b) => !(b.type === 'prose' && typeof b.html === 'string' && b.html.startsWith(STOCK_LIST_MARKER)))
    let at = kept.findIndex((b) => b.type === 'product_embed')
    if (at < 0) at = kept.findIndex((b) => CLOSING.has(b.type))
    if (at < 0) at = kept.length
    const next = [...kept.slice(0, at), ...listBlocks, ...kept.slice(at)]

    const parsed = BlogBlocksSchema.safeParse(next)
    if (!parsed.success) {
      console.log(`  ✗ ${entry.post}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
      problems++
      continue
    }

    linked += products.length
    touched.push(post.slug)
    console.log(`  ${dryRun ? '[dry-run] ' : ''}${post.slug}: ${products.length} listings in ${listBlocks.length} block(s) from ${entry.shelves.join(', ')}`)
    if (dryRun) continue

    const blocks = parsed.data as BlogBlocks
    await db.blogPost.update({
      where: { id: post.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(blocks),
      },
    })
    await syncBlogPostLinks(post.id, blocks, db)
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}${touched.length} posts, ${linked} listing links, ${problems} problem(s)`)
  console.log(`slugs: ${touched.join(' ')}`)
  await db.$disconnect()
  if (problems) process.exitCode = 1
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
