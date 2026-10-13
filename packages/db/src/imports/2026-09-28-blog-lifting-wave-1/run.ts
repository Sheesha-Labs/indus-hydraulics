/**
 * Lifting & rigging, wave 1 — the first two articles for the lifting vertical
 * and the `lifting-rigging` blog category they live in.
 *
 * Same contract as every wave since 2026-08-17, through the shared importer:
 * validate every block, resolve every SKU, category and sibling article against
 * what is live, refuse to write anything on any problem, upsert by slug with
 * `publishedAt` create-only. Idempotent.
 *
 * Draft first, then publish:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-1/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-1/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { LIFTING_CATEGORY } from './category'
import WLL_VS_BREAKING from './articles/working-load-limit-vs-breaking-strength'
import TYPES_OF_SHACKLES from './articles/types-of-shackles'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [WLL_VS_BREAKING, TYPES_OF_SHACKLES]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function main(): Promise<void> {
  // A bare re-run applies `draft` on update, so without this guard it would
  // silently take live articles back to draft. See the physical-ai runner.
  if (!DRY_RUN && !PUBLISH) {
    const live = await db.blogPost.findMany({
      where: { slug: { in: ARTICLES.map((a) => a.slug) }, status: 'published' },
      select: { slug: true },
    })
    if (live.length > 0) {
      console.error('Refusing to run: these articles are already published.')
      for (const row of live) console.error(`  ✗ /blog/${row.slug}`)
      console.error('Re-run with --publish to update them in place, or --dry-run to validate.')
      process.exitCode = 1
      return
    }
  }

  const categoryBlocks = BlogBlocksSchema.safeParse(LIFTING_CATEGORY.bodyBlocks)
  if (!categoryBlocks.success) {
    console.error('category bodyBlocks failed validation:')
    for (const issue of categoryBlocks.error.issues) {
      console.error(`  ✗ bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    process.exitCode = 1
    return
  }

  if (DRY_RUN) {
    console.log(`[dry-run] category /blog/c/${LIFTING_CATEGORY.slug}`)
  } else {
    const { bodyBlocks: _unused, ...rest } = LIFTING_CATEGORY
    const categoryData = {
      ...rest,
      // The hub goes live exactly when its articles do.
      isPublished: PUBLISH,
      bodyBlocks: JSON.parse(JSON.stringify(categoryBlocks.data)) as Prisma.InputJsonValue,
    }
    await db.blogCategory.upsert({
      where: { slug: LIFTING_CATEGORY.slug },
      update: categoryData,
      create: categoryData,
    })
    console.log(`  ✓ /blog/c/${LIFTING_CATEGORY.slug} (${PUBLISH ? 'published' : 'unpublished'})`)
  }

  await runBlogArticleImport({
    articles: ARTICLES,
    dryRun: DRY_RUN,
    status: PUBLISH ? 'published' : 'draft',
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
