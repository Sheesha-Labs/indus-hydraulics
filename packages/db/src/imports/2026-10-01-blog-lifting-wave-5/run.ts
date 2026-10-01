/**
 * Lifting & rigging, wave 5 — twelve comparison and selection guides (#11–#22).
 *
 * The `lifting-rigging` category was created and published by wave 1, so this
 * runner does not touch it. Same importer contract as every wave.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-5/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-5/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-5/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import SNATCH_BLOCKS from './articles/snatch-block-vs-pulley-block'
import HOISTS from './articles/chain-block-vs-lever-hoist-vs-electric-hoist'
import MASTER_LINKS from './articles/master-links-explained'
import HOOKS from './articles/lifting-hook-types'
import LIFTING_POINTS from './articles/pad-eye-vs-swivel-lifting-point'
import THIMBLES from './articles/wire-rope-thimble-types'
import EYE_TERMINATIONS from './articles/wire-rope-eye-terminations'
import SPELTER_SOCKETS from './articles/spelter-sockets-open-vs-closed'
import STAINLESS_VS_GALVANIZED from './articles/stainless-vs-galvanized-rigging-gulf'
import STRAPS_VS_CHAIN from './articles/ratchet-strap-vs-chain-and-binder'
import LOAD_BINDERS from './articles/lever-vs-ratchet-load-binder'
import DIN_CHAIN from './articles/din-link-chain-standards'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [
  SNATCH_BLOCKS,
  HOISTS,
  MASTER_LINKS,
  HOOKS,
  LIFTING_POINTS,
  THIMBLES,
  EYE_TERMINATIONS,
  SPELTER_SOCKETS,
  STAINLESS_VS_GALVANIZED,
  STRAPS_VS_CHAIN,
  LOAD_BINDERS,
  DIN_CHAIN,
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
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
