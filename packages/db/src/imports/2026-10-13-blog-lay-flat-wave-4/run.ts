/**
 * Lay flat hose blog, wave 4 — long-tail and buying stage: size chart, repair, rolling and
 * storage, riser installation, compressed air hose, drinking-water hose and NSF/ANSI 61, the RFQ
 * checklist, and forestry fire hose.
 *
 * Same contract as waves 1–3: `industrial-hose` category, figures inline (Media ids in ./media.ts),
 * heroes attached afterwards by ./attach-heroes.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-4/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-4/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-4/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import SIZE_CHART from './articles/lay-flat-hose-size-chart'
import REPAIR from './articles/how-to-repair-lay-flat-hose'
import ROLL_STORE from './articles/how-to-roll-and-store-lay-flat-hose'
import RISER_INSTALL from './articles/well-riser-hose-installation'
import AIR from './articles/compressed-air-lay-flat-hose'
import NSF61 from './articles/drinking-water-hose-nsf-61'
import RFQ from './articles/lay-flat-hose-rfq-checklist'
import FORESTRY from './articles/forestry-fire-hose-guide'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  SIZE_CHART,
  REPAIR,
  ROLL_STORE,
  RISER_INSTALL,
  AIR,
  NSF61,
  RFQ,
  FORESTRY,
]

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
