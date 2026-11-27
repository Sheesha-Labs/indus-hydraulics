/**
 * DEMCO blog wave (2026-11-27). Six new articles and two corrected ones, written from the DEMCO
 * gate-style valve catalogue (2020) and butterfly-style valve brochure (2018) loaded the same day by
 * `data/catalogue-demco-*`. Topics: gate vs butterfly, DM 5000 vs DM 7500, DM part-number decoding,
 * butterfly seat replacement, butterfly torque and actuator sizing, Middle East applications.
 *
 * Two existing posts are rewritten in place (upsert by slug keeps their publication date):
 *   - demco-butterfly-valve-part-numbers: the 2018 brochure gives NE-C body code 2 as ductile iron
 *     (wafer), not grey iron, and adds fire-safe F0 and marine certification suffixes.
 *   - mud-gate-valve-repair-kits: every kit number per size and family from the catalogue; links to
 *     the new kit listings.
 *
 * Every figure is from the two catalogues (page references in each article's header comment).
 * Load AFTER the DEMCO products, because the articles embed their SKUs.
 *
 *   tsx src/imports/2026-11-27-demco-blog/run.ts --dry-run
 *   tsx src/imports/2026-11-27-demco-blog/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import { ARTICLES } from './articles'

const DRY_RUN = process.argv.includes('--dry-run')
const PUBLISH = process.argv.includes('--publish')

async function main(): Promise<void> {
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
