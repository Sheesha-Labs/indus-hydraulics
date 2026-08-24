/**
 * Wave 6 — the connection cluster. Ten articles, no new category.
 *
 * Topics were selected from a Reddit demand harvest and filtered against every
 * published article; the reasoning, and what was deliberately left out of the
 * copy, is in ./shared.ts.
 *
 * Unlike waves 1 to 5 this does not carry its own copy of the importer. It
 * calls the extracted one in ../blog-article-import.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-6/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-6/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import ARTICLE_01 from './articles/stopping-an-npt-thread-leak'
import ARTICLE_02 from './articles/hydraulic-quick-couplers-iso-7241'
import ARTICLE_03 from './articles/new-hydraulic-hose-weeping'
import ARTICLE_04 from './articles/sae-j518-code-61-code-62-flanges'
import ARTICLE_05 from './articles/hydraulic-fitting-make-up-torque'
import ARTICLE_06 from './articles/removing-a-seized-hydraulic-fitting'
import ARTICLE_07 from './articles/photographing-a-hydraulic-fitting'
import ARTICLE_08 from './articles/should-you-buy-a-hose-crimper'
import ARTICLE_09 from './articles/cross-threaded-hydraulic-port'
import ARTICLE_10 from './articles/trapped-pressure-quick-coupler'

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
