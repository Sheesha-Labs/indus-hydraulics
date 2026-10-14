/**
 * Lifting & rigging, wave 10 — families not yet covered: Grade 80 vs Grade 100 chain slings,
 * hammerlock and clevis fittings, shortening clutches and grab hooks, swivels, beam trolleys,
 * retaining pins, stainless lifting chain.
 *
 * `lifting-rigging` category. Published 2026-10-14 without images (no image credits); heroes can be
 * added later with ./attach-heroes.ts once ./media.ts is filled.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import GRADES from './articles/grade-80-vs-grade-100-chain-slings'
import CONNECT from './articles/hammerlock-vs-clevis-chain-fittings'
import SHORTEN from './articles/chain-sling-shortening-clutches-and-grab-hooks'
import SWIVEL from './articles/lifting-swivels-explained'
import TROLLEY from './articles/beam-trolley-guide'
import PINS from './articles/lynch-pins-r-clips-and-wire-lock-pins'
import STAINLESS from './articles/stainless-steel-lifting-chain'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  GRADES,
  CONNECT,
  SHORTEN,
  SWIVEL,
  TROLLEY,
  PINS,
  STAINLESS,
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
