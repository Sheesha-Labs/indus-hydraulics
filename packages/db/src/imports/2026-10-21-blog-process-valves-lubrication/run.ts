/**
 * Process valves and lubrication (2026-10-21, blog linkage wave 6): articles linking the safety relief, cryogenic,
 * industrial gate/globe/check, floating and trunnion ball, actuated, subsea, control, waterworks, power and oxygen-service
 * valves, and the lubrication pumps and lubricators, that had no article. Listing errors found in research were corrected first with
 * src/scripts/fix-process-valve-lube-listings-2026-10-21.ts.
 *
 * Research notes (maker data sheets and standards summaries, every fact sourced) are summarised in each article's
 * header; figures not traceable to a source were left out. Heroes are attached afterwards with
 * src/scripts/attach-blog-hero-images.ts.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-process-valves-lubrication/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-process-valves-lubrication/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'

import type { BlogArticleSeed } from './shared'
import SAFETY_RELIEF from './articles/safety-relief-valve-types'
import CRYOGENIC from './articles/cryogenic-valves-explained'
import GATE_GLOBE from './articles/api-600-602-603-gate-and-globe-valves'
import CHECK from './articles/industrial-check-valve-types'
import BALL from './articles/floating-vs-trunnion-mounted-ball-valves'
import CENTRAL_LUBE from './articles/centralised-lubrication-systems'
import DRUM_PUMPS from './articles/grease-and-oil-drum-pumps-and-manual-lubricators'
import CONTROL from './articles/control-valve-types-and-trim'
import WATERWORKS from './articles/waterworks-valves-guide'

export const ARTICLES: BlogArticleSeed[] = [SAFETY_RELIEF, CRYOGENIC, GATE_GLOBE, CHECK, BALL, CENTRAL_LUBE, DRUM_PUMPS, CONTROL, WATERWORKS]

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
