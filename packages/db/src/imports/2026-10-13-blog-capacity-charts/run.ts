/**
 * Rigging capacity charts — six chart articles and the `rigging-capacity-charts`
 * blog category they live in, plus the two chart posts from earlier waves
 * (sling-angle-chart, sling-colour-code-chart), which move into it.
 *
 * Same contract as every wave since 2026-08-17, through the shared importer:
 * validate every block, resolve every SKU, category and sibling article against
 * what is live, refuse to write anything on any problem, upsert by slug with
 * `publishedAt` create-only. Idempotent.
 *
 * The two earlier posts are moved by category only — their bodies are not
 * re-imported, so later edits to them survive.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-capacity-charts/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-capacity-charts/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-capacity-charts/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { CHARTS_CATEGORY } from './category'
import CHAIN_SLING from './articles/chain-sling-capacity-chart'
import WIRE_ROPE_SLING from './articles/wire-rope-sling-capacity-chart'
import SYNTHETIC_SLING from './articles/webbing-and-round-sling-capacity-chart'
import SHACKLE from './articles/shackle-size-and-capacity-chart'
import EYE_BOLT from './articles/eye-bolt-capacity-chart'
import WIRE_ROPE_MBL from './articles/wire-rope-breaking-strength-chart'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [CHAIN_SLING, WIRE_ROPE_SLING, SYNTHETIC_SLING, SHACKLE, EYE_BOLT, WIRE_ROPE_MBL]

/** Chart posts from earlier waves that belong in this hub. */
const ADOPTED = ['sling-angle-chart', 'sling-colour-code-chart']

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function main(): Promise<void> {
  // A bare re-run applies `draft` on update; refuse rather than silently unpublish.
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

  const categoryBlocks = BlogBlocksSchema.safeParse(CHARTS_CATEGORY.bodyBlocks)
  if (!categoryBlocks.success) {
    console.error('category bodyBlocks failed validation:')
    for (const issue of categoryBlocks.error.issues) {
      console.error(`  ✗ bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    process.exitCode = 1
    return
  }

  const adopted = await db.blogPost.findMany({ where: { slug: { in: ADOPTED } }, select: { slug: true } })
  if (adopted.length !== ADOPTED.length) {
    console.error('Refusing to run: an earlier chart post to move is missing.')
    process.exitCode = 1
    return
  }

  if (DRY_RUN) {
    console.log(`[dry-run] category /blog/c/${CHARTS_CATEGORY.slug}`)
  } else {
    const { bodyBlocks: _unused, ...rest } = CHARTS_CATEGORY
    const categoryData = {
      ...rest,
      // The hub goes live exactly when its articles do.
      isPublished: PUBLISH,
      bodyBlocks: JSON.parse(JSON.stringify(categoryBlocks.data)) as Prisma.InputJsonValue,
    }
    await db.blogCategory.upsert({
      where: { slug: CHARTS_CATEGORY.slug },
      update: categoryData,
      create: categoryData,
    })
    console.log(`  ✓ /blog/c/${CHARTS_CATEGORY.slug} (${PUBLISH ? 'published' : 'unpublished'})`)
  }

  await runBlogArticleImport({
    articles: ARTICLES,
    dryRun: DRY_RUN,
    status: PUBLISH ? 'published' : 'draft',
  })

  // Move the earlier charts only with the publish run, so the live posts never
  // sit in an unpublished hub.
  if (PUBLISH && process.exitCode !== 1) {
    const category = await db.blogCategory.findUniqueOrThrow({ where: { slug: CHARTS_CATEGORY.slug } })
    const moved = await db.blogPost.updateMany({ where: { slug: { in: ADOPTED } }, data: { categoryId: category.id } })
    console.log(`  ✓ moved ${moved.count} earlier chart posts into /blog/c/${CHARTS_CATEGORY.slug}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
