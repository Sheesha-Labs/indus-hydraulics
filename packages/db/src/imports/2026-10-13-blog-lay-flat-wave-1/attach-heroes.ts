/**
 * Attaches wave 1 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'lay-flat-hose-guide', media: 'hero-lay-flat-hose-guide', caption: 'Lay flat hose carries a dewatering pump’s discharge across a construction site in long, joint-free lengths.' },
  { slug: 'tpu-vs-nbr-vs-pvc-lay-flat-hose', media: 'hero-tpu-vs-nbr-vs-pvc', caption: 'TPU, nitrile rubber and PVC lay flat look alike on the shelf and behave very differently in service.' },
  { slug: 'lay-flat-hose-pressure-ratings', media: 'hero-pressure-ratings', caption: 'The highest pressure on a lay flat line is at the pump discharge — the point every rating must be checked against.' },
  { slug: 'lay-flat-hose-flow-and-friction-loss', media: 'hero-flow-friction', caption: 'Over long distances the bore, not the pump, decides how much water arrives at the far end.' },
  { slug: 'lay-flat-hose-couplings-guide', media: 'hero-couplings', caption: 'Each coupling family suits a different connection, and the choice sets assembly speed and pressure limit.' },
  { slug: 'lay-flat-hose-vs-hdpe-pipe', media: 'hero-vs-hdpe', caption: 'For a temporary line, a reel of lay flat goes down in a fraction of the time it takes to join and lay pipe.' },
  { slug: 'why-lay-flat-hose-fails', media: 'hero-why-fails', caption: 'Most lay flat failures start at the folds and the cover, where handling does its damage long before pressure does.' },
  { slug: 'suction-hose-vs-lay-flat-hose', media: 'hero-suction-vs-layflat', caption: 'Rigid-helix hose on the suction, lay flat on the discharge: the standard layout for a dewatering pump.' },
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
