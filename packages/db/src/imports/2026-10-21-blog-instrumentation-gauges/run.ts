/**
 * Instrumentation and gauges (2026-10-21): the `instrumentation-gauges` hub and twelve articles linking the
 * 140 instrumentation products (tube fittings, tubing, gauges, oilfield instruments) that had no article.
 *
 * Research notes (maker data sheets and trade press, every fact sourced) are summarised in each article's header;
 * figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 * Category first: `runBlogArticleImport` validates every article's `categorySlug` against the live table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-instrumentation-gauges/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-instrumentation-gauges/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { INSTRUMENTATION_GAUGES_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import TF_GUIDE from './articles/instrumentation-tube-fittings-guide'
import FERRULES from './articles/single-vs-double-ferrule-tube-fittings'
import MAKEUP from './articles/how-to-make-up-a-compression-fitting'
import TUBING from './articles/instrumentation-tubing-pressure-ratings'
import CORROSION from './articles/stainless-tube-fittings-corrosion-gulf'
import ENDS from './articles/tube-fitting-end-connections'
import LEAKS from './articles/compression-fitting-leaks'
import GAUGE_GUIDE from './articles/pressure-gauge-guide'
import GAUGE_RANGE from './articles/how-to-choose-a-pressure-gauge-range'
import GAUGE_FILL from './articles/glycerine-filled-vs-dry-pressure-gauges'
import HP_GAUGES from './articles/high-pressure-hydraulic-gauges'
import OILFIELD from './articles/oilfield-pressure-and-flow-instrumentation'

export const ARTICLES: BlogArticleSeed[] = [
  TF_GUIDE,
  FERRULES,
  MAKEUP,
  TUBING,
  CORROSION,
  ENDS,
  LEAKS,
  GAUGE_GUIDE,
  GAUGE_RANGE,
  GAUGE_FILL,
  HP_GAUGES,
  OILFIELD,
]

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(INSTRUMENTATION_GAUGES_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }
  if (DRY_RUN) {
    const exists = await db.blogCategory.findUnique({ where: { slug: INSTRUMENTATION_GAUGES_CATEGORY.slug }, select: { id: true } })
    console.log(`[dry-run] category ${INSTRUMENTATION_GAUGES_CATEGORY.slug} — ${parsed.data.length} blocks — ${exists ? 'exists' : 'would be created'}`)
    return
  }
  const { bodyBlocks: _seedBlocks, ...fields } = INSTRUMENTATION_GAUGES_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: INSTRUMENTATION_GAUGES_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${INSTRUMENTATION_GAUGES_CATEGORY.slug} (category)`)
}

async function main(): Promise<void> {
  // A bare re-run applies `draft` on update; refuse rather than silently unpublish.
  if (!DRY_RUN && !PUBLISH) {
    const live = await db.blogPost.findMany({
      where: { slug: { in: ARTICLES.map((a) => a.slug) }, status: 'published' },
      select: { slug: true },
    })
    if (live.length > 0) {
      console.error('Refusing to run: these articles are already published. Re-run with --publish or --dry-run.')
      process.exitCode = 1
      return
    }
  }

  await upsertCategory()
  // The category must exist before the article import validates against it; on a dry run with no
  // category yet, the import would report every article as having an unknown category.
  if (DRY_RUN && !(await db.blogCategory.findUnique({ where: { slug: INSTRUMENTATION_GAUGES_CATEGORY.slug } }))) {
    console.log('[dry-run] skipping article import validation against the live category table (category not created yet)')
  }
  await runBlogArticleImport({
    articles: ARTICLES,
    dryRun: DRY_RUN,
    status: PUBLISH ? 'published' : 'draft',
    keepSeedFigures: true,
  })
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
