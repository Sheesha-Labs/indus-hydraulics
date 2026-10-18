/**
 * Attaches wave 2 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'construction-dewatering-hose-gcc', media: 'hero-dewatering-gcc', caption: 'Wellpoints draw down the water table along the excavation; lay flat hose carries the pump discharge to the settlement tank.' },
  { slug: 'dewatering-discharge-permits-dubai-qatar', media: 'hero-dewatering-discharge', caption: 'The settlement tank is where the permit and the hose layout meet: sand out, clear water to the approved outfall.' },
  { slug: 'frac-water-transfer-lay-flat-hose', media: 'hero-frac-water', caption: 'Parallel large-bore lines carry water from the storage pond to the frac spread at the rate the blender demands.' },
  { slug: 'antistatic-fuel-transfer-hose-guide', media: 'hero-fuel-transfer', caption: 'The earthing cable goes on before any valve opens — a temporary fuel line is only as safe as its electrical path.' },
  { slug: 'fire-hose-requirements-uae-civil-defence', media: 'hero-fire-code-uae', caption: 'Hose reels and landing valves in Gulf buildings are specified, installed and maintained under the civil defence code.' },
  { slug: 'single-vs-double-jacket-fire-hose', media: 'hero-single-double-jacket', caption: 'Same bore, different jobs: double jacket for hard-worked attack lines, single jacket where light weight and compact storage matter.' },
  { slug: 'fire-hose-liner-materials', media: 'hero-fire-liners', caption: 'The jacket carries the pressure; the liner inside decides how the hose ages and what it tolerates.' },
  { slug: 'fire-hose-cabinet-maintenance', media: 'hero-fire-cabinet-maintenance', caption: 'A cabinet hose may wait years for its one emergency — inspection is what makes sure it works when it is pulled.' },
  { slug: 'flexible-borehole-riser-vs-steel-column-pipe', media: 'hero-borehole-riser', caption: 'A flexible riser comes out of the well in one length, with no joints to corrode in saline groundwater.' },
  { slug: 'lay-flat-hose-in-gulf-heat', media: 'hero-gulf-heat', caption: 'Empty hose on sun-baked ground is the hardest condition a Gulf summer offers — flowing water keeps a line cool.' },
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
