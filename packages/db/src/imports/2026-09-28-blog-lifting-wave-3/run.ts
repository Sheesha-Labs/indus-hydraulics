/**
 * Lifting & rigging, wave 3 — sling angles, wire rope clips, and lifting equipment inspection in the UAE.
 *
 * The `lifting-rigging` category was created and published by wave 1, so this
 * runner does not touch it. Same importer contract as every wave.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-3/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-3/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-09-28-blog-lifting-wave-3/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import SLING_ANGLE from './articles/sling-angle-chart'
import WIRE_ROPE_CLIPS from './articles/wire-rope-clips-installation'
import UAE_INSPECTION from './articles/lifting-equipment-inspection-uae'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [SLING_ANGLE, WIRE_ROPE_CLIPS, UAE_INSPECTION]

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
