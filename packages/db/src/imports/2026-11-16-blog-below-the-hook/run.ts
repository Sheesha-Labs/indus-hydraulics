/**
 * Below-the-hook lifting (2026-11-16): six original technical articles written the day the
 * Below-the-Hook Lifting group went live (31 listings under Lifting & Rigging) — spreader vs lifting
 * beam, sling angle compression, centre of gravity, spreader misuse, bolted-flange vs end-cap modular
 * beams, and lifting bars for air handling units. All in the existing `lifting-rigging` category.
 *
 * Figures are live listing values from the below-the-hook payload; forces are statics, worked in each
 * article's header comment. Diagrams are inline SVG (./diagrams.ts). Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts. ./fix-older-lifting-posts.ts updates two older posts that
 * said we list no spreader beams.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-16-blog-below-the-hook/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-16-blog-below-the-hook/run.ts --publish
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
