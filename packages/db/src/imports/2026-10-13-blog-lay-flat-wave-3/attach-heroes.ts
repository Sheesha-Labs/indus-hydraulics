/**
 * Attaches wave 3 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'slurry-umbilical-system-guide', media: 'hero-umbilical', caption: 'The tractor carries no load: slurry arrives by hose, so the field sees one light machine instead of a tanker shuttle.' },
  { slug: 'low-emission-slurry-spreading-rules-europe', media: 'hero-less-rules', caption: 'A trailing shoe places slurry at the base of the grass, where far less of its nitrogen escapes as ammonia.' },
  { slug: 'slurry-drag-hose-sizing-and-life', media: 'hero-drag-hose', caption: 'The drag hose is pulled and turned all day — its bore sets the pump’s work and its handling sets its life.' },
  { slug: 'overland-pumping-water-main-bypass', media: 'hero-overpumping', caption: 'Over-pumping carries the flow around the work, from the manhole upstream to one downstream, while the sewer is repaired.' },
  { slug: 'fire-hose-standards-en-14540-bs-6391-nfpa', media: 'hero-fire-standards', caption: 'Hose that looks alike on the shelf may be built to quite different standards — the specification starts with naming the right one.' },
  { slug: 'flood-response-pumping-lay-flat-hose', media: 'hero-flood', caption: 'In a flood the pump sets the potential flow; the hose bore and length decide how much of it reaches the river.' },
  { slug: 'mine-dewatering-lay-flat-hose', media: 'hero-mine-dewatering', caption: 'In a pit, most of the pressure a dewatering line carries is lift from the sump to the rim.' },
  { slug: 'snowmaking-hose-guide', media: 'hero-snowmaking', caption: 'The hose between hydrant and gun is handled at the coldest hour, on ice — it has to stay flexible and visible.' },
  { slug: 'irrigation-lay-flat-hose-guide', media: 'hero-irrigation', caption: 'A lay flat sub-main along the head of the rows feeds every drip line in the block.' },
  { slug: 'concrete-placement-hose-guide', media: 'hero-concrete', caption: 'The flexible end hose is where the placing crew stands — its rating and handling rules matter most.' },
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
