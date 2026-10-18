/**
 * Attaches wave 4 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-4/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'lay-flat-hose-size-chart', media: 'hero-size-chart', caption: 'Nominal size, DN, bore and flat width all describe the same hose — the chart lines them up.' },
  { slug: 'how-to-repair-lay-flat-hose', media: 'hero-repair', caption: 'Most damage is local: cut out the bad section square and re-couple, and one damaged length becomes two good ones.' },
  { slug: 'how-to-roll-and-store-lay-flat-hose', media: 'hero-roll-store', caption: 'Drained, rolled tight from the far end and stored dry in shade, lay flat comes out ready for the next job.' },
  { slug: 'well-riser-hose-installation', media: 'hero-riser-install', caption: 'Pump, cable and riser go down the well together from the reel, under control all the way.' },
  { slug: 'compressed-air-lay-flat-hose', media: 'hero-compressed-air', caption: 'Air is the power supply at the face — and the energy it stores is why every joint must be restrained.' },
  { slug: 'drinking-water-hose-nsf-61', media: 'hero-drinking-water', caption: 'Blue identifies drinking-water hose; the certificate and listing behind it are what make it fit for the job.' },
  { slug: 'lay-flat-hose-rfq-checklist', media: 'hero-rfq-checklist', caption: 'Bore, wall, length, pressure and couplings: the measurements that turn an enquiry into an accurate quote.' },
  { slug: 'forestry-fire-hose-guide', media: 'hero-forestry', caption: 'Wildland crews carry their hose: light single-jacket lines laid up hillsides from portable pumps.' },
]

async function main(): Promise<void> {
  for (const h of HEROES) {
    const heroId = FIG[h.media]
    if (!heroId) throw new Error(`no media id for ${h.media}`)
    const post = await db.blogPost.findUnique({ where: { slug: h.slug }, select: { id: true, heroId: true } })
    if (!post) {
      console.log(`  ! ${h.slug}: not imported yet`)
      continue
    }
    if (post.heroId && post.heroId !== heroId) {
      console.log(`  ! ${h.slug}: has a different hero — left alone`)
      continue
    }
    await db.blogPost.update({ where: { id: post.id }, data: { heroId, heroCaption: h.caption } })
    console.log(`  ✓ ${h.slug}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
