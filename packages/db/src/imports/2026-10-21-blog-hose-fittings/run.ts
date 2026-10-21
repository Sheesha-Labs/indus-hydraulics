/**
 * Hose fittings (2026-10-21): range articles in the existing `hose-assembly` and `stainless-steel-fittings` categories
 * linking the ~450 hose fitting listings (crimp, reusable, PTFE, thermoplastic, barbs, 316L) that no
 * article named. Each article links every listing on its shelves (see products.ts) and points to the existing
 * concept posts (braided vs spiral, skiving, SAE 100R types, EN 853/856/857 …) rather than repeating them.
 *
 * Research notes (maker data, every fact sourced) are summarised in each article's header. Heroes are attached
 * afterwards with src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hose-fittings/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hose-fittings/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import BRAIDED from './articles/braided-hose-crimp-fittings-guide'
import SPIRAL from './articles/spiral-hose-crimp-fittings-guide'
import THERMOPLASTIC from './articles/thermoplastic-hose-fittings-guide'
import PTFE_R5 from './articles/ptfe-and-textile-hose-ends'
import BSP_METRIC from './articles/bsp-metric-din-and-jis-hose-fittings'
import INCH from './articles/jic-orfs-and-npt-hose-fittings'
import STAINLESS from './articles/stainless-316l-hose-fittings'
import BARBS from './articles/hose-barbs-and-push-lock-fittings'
import ROUTES from './articles/crimped-reusable-or-ready-made-hose-assemblies'

export const ARTICLES: BlogArticleSeed[] = [
  BRAIDED,
  SPIRAL,
  THERMOPLASTIC,
  PTFE_R5,
  BSP_METRIC,
  INCH,
  STAINLESS,
  BARBS,
  ROUTES,
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
