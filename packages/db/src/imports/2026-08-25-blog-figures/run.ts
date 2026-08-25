/**
 * Puts one photograph inside every article body.
 *
 * Before this, 93 articles carried a hero and not one carried a picture in the
 * body — every article was an unbroken wall of text. Each figure borrows
 * another article's hero, chosen because it genuinely illustrates a point this
 * article makes; the map and the reasoning are in ../blog-figures.ts.
 *
 * Same shape as the cross-links apply script: reads what is live, composes with
 * the same `withFigures` the importer uses, validates, writes back, and re-syncs
 * relation rows. Idempotent — `withFigures` strips existing figures first.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-figures/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-figures/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import {
  BlogBlocksSchema,
  estimateReadingMinutes,
  type BlogBlocks,
  type BlogBlocksInput,
} from '@indus/domain'

import { db } from '../../index'
import { BLOG_FIGURES } from '../blog-figures'
import { syncArticleLinks, withFigures } from '../blog-article-import'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, heroId: true, bodyBlocks: true },
    orderBy: { slug: 'asc' },
  })

  const errors: string[] = []
  const heroIdBySlug = new Map<string, string>()
  for (const post of posts) if (post.heroId) heroIdBySlug.set(post.slug, post.heroId)

  const known = new Set(posts.map((p) => p.slug))
  for (const [slug, figures] of Object.entries(BLOG_FIGURES)) {
    if (!known.has(slug)) errors.push(`figure map names an unknown article: ${slug}`)
    for (const figure of figures) {
      if (!known.has(figure.from)) {
        errors.push(`[${slug}] borrows from an unknown article: ${figure.from}`)
      } else if (!heroIdBySlug.has(figure.from)) {
        errors.push(`[${slug}] borrows from ${figure.from}, which has no hero`)
      }
      if (figure.from === slug) errors.push(`[${slug}] borrows its own hero`)
    }
  }

  const planned: Array<{ id: string; slug: string; blocks: BlogBlocks; figures: number }> = []

  for (const post of posts) {
    const current = Array.isArray(post.bodyBlocks) ? (post.bodyBlocks as BlogBlocksInput) : []
    const composed = withFigures(post.slug, current, heroIdBySlug)

    const parsed = BlogBlocksSchema.safeParse(composed)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      }
      continue
    }

    const figures = parsed.data.filter((b) => b.type === 'figure').length
    const wanted = BLOG_FIGURES[post.slug]?.length ?? 0
    if (figures < wanted) {
      // A dropped figure means `afterSection` pointed past the end of the
      // article. Silent would leave a picture missing with nothing to show for
      // it, so it fails the run instead.
      errors.push(`[${post.slug}] wanted ${wanted} figure(s), placed ${figures}`)
      continue
    }
    planned.push({ id: post.id, slug: post.slug, blocks: parsed.data, figures })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  const total = planned.reduce((n, p) => n + p.figures, 0)
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} article(s), ${total} figure(s)`)
  if (DRY_RUN) return

  for (const p of planned) {
    await db.blogPost.update({
      where: { id: p.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(p.blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(p.blocks),
      },
    })
    await syncArticleLinks(p.id, p.blocks)
    console.log(`  ✓ /blog/${p.slug} (+${p.figures})`)
  }

  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
