/**
 * Lay flat hose blog, wave 3 — Europe: slurry umbilical systems, low-emission spreading rules,
 * drag hose sizing, over-pumping and mains bypass, fire hose standards, flood response, mine
 * dewatering, snowmaking, irrigation and concrete placement.
 *
 * Same contract as waves 1–2: `industrial-hose` category, figures inline (Media ids in ./media.ts),
 * heroes attached afterwards by ./attach-heroes.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import UMBILICAL from './articles/slurry-umbilical-system-guide'
import LESS from './articles/low-emission-slurry-spreading-rules-europe'
import DRAG from './articles/slurry-drag-hose-sizing-and-life'
import BYPASS from './articles/overland-pumping-water-main-bypass'
import FIRE_STANDARDS from './articles/fire-hose-standards-en-14540-bs-6391-nfpa'
import FLOOD from './articles/flood-response-pumping-lay-flat-hose'
import MINE from './articles/mine-dewatering-lay-flat-hose'
import SNOW from './articles/snowmaking-hose-guide'
import IRRIGATION from './articles/irrigation-lay-flat-hose-guide'
import CONCRETE from './articles/concrete-placement-hose-guide'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  UMBILICAL,
  LESS,
  DRAG,
  BYPASS,
  FIRE_STANDARDS,
  FLOOD,
  MINE,
  SNOW,
  IRRIGATION,
  CONCRETE,
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
