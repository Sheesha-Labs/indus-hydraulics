/**
 * Dinamic Oil blog wave 2 (2026-10-21): recovery winches for tow trucks, wheel drive selection, sugar mill gearbox
 * drives, and crane winch load monitoring. Links into the Dinamic Oil shelves and products (Gearboxes & Winches,
 * including the new accessories shelf) and the industry pages.
 *
 * Heroes reuse the Dinamic Oil product Media already uploaded for the listings (Indus is an authorised Dinamic Oil
 * distributor with permission to use its imagery); the reader captions say why each picture is there.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-dinamic-oil-wave-2/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-21-blog-dinamic-oil-wave-2/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import RECOVERY from './articles/recovery-winch-for-tow-trucks'
import WHEEL from './articles/wheel-drive-selection-guide'
import SUGAR from './articles/sugar-mill-gearbox-drives'
import MONITOR from './articles/crane-winch-load-monitoring'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [RECOVERY, WHEEL, SUGAR, MONITOR]

/** Media rows created by the Dinamic Oil catalogue imports, matched on originalFilename. */
const HEROES: { slug: string; file: string; caption: string }[] = [
  { slug: RECOVERY.slug, file: 'dinamic-oil-t-series-recovery-winch.jpg', caption: 'A recovery winch pulls, never lifts: motor, brake and gearbox sit as separate modules on the drum.' },
  { slug: WHEEL.slug, file: 'dinamic-oil-ewe-electric-planetary-wheel-drive.jpg', caption: 'The same planetary hub can take a hydraulic motor or a 48/96 V electric one.' },
  { slug: SUGAR.slug, file: 'dinamic-oil-gb-planetary-gearbox-2.jpg', caption: 'Foot-mounted heavy planetary gearboxes like this drive mills and conveyors through a crushing season.' },
  { slug: MONITOR.slug, file: 'dinamic-oil-se-series-hydraulic-winch.jpg', caption: 'The grey box on the frame is part of the load detection system: the winch knows its own line pull.' },
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
