/**
 * Lifting & rigging, wave 4 — eye bolts, sling types, the sling colour code and turnbuckles.
 *
 * The `lifting-rigging` category was created and published by wave 1, so this
 * runner does not touch it. Same importer contract as every wave.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-4/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-4/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-01-blog-lifting-wave-4/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import EYE_BOLTS from './articles/eye-bolt-types-and-angled-loads'
import SLING_TYPES from './articles/types-of-lifting-slings'
import COLOUR_CODE from './articles/sling-colour-code-chart'
import TURNBUCKLES from './articles/turnbuckle-types'

import type { BlogArticleSeed } from './shared'

const ARTICLES: BlogArticleSeed[] = [EYE_BOLTS, SLING_TYPES, COLOUR_CODE, TURNBUCKLES]

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
