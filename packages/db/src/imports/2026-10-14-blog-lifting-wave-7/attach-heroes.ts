/**
 * Attaches lifting wave 7 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'shackle-buying-guide-uae', media: 'hero-shackle-buying', caption: 'The receiving check at the site store is where a vague purchase order gets found out.' },
  { slug: 'g-209-vs-g-2130-vs-g-213-shackle', media: 'hero-g209-g2130-g213', caption: 'Screw pin, bolt type and round pin: the same rating table, three different jobs.' },
  { slug: 'how-to-rig-a-shackle-correctly', media: 'hero-side-loading', caption: 'Pin on the lug, slings in the bow: the arrangement a shackle is rated for.' },
  { slug: 'shackle-markings-explained', media: 'hero-shackle-markings', caption: 'The forged marks are what an inspector reads and what the certificate refers to.' },
  { slug: 'commercial-grade-vs-lifting-grade-shackles', media: 'hero-commercial-vs-lifting', caption: 'Same shape, different job: forged and rated on the left, light commercial hardware on the right.' },
  { slug: 'bs-3032-din-82101-as-2741-shackles', media: 'hero-bs-din-as-shackles', caption: 'British, German and Australian patterns all turn up on Gulf projects, and none is a G-209 by another name.' },
  { slug: 'how-to-choose-and-tension-a-turnbuckle', media: 'hero-turnbuckle-selection', caption: 'Hook, eye and jaw ends change a turnbuckle’s rating more than its thread size does.' },
  { slug: 'din-1480-vs-din-1478-turnbuckle', media: 'hero-din1480-din1478', caption: 'Open frame or closed body: the two German standards behind most metric turnbuckles.' },
  { slug: 'turnbuckles-for-guy-wires-and-cable-bracing', media: 'hero-guy-wire-bracing', caption: 'A guy line is a chain of parts — anchor, turnbuckle, thimble, clips and rope — only as strong as the weakest.' },
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
