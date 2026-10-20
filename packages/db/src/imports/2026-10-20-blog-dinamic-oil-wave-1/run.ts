/**
 * Dinamic Oil blog wave 1 (2026-10-20): planetary gearbox selection, hydraulic winch sizing, gearbox oil in hot
 * climates, winch drive vs motor drum vs complete winch, slewing drive selection, and class approvals for crane
 * gearboxes. Links into the Dinamic Oil shelves and products (Gearboxes & Winches) and the industry pages.
 *
 * Heroes reuse the Dinamic Oil product Media already uploaded for the listings (Indus is an authorised Dinamic Oil
 * distributor with permission to use its imagery); the reader captions say why each picture is there.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-20-blog-dinamic-oil-wave-1/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-20-blog-dinamic-oil-wave-1/run.ts --publish
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { runBlogArticleImport } from '../blog-article-import'
import GEARBOX from './articles/how-to-select-a-planetary-gearbox'
import WINCH from './articles/hydraulic-winch-sizing'
import OIL from './articles/planetary-gearbox-oil-in-hot-climates'
import DRIVES from './articles/winch-drive-vs-motor-drum-vs-complete-winch'
import SLEWING from './articles/slewing-drive-selection-guide'
import CLASS from './articles/dnv-type-approval-crane-gearboxes'

import type { BlogArticleSeed } from './shared'

export const ARTICLES: BlogArticleSeed[] = [GEARBOX, WINCH, OIL, DRIVES, SLEWING, CLASS]

/** Media rows created by the Dinamic Oil catalogue imports, matched on originalFilename. */
const HEROES: { slug: string; file: string; caption: string }[] = [
  { slug: GEARBOX.slug, file: 'dinamic-oil-re-planetary-gearbox-2.jpg', caption: 'Torque, ratio, heat and brake: a planetary gearbox has to pass all four checks, not just the first.' },
  { slug: WINCH.slug, file: 'dinamic-oil-srd-series-hydraulic-winch.jpg', caption: 'The headline pull is the first layer. The lift is often made from the top one.' },
  { slug: OIL.slug, file: 'dinamic-oil-gb-planetary-gearbox.jpg', caption: 'A gearbox in continuous summer duty is limited by how much heat its oil can shed.' },
  { slug: DRIVES.slug, file: 'dinamic-oil-wdd-motorized-winch-drum.jpg', caption: 'A motor drum: the planetary drive is already inside the drum, so only the frame is left to design.' },
  { slug: SLEWING.slug, file: 'dinamic-oil-re-slewing-gearbox-mobile-crane.jpg', caption: 'The pinion and its support often limit a slewing drive before the gears do.' },
  { slug: CLASS.slug, file: 'dinamic-oil-wd-4803-planetary-winch-drive.jpg', caption: 'The WD winch drive sizes on this certificate list each ratio with its approved torque.' },
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
