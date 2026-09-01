/**
 * Africa fittings sprint, wave 3 — the `hydraulic-fittings-by-industry` hub and
 * ten sector articles.
 *
 * Category first: `runBlogArticleImport` validates every article's
 * `categorySlug` against the live table.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-3/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-3/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { FITTINGS_BY_INDUSTRY_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import ARTICLE_21 from './articles/copper-mine-hydraulic-fittings'
import ARTICLE_22 from './articles/gold-plant-hydraulic-fittings'
import ARTICLE_23 from './articles/oilfield-fittings-in-west-africa'
import ARTICLE_24 from './articles/agriculture-and-construction-fittings'
import ARTICLE_25 from './articles/quarry-and-crusher-fittings'
import ARTICLE_26 from './articles/water-well-drilling-rig-fittings'
import ARTICLE_27 from './articles/port-and-terminal-fittings'
import ARTICLE_28 from './articles/sugar-mill-and-agro-processing-fittings'
import ARTICLE_29 from './articles/buying-fittings-in-south-africa'
import ARTICLE_30 from './articles/factory-and-fixed-plant-fittings'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_21,
  ARTICLE_22,
  ARTICLE_23,
  ARTICLE_24,
  ARTICLE_25,
  ARTICLE_26,
  ARTICLE_27,
  ARTICLE_28,
  ARTICLE_29,
  ARTICLE_30,
]

const DRY_RUN = process.argv.includes('--dry-run')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(FITTINGS_BY_INDUSTRY_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] category ${FITTINGS_BY_INDUSTRY_CATEGORY.slug} — ${parsed.data.length} blocks — "${FITTINGS_BY_INDUSTRY_CATEGORY.focusKeyword}"`
    )
    return
  }

  const { bodyBlocks: _seedBlocks, ...fields } = FITTINGS_BY_INDUSTRY_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: FITTINGS_BY_INDUSTRY_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${FITTINGS_BY_INDUSTRY_CATEGORY.slug} (category)`)
}

upsertCategory()
  .then(() => runBlogArticleImport({ articles: ARTICLES, dryRun: DRY_RUN }))
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
