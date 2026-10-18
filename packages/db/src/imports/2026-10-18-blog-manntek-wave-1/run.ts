/**
 * MannTek blog wave 1 (2026-10-18): dry disconnect vs camlock, LPG dry gas couplings and ACME, choosing a safety
 * breakaway coupling, LNG bunkering couplings. Links into the MannTek shelves, products and the LNG & Future Fuels
 * industry page.
 *
 * Heroes reuse the MannTek product Media already uploaded for the listings (Indus is an authorised MannTek
 * distributor with permission to use MannTek imagery); the reader captions say why each picture is there.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-18-blog-manntek-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-18-blog-manntek-wave-1/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import CAMLOCK from './articles/dry-disconnect-vs-camlock-couplings'
import LPG from './articles/lpg-dry-gas-couplings-and-acme'
import BREAKAWAY from './articles/how-to-choose-a-safety-breakaway-coupling'
import LNG from './articles/lng-bunkering-couplings-iso-21593'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [CAMLOCK, LPG, BREAKAWAY, LNG]

/** Media rows created by the MannTek catalogue imports, matched on originalFilename. */
const HEROES: { slug: string; file: string; caption: string }[] = [
  { slug: CAMLOCK.slug, file: 'manntek-ddctank4.jpg', caption: 'A dry disconnect closes both halves before they part, so the hose leaves the tanker empty-handed.' },
  { slug: LPG.slug, file: 'manntek-dgc-tu-and-hu.jpg', caption: 'A dry gas coupling puts a valve in each half of the LPG joint, so nothing vents on disconnect.' },
  { slug: BREAKAWAY.slug, file: 'manntek-sbc.jpg', caption: 'The planned weak link: a breakaway separates under excess pull and closes both halves.' },
  { slug: LNG.slug, file: 'manntek-dcc2.jpg', caption: 'At cryogenic temperatures the coupling has to seal through cool-down and still part cleanly.' },
]

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

  for (const h of HEROES) {
    const media = await db.media.findFirst({ where: { originalFilename: h.file, kind: 'image' }, select: { id: true } })
    if (!media) throw new Error(`hero media missing: ${h.file}`)
    if (DRY_RUN) {
      console.log(`[dry-run] hero ${h.slug} ← ${h.file}`)
      continue
    }
    const post = await db.blogPost.findUnique({ where: { slug: h.slug }, select: { id: true, heroId: true } })
    if (!post) continue
    if (post.heroId && post.heroId !== media.id) {
      console.log(`  ! ${h.slug}: has a different hero, left alone`)
      continue
    }
    await db.blogPost.update({ where: { id: post.id }, data: { heroId: media.id, heroCaption: h.caption } })
    console.log(`  ✓ hero ${h.slug}`)
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
