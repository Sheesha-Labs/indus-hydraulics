/**
 * Attaches lifting wave 8 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'site-mobilisation-rigging-kit', media: 'hero-mobilisation-kit', caption: 'A matched, registered rigging loft on day one sets the habits for the whole project.' },
  { slug: 'steel-erection-rigging-equipment', media: 'hero-steel-erection', caption: 'Two-leg chain slings and a tag line: the everyday steel lift, landed precisely at height.' },
  { slug: 'precast-panel-and-beam-rigging', media: 'hero-precast-rigging', caption: 'The anchors are cast in; the clutches, slings and links above them decide how the load is shared.' },
  { slug: 'lifting-chillers-and-rooftop-plant', media: 'hero-rooftop-plant', caption: 'A spreader keeps the slings clear of the casing — the maker’s rigging instructions start every plant lift.' },
  { slug: 'tower-crane-rigging-gear', media: 'hero-tower-crane', caption: 'A small kit, used hundreds of times a week: the tower crane crew’s slings, shackles and tag lines.' },
  { slug: 'shutdown-and-turnaround-rigging', media: 'hero-shutdown', caption: 'Where no crane can reach, chain blocks on beam trolleys do the shutdown’s lifting.' },
  { slug: 'cable-pulling-socks-and-grips', media: 'hero-cable-pulling', caption: 'The cable sock is the one part of the pull that touches the cable — size it, fit it and swivel it.' },
  { slug: 'jetty-and-marine-construction-rigging', media: 'hero-marine-construction', caption: 'Salt, tides and barge motion: marine works are the hardest environment on any site for rigging.' },
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
