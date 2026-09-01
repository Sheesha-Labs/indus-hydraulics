/**
 * Africa fittings sprint, wave 1 — ten articles into `fitting-identification`.
 *
 * No new category: the hub exists, carries a body and a focus keyword, and has
 * a market-reach profile. This wave takes it from seven articles to seventeen.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-1/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import ARTICLE_01 from './articles/fittings-on-a-chinese-excavator'
import ARTICLE_02 from './articles/fittings-on-a-used-japanese-machine'
import ARTICLE_03 from './articles/tractor-hydraulic-fittings'
import ARTICLE_04 from './articles/fittings-on-american-machines'
import ARTICLE_05 from './articles/fittings-on-european-machines'
import ARTICLE_06 from './articles/korean-excavator-hydraulic-fittings'
import ARTICLE_07 from './articles/bsp-or-metric-fittings'
import ARTICLE_08 from './articles/measuring-a-fitting-without-gauges'
import ARTICLE_09 from './articles/building-a-thread-reference-board'
import ARTICLE_10 from './articles/bridging-two-thread-standards'

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

runBlogArticleImport({ articles: ARTICLES, dryRun: process.argv.includes('--dry-run') })
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
