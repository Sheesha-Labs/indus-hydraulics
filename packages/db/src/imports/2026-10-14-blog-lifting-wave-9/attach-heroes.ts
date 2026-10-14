/**
 * Attaches lifting wave 9 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'lifting-equipment-register-uae', media: 'hero-lifting-register', caption: 'Every item tagged, every tag in the register: the record an auditor asks for first.' },
  { slug: 'asme-b30-26-rigging-hardware-explained', media: 'hero-asme-b30-26', caption: 'Shackles, links, swivels and turnbuckles: the hardware ASME B30.26 covers, and the checks it sets.' },
  { slug: 'rigging-hardware-rfq-checklist', media: 'hero-rigging-rfq', caption: 'Pattern, pin, grade and length: a specific enquiry gets the right item quoted first time.' },
  { slug: 'lifting-equipment-rules-saudi-arabia', media: 'hero-saudi-lifting-rules', caption: 'In Saudi Arabia the national regulation is the floor; the client’s standards set the site rules.' },
  { slug: 'lifting-equipment-rules-gcc', media: 'hero-gcc-lifting-rules', caption: 'One contractor, six countries, several rulebooks — and the client contract on top of each.' },
  { slug: 'proof-load-testing-lifting-gear', media: 'hero-proof-load-test', caption: 'A proof test proves this item was made right — it does not raise its working load limit.' },
  { slug: 'how-to-spot-counterfeit-rigging-hardware', media: 'hero-counterfeit-hardware', caption: 'Read every mark: a forged rating is a rating nobody tested.' },
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
