/**
 * GCC supplier sprint, wave 1 — the `gcc-compliance` category and ten articles.
 *
 * The category is upserted first, because `runBlogArticleImport` validates
 * every article's `categorySlug` against the live table and would reject all
 * ten if the hub did not exist yet.
 *
 * The article import itself is the shared one. Waves 1 to 5 of the hose
 * programme each carried their own copy and by wave 5 the copies were
 * identical apart from the article list; that is not repeated here.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-gcc-supplier-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-gcc-supplier-wave-1/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema } from '@indus/domain'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { GCC_COMPLIANCE_CATEGORY } from './category'

import type { BlogArticleSeed } from './shared'
import ARTICLE_01 from './articles/saber-certificate-for-hydraulic-hose'
import ARTICLE_02 from './articles/gulf-conformity-mark-hose-fittings'
import ARTICLE_03 from './articles/certificate-of-origin-gcc-duty'
import ARTICLE_04 from './articles/hose-assembly-test-certificate'
import ARTICLE_05 from './articles/material-test-certificate-en-10204'
import ARTICLE_06 from './articles/nace-mr0175-hose-documentation'
import ARTICLE_07 from './articles/vendor-approval-for-hose-supply'
import ARTICLE_08 from './articles/verifying-a-genuine-hydraulic-hose'
import ARTICLE_09 from './articles/gcc-import-documents-for-hose'
import ARTICLE_10 from './articles/oilfield-hose-document-pack'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_01,
  ARTICLE_02,
  ARTICLE_03,
  ARTICLE_04,
  ARTICLE_05,
  ARTICLE_06,
  ARTICLE_07,
  ARTICLE_08,
  ARTICLE_09,
  ARTICLE_10,
]

const DRY_RUN = process.argv.includes('--dry-run')

async function upsertCategory(): Promise<void> {
  const parsed = BlogBlocksSchema.safeParse(GCC_COMPLIANCE_CATEGORY.bodyBlocks)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('category body failed validation')
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] category ${GCC_COMPLIANCE_CATEGORY.slug} — ${parsed.data.length} blocks — "${GCC_COMPLIANCE_CATEGORY.focusKeyword}"`
    )
    return
  }

  const { bodyBlocks: _seedBlocks, ...fields } = GCC_COMPLIANCE_CATEGORY
  const stored = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue
  await db.blogCategory.upsert({
    where: { slug: GCC_COMPLIANCE_CATEGORY.slug },
    update: { ...fields, bodyBlocks: stored },
    create: { ...fields, bodyBlocks: stored },
  })
  console.log(`  ✓ /blog/c/${GCC_COMPLIANCE_CATEGORY.slug} (category)`)
}

upsertCategory()
  .then(() => runBlogArticleImport({ articles: ARTICLES, dryRun: DRY_RUN }))
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
