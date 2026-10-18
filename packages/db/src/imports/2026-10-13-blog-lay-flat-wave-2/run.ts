/**
 * Lay flat hose blog, wave 2 — GCC: construction dewatering, discharge permits, frac water, fuel
 * transfer, borehole risers, Gulf heat, and four fire hose articles (UAE requirements, single vs
 * double jacket, liners, cabinet maintenance).
 *
 * Same contract as wave 1: `industrial-hose` category, figures inline (Media ids in ./media.ts),
 * heroes attached afterwards by ./attach-heroes.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import DEWATERING from './articles/construction-dewatering-hose-gcc'
import PERMITS from './articles/dewatering-discharge-permits-dubai-qatar'
import FRAC from './articles/frac-water-transfer-lay-flat-hose'
import FUEL from './articles/antistatic-fuel-transfer-hose-guide'
import FIRE_UAE from './articles/fire-hose-requirements-uae-civil-defence'
import JACKET from './articles/single-vs-double-jacket-fire-hose'
import LINERS from './articles/fire-hose-liner-materials'
import CABINET from './articles/fire-hose-cabinet-maintenance'
import RISER from './articles/flexible-borehole-riser-vs-steel-column-pipe'
import HEAT from './articles/lay-flat-hose-in-gulf-heat'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  DEWATERING,
  PERMITS,
  FRAC,
  FUEL,
  FIRE_UAE,
  JACKET,
  LINERS,
  CABINET,
  RISER,
  HEAT,
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
