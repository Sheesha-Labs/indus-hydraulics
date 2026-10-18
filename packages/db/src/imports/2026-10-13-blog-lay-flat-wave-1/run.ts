/**
 * Lay flat hose blog, wave 1 — foundations: the pillar guide, materials, pressure ratings, flow and
 * friction loss, couplings, lay flat vs HDPE, failure modes, suction vs lay flat.
 *
 * Filed under the existing `industrial-hose` blog category, so the market-reach block comes from
 * that category's reach map. Figures are inline in the seeds (Media ids in ./media.ts); heroes are
 * attached afterwards by ./attach-heroes.ts. Same importer contract as every wave.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import GUIDE from './articles/lay-flat-hose-guide'
import MATERIALS from './articles/tpu-vs-nbr-vs-pvc-lay-flat-hose'
import PRESSURE from './articles/lay-flat-hose-pressure-ratings'
import FRICTION from './articles/lay-flat-hose-flow-and-friction-loss'
import COUPLINGS from './articles/lay-flat-hose-couplings-guide'
import VS_HDPE from './articles/lay-flat-hose-vs-hdpe-pipe'
import FAILURES from './articles/why-lay-flat-hose-fails'
import SUCTION from './articles/suction-hose-vs-lay-flat-hose'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [GUIDE, MATERIALS, PRESSURE, FRICTION, COUPLINGS, VS_HDPE, FAILURES, SUCTION]

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
