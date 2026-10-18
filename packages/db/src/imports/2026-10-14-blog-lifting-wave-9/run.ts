/**
 * Lifting & rigging, wave 9 — compliance and buying: lifting equipment register (UAE), ASME B30.26,
 * rigging RFQ checklist, Saudi SASO lifting regulation, GCC lifting rules overview, proof load
 * testing, counterfeit rigging hardware.
 *
 * `lifting-rigging` category. Published 2026-10-14 without images (no image credits); heroes can be
 * added later with ./attach-heroes.ts once ./media.ts is filled.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import REGISTER from './articles/lifting-equipment-register-uae'
import B3026 from './articles/asme-b30-26-rigging-hardware-explained'
import RFQ from './articles/rigging-hardware-rfq-checklist'
import SAUDI from './articles/lifting-equipment-rules-saudi-arabia'
import GCC from './articles/lifting-equipment-rules-gcc'
import PROOF from './articles/proof-load-testing-lifting-gear'
import COUNTERFEIT from './articles/how-to-spot-counterfeit-rigging-hardware'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [
  REGISTER,
  B3026,
  RFQ,
  SAUDI,
  GCC,
  PROOF,
  COUNTERFEIT,
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
