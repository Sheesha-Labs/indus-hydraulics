/**
 * Wave 7 — Reddit backlog items 11 to 20. Ten articles, no new category.
 *
 * Scope decisions, and what was deliberately left out of the copy, are in
 * ./shared.ts.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-7/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-7/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import ARTICLE_11 from './articles/bspp-bonded-seal-sizing'
import ARTICLE_12 from './articles/where-jic-is-the-wrong-choice'
import ARTICLE_13 from './articles/split-female-quick-coupler'
import ARTICLE_14 from './articles/stacking-hydraulic-adapters'
import ARTICLE_15 from './articles/contamination-during-a-hose-change'
import ARTICLE_16 from './articles/grease-and-zerk-fittings'
import ARTICLE_17 from './articles/field-re-hosing-kit'
import ARTICLE_18 from './articles/log-splitter-and-shop-press-hose'
import ARTICLE_19 from './articles/detaching-a-hose-on-a-modern-machine'
import ARTICLE_20 from './articles/mini-excavator-hose-maintenance'

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

runBlogArticleImport({ articles: ARTICLES, dryRun: process.argv.includes('--dry-run') })
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
