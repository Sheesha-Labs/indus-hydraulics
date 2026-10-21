/**
 * Valves (2026-10-21): articles linking the butterfly, mobile hydraulic, relief, instrumentation, globe and
 * surface safety valves (and their accessories and ESD panel) that had no article. Listing errors found in research
 * were corrected first with src/scripts/fix-valve-listings-2026-10-21.ts.
 *
 * Research notes (maker data sheets and trade press, every fact sourced) are summarised in each article's header;
 * figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-valves/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-valves/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import BUTTERFLY from './articles/butterfly-valves-wafer-lug-and-grooved'
import MOBILE from './articles/mobile-hydraulic-control-valves-guide'
import PRV from './articles/oilfield-pressure-relief-valves'
import INSTRUMENT from './articles/needle-globe-and-instrumentation-valves'
import SSV from './articles/surface-safety-valves-and-esd-systems'

export const ARTICLES: BlogArticleSeed[] = [BUTTERFLY, MOBILE, PRV, INSTRUMENT, SSV]

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
