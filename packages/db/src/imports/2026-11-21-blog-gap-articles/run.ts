/**
 * Search-gap articles (2026-11-21): thirteen articles answering high-demand questions that no live post
 * answered, found by the 2026-11-20 keyword map (Google autocomplete across UAE, US, Saudi Arabia and
 * Nigeria, plus Search Console). Each targets one question for a hose, lifting or pneumatic category —
 * round sling uses, suction vs delivery hose, stainless BSP socket and pipe nipple sizes, hose barb sizes,
 * wire rope ferrules, lay flat hose reels, ratchet straps vs tie-downs, below-the-hook inspection, dust
 * caps, swivel joints, beam clamps and pneumatic coupler profiles — and links back to that category.
 *
 * Figures come from the live listings in each category (specs and size rows) or from the named standard.
 * Every article lives in an existing blog category. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-21-blog-gap-articles/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-21-blog-gap-articles/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { ARTICLES } from './articles'

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
