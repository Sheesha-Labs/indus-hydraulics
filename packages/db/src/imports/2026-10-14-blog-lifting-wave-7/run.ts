/**
 * Lifting & rigging, wave 7 — shackles and turnbuckles for contractors: shackle buying guide,
 * G-209 vs G-2130 vs G-213, rigging a shackle, markings, commercial vs lifting grade, non-US shackle
 * standards, choosing and tensioning turnbuckles, DIN 1480 vs DIN 1478, guy wires and bracing.
 *
 * `lifting-rigging` category; figures inline (Media ids in ./media.ts); heroes attached afterwards by
 * ./attach-heroes.ts. Images generated with GPT Image 2 via kie.ai.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import BUYING from './articles/shackle-buying-guide-uae'
import PATTERNS from './articles/g-209-vs-g-2130-vs-g-213-shackle'
import RIGGING from './articles/how-to-rig-a-shackle-correctly'
import MARKINGS from './articles/shackle-markings-explained'
import COMMERCIAL from './articles/commercial-grade-vs-lifting-grade-shackles'
import STANDARDS from './articles/bs-3032-din-82101-as-2741-shackles'
import TURNBUCKLE from './articles/how-to-choose-and-tension-a-turnbuckle'
import DIN from './articles/din-1480-vs-din-1478-turnbuckle'
import GUY from './articles/turnbuckles-for-guy-wires-and-cable-bracing'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  BUYING,
  PATTERNS,
  RIGGING,
  MARKINGS,
  COMMERCIAL,
  STANDARDS,
  TURNBUCKLE,
  DIN,
  GUY,
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
