/**
 * Africa fittings sprint, wave 2 — the `buying-hydraulic-fittings` hub and ten
 * articles.
 *
 * The category is upserted first: `runBlogArticleImport` validates every
 * article's `categorySlug` against the live table and would reject all ten if
 * the hub did not exist yet.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-2/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-2/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { BUYING_FITTINGS_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import ARTICLE_11 from './articles/what-to-send-for-a-fittings-quote'
import ARTICLE_12 from './articles/cross-referencing-a-fitting-part-number'
import ARTICLE_13 from './articles/adapter-kit-for-a-mixed-fleet'
import ARTICLE_14 from './articles/spares-list-for-a-remote-site'
import ARTICLE_15 from './articles/inspecting-fittings-on-arrival'
import ARTICLE_16 from './articles/plating-and-corrosion-on-fittings'
import ARTICLE_17 from './articles/when-stainless-is-worth-it'
import ARTICLE_18 from './articles/air-or-sea-for-a-fittings-order'
import ARTICLE_19 from './articles/consolidating-fittings-with-a-hose-order'
import ARTICLE_20 from './articles/substituting-a-fitting-safely'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_11,
  ARTICLE_12,
  ARTICLE_13,
  ARTICLE_14,
  ARTICLE_15,
  ARTICLE_16,
  ARTICLE_17,
  ARTICLE_18,
  ARTICLE_19,
  ARTICLE_20,
]

const DRY_RUN = process.argv.includes('--dry-run')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(BUYING_FITTINGS_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] category ${BUYING_FITTINGS_CATEGORY.slug} — ${parsed.data.length} blocks — "${BUYING_FITTINGS_CATEGORY.focusKeyword}"`
    )
    return
  }

  const { bodyBlocks: _seedBlocks, ...fields } = BUYING_FITTINGS_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: BUYING_FITTINGS_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${BUYING_FITTINGS_CATEGORY.slug} (category)`)
}

upsertCategory()
  .then(() => runBlogArticleImport({ articles: ARTICLES, dryRun: DRY_RUN }))
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
