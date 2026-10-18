/**
 * Attaches lifting wave 10 hero images and their reader captions. The images were uploaded to
 * `blog-images/heroes/<slug>.jpg` with their alt text (Media ids in ./media.ts). Idempotent: a post
 * that already has this hero is left alone; one with a different hero is reported, not replaced.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/attach-heroes.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { FIG } from './media'

const HEROES: { slug: string; media: string; caption: string }[] = [
  { slug: 'grade-80-vs-grade-100-chain-slings', media: 'hero-g80-vs-g100', caption: 'Same size, about a quarter more capacity: Grade 100 lets a smaller, lighter sling do the job.' },
  { slug: 'hammerlock-vs-clevis-chain-fittings', media: 'hero-connecting-links', caption: 'Every chain sling is joined somewhere — matched, rated connectors keep the rating intact.' },
  { slug: 'chain-sling-shortening-clutches-and-grab-hooks', media: 'hero-shortening-clutch', caption: 'A shortening clutch evens out the legs without giving away the chain’s rating.' },
  { slug: 'lifting-swivels-explained', media: 'hero-lifting-swivels', caption: 'A swivel lets the rigging untwist — only a bearing swivel is made to turn under load.' },
  { slug: 'beam-trolley-guide', media: 'hero-beam-trolley', caption: 'A trolley on an I-beam turns a chain block into a travelling hoist.' },
  { slug: 'lynch-pins-r-clips-and-wire-lock-pins', media: 'hero-retaining-pins', caption: 'Small, cheap and easy to lose — the pins that keep the load pins in.' },
  { slug: 'stainless-steel-lifting-chain', media: 'hero-stainless-chain', caption: 'Stainless chain lifts where rust and zinc flakes are not welcome — at a lower rating.' },
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
