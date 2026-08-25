/**
 * Applies the delivery-reach section to every article already live.
 *
 * Same shape and the same reason as the 2026-08-25 cross-links script beside
 * it: `runBlogArticleImport` composes the block in on every write, so any
 * future wave gets it for free, but the 93 articles already in the database
 * predate that and cannot be re-imported without running seven wave runners,
 * five of which carry their own pre-extraction copy of the importer.
 *
 * So this reads what is live, composes the reach block onto it with the same
 * `withCrossLinks` the importer uses, validates the result, and writes it back.
 * Idempotent: `withCrossLinks` strips a previously generated reach block before
 * inserting, so running this twice produces the same article.
 *
 * The category is read from the row rather than from a seed, because the seeds
 * are spread across eight wave directories and the row is the thing the site
 * actually renders from. An article whose category has no profile is an error,
 * not a silent skip — see `MARKET_REACH_PROFILES`.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-market-reach/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-market-reach/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import {
  BlogBlocksSchema,
  MARKET_REACH_PROFILES,
  blogReferencedPageLinks,
  estimateReadingMinutes,
  marketsOrdered,
  type BlogBlocks,
  type BlogBlocksInput,
} from '@indus/domain'

import { db } from '../../index'
import { syncArticleLinks, withCrossLinks } from '../blog-article-import'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  const errors: string[] = []
  const marketSet = new Set(marketsOrdered().map((m) => m.slug))
  const planned: Array<{
    id: string
    slug: string
    category: string
    blocks: BlogBlocks
    regions: string[]
  }> = []

  for (const post of posts) {
    const category = post.category?.slug
    if (!category) {
      errors.push(`${post.slug} has no blog category`)
      continue
    }
    if (!MARKET_REACH_PROFILES[category]) {
      errors.push(`no reach profile for blog category: ${category} (first seen on ${post.slug})`)
      continue
    }

    const current = Array.isArray(post.bodyBlocks) ? (post.bodyBlocks as BlogBlocksInput) : []
    const composed = withCrossLinks(post.slug, current, category)

    const parsed = BlogBlocksSchema.safeParse(composed)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      }
      continue
    }

    // The generated block can only name markets from `MARKETS`, so this cannot
    // fail as written. It is here because the block is also hand-editable in
    // the admin editor, and this script is the last thing to see the article
    // before it is written — a slug typed by hand should die here rather than
    // render as a silently missing country.
    const reach = parsed.data.find((b) => b.type === 'market_reach')
    if (!reach) {
      errors.push(`[${post.slug}] composed without a reach block`)
      continue
    }
    for (const link of blogReferencedPageLinks(parsed.data)) {
      if (link.kind === 'market' && !marketSet.has(link.slug)) {
        errors.push(`[${post.slug}] unknown market: ${link.slug}`)
      }
    }

    planned.push({
      id: post.id,
      slug: post.slug,
      category,
      blocks: parsed.data,
      regions: reach.type === 'market_reach' ? reach.groups.map((g) => g.region) : [],
    })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} article(s) composed`)

  const regionCounts = new Map<string, number>()
  const marketCounts = new Map<string, number>()
  for (const p of planned) {
    for (const region of p.regions) regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1)
    for (const link of blogReferencedPageLinks(p.blocks)) {
      if (link.kind === 'market')
        marketCounts.set(link.slug, (marketCounts.get(link.slug) ?? 0) + 1)
    }
  }
  console.log(`  ${marketCounts.size} distinct market page(s) linked`)
  for (const [region, n] of [...regionCounts].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${region.padEnd(28)} ${n} article(s)`)
  }

  if (DRY_RUN) {
    for (const p of planned)
      console.log(`  /blog/${p.slug} [${p.category}] ${p.regions.join(' · ')}`)
    return
  }

  for (const p of planned) {
    await db.blogPost.update({
      where: { id: p.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(p.blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(p.blocks),
      },
    })
    await syncArticleLinks(p.id, p.blocks)
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
