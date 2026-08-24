/**
 * Applies the link graph to every article already live.
 *
 * `runBlogArticleImport` composes `BLOG_CROSS_LINKS` in on every write, so any
 * future wave picks the graph up for free. The 93 articles already in the
 * database predate that, and the only way to re-import them through the normal
 * path would be to run seven wave runners — five of which carry their own
 * pre-extraction copy of the importer and would therefore write the seed blocks
 * without the graph.
 *
 * So this reads what is actually live, composes the graph onto it with the same
 * `withCrossLinks` the importer uses, validates the result, and writes it back.
 * Idempotent: `withCrossLinks` strips previously generated link blocks before
 * inserting, so running this twice produces the same article.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-cross-links/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-cross-links/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import {
  BlogBlocksSchema,
  designedIndustrySlugs,
  estimateReadingMinutes,
  marketsOrdered,
  type BlogBlocks,
  type BlogBlocksInput,
} from '@indus/domain'

import { db } from '../../index'
import { BLOG_CROSS_LINKS } from '../blog-cross-links'
import { syncArticleLinks, withCrossLinks } from '../blog-article-import'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true },
    orderBy: { slug: 'asc' },
  })

  const known = new Set(posts.map((p) => p.slug))
  const errors: string[] = []

  // Every key and every related slug has to name a real article. A typo here
  // would otherwise present as an article that quietly has one fewer link.
  for (const [slug, links] of Object.entries(BLOG_CROSS_LINKS)) {
    if (!known.has(slug)) errors.push(`cross-link map names an unknown article: ${slug}`)
    for (const target of links.related ?? []) {
      if (!known.has(target)) errors.push(`[${slug}] related names an unknown article: ${target}`)
      if (target === slug) errors.push(`[${slug}] related links to itself`)
    }
  }

  // The importer checks SKUs and page targets on the write path; this script
  // does not go through it, so it repeats the checks rather than trusting the
  // renderer to silently skip what does not resolve. A skipped link is not a
  // broken page, but it is a link that was written and never rendered.
  const wantedSkus = [...new Set(Object.values(BLOG_CROSS_LINKS).flatMap((l) => l.skus ?? []))]
  const wantedPages = Object.values(BLOG_CROSS_LINKS).flatMap((l) => l.pages ?? [])

  const [foundSkus, foundServices, foundIndustries] = await Promise.all([
    wantedSkus.length
      ? db.product.findMany({
          where: { sku: { in: wantedSkus }, status: 'active' },
          select: { sku: true },
        })
      : Promise.resolve([]),
    db.serviceCase.findMany({
      where: {
        slug: { in: wantedPages.filter((p) => p.kind === 'service').map((p) => p.slug) },
        status: 'published',
      },
      select: { slug: true },
    }),
    db.industry.findMany({
      where: {
        slug: { in: wantedPages.filter((p) => p.kind === 'industry').map((p) => p.slug) },
        isPublished: true,
      },
      select: { slug: true },
    }),
  ])

  const skuSet = new Set(foundSkus.map((p) => p.sku))
  for (const sku of wantedSkus) {
    if (!skuSet.has(sku)) errors.push(`cross-link map names an inactive or unknown SKU: ${sku}`)
  }

  const marketSet = new Set(marketsOrdered().map((m) => m.slug))
  const serviceSet = new Set(foundServices.map((c) => c.slug))
  const industrySet = new Set([...foundIndustries.map((i) => i.slug), ...designedIndustrySlugs()])
  for (const page of wantedPages) {
    const ok =
      page.kind === 'market'
        ? marketSet.has(page.slug)
        : page.kind === 'service'
          ? serviceSet.has(page.slug)
          : industrySet.has(page.slug)
    if (!ok) errors.push(`cross-link map names an unknown ${page.kind} page: ${page.slug}`)
  }

  const planned: Array<{ id: string; slug: string; blocks: BlogBlocks; added: number }> = []

  for (const post of posts) {
    const links = BLOG_CROSS_LINKS[post.slug]
    if (!links) {
      errors.push(`no cross-links defined for: ${post.slug}`)
      continue
    }

    const current = Array.isArray(post.bodyBlocks) ? (post.bodyBlocks as BlogBlocksInput) : []
    const composed = withCrossLinks(post.slug, current)

    const parsed = BlogBlocksSchema.safeParse(composed)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      }
      continue
    }
    planned.push({
      id: post.id,
      slug: post.slug,
      blocks: parsed.data,
      added: parsed.data.length - current.length,
    })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} article(s) composed`)
  const totalAdded = planned.reduce((n, p) => n + p.added, 0)
  console.log(`  ${totalAdded} block(s) added across the set`)
  if (DRY_RUN) {
    for (const p of planned) console.log(`  /blog/${p.slug} +${p.added}`)
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
