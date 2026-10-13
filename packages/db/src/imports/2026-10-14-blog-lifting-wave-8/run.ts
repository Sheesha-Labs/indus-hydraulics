/**
 * Lifting & rigging, wave 8 — contractor kits by trade: site mobilisation rigging kit, steel
 * erection, precast, rooftop plant, tower crane, shutdowns, cable pulling socks, marine works.
 *
 * `lifting-rigging` category. Published 2026-10-14 without images (no image credits); heroes can be
 * added later with ./attach-heroes.ts once ./media.ts is filled.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import KIT from './articles/site-mobilisation-rigging-kit'
import STEEL from './articles/steel-erection-rigging-equipment'
import PRECAST from './articles/precast-panel-and-beam-rigging'
import PLANT from './articles/lifting-chillers-and-rooftop-plant'
import TOWER from './articles/tower-crane-rigging-gear'
import SHUTDOWN from './articles/shutdown-and-turnaround-rigging'
import CABLE from './articles/cable-pulling-socks-and-grips'
import MARINE from './articles/jetty-and-marine-construction-rigging'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  KIT,
  STEEL,
  PRECAST,
  PLANT,
  TOWER,
  SHUTDOWN,
  CABLE,
  MARINE,
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
