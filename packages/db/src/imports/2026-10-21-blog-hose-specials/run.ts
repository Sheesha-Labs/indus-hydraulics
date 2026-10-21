/**
 * Hose specials (2026-10-21): articles linking the marine hose and specialty metal hose, guard and
 * insulation listings that had no article. Metallic listings were rewritten against maker data first with
 * src/scripts/fix-hose-listings-2026-10-21.ts; listings that could not be confirmed are held (held.ts).
 *
 * Research notes (maker data sheets and trade press, every fact sourced) are summarised in each article's header;
 * figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hose-specials/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-hose-specials/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import MARINE from './articles/marine-hose-fuel-exhaust-and-bilge'
import FIRE from './articles/fire-sleeves-and-metal-hose-guards'
import SPECIALTY from './articles/cryogenic-jacketed-and-heated-metal-hose'

export const ARTICLES: BlogArticleSeed[] = [MARINE, FIRE, SPECIALTY]

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
