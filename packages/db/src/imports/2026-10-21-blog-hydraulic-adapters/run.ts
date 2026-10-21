/**
 * Hydraulic adapter families (2026-10-21): range articles in the existing `buying-hydraulic-fittings` category
 * linking the ~600 carbon-steel, brass and pneumatic adapter listings on the `hydraulic-adapters` shelves that no
 * article named. Each article links every listing on its shelves (see products.ts) and points to the existing
 * concept posts (JIC vs ORFS, BSPP vs BSPT, DIN on European machines, SAE J518 …) rather than repeating them.
 *
 * Research notes (maker data, every fact sourced) are summarised in each article's header. Heroes are attached
 * afterwards with src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hydraulic-adapters/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hydraulic-adapters/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import JIC from './articles/jic-adapters-guide'
import ORFS_ORB from './articles/orfs-and-orb-adapters-guide'
import DIN from './articles/din-2353-adapters-guide'
import SAE_FLANGE from './articles/sae-flange-adapters-guide'
import BSP from './articles/bsp-hydraulic-adapters-guide'
import METRIC from './articles/metric-hydraulic-adapters-guide'
import NPT from './articles/npt-and-npsm-adapters-guide'
import AIR_BRAKE from './articles/brass-air-brake-fittings-guide'
import BRASS_PIPE from './articles/brass-pipe-fittings-nptf-and-bsp'
import BRASS_FLARE from './articles/brass-flare-and-compression-fittings'
import PUSH_IN from './articles/push-to-connect-air-fittings'

export const ARTICLES: BlogArticleSeed[] = [
  JIC,
  ORFS_ORB,
  DIN,
  SAE_FLANGE,
  BSP,
  METRIC,
  NPT,
  AIR_BRAKE,
  BRASS_PIPE,
  BRASS_FLARE,
  PUSH_IN,
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
      console.error('Refusing to run: these articles are already published. Re-run with --publish or --dry-run.')
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
