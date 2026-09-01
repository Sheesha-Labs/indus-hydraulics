/**
 * Africa fittings sprint, wave 4 — the fittings diagnostic cluster.
 *
 * No new category: seven articles go to `failure-analysis` and three to
 * `maintenance-reliability`, both of which exist and both of which already have
 * a market-reach profile.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-4/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-01-africa-fittings-wave-4/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import ARTICLE_31 from './articles/reading-a-weeping-joint'
import ARTICLE_32 from './articles/over-tightened-fitting-diagnosis'
import ARTICLE_33 from './articles/why-fittings-seize-in-coastal-air'
import ARTICLE_34 from './articles/damaged-port-repair-or-scrap'
import ARTICLE_35 from './articles/sealant-on-hydraulic-threads'
import ARTICLE_36 from './articles/galvanic-corrosion-in-fittings'
import ARTICLE_37 from './articles/dirt-ingress-in-transit-and-storage'
import ARTICLE_38 from './articles/storing-fittings-and-seals-on-site'
import ARTICLE_39 from './articles/reusing-fittings-in-a-rebuild'
import ARTICLE_40 from './articles/crimping-on-site-or-adapting'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_31,
  ARTICLE_32,
  ARTICLE_33,
  ARTICLE_34,
  ARTICLE_35,
  ARTICLE_36,
  ARTICLE_37,
  ARTICLE_38,
  ARTICLE_39,
  ARTICLE_40,
]

runBlogArticleImport({ articles: ARTICLES, dryRun: process.argv.includes('--dry-run') })
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
