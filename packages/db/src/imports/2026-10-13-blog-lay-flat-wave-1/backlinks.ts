/**
 * Links eight existing articles into wave 1: one sentence in the body where the topic meets lay flat
 * hose, and the wave's articles at the head of each `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS, so a re-run of the 2026-10-06 pillar-backlinks
 * script keeps them. The sentence is skipped when the post already links its first target, so a
 * re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-1/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'water-suction-and-dewatering-hose',
    html: 'On the discharge side, most dewatering lines are lay flat hose. Our <a href="/blog/lay-flat-hose-guide">lay flat hose guide</a> covers the materials and pressure classes, and the <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> shows how to size the line for its length.',
    related: ['suction-hose-vs-lay-flat-hose', 'lay-flat-hose-guide', 'lay-flat-hose-flow-and-friction-loss'],
  },
  {
    slug: 'pvc-or-rubber-suction-hose',
    html: 'The suction hose is half the system: on the discharge side most pumps feed lay flat hose. See <a href="/blog/suction-hose-vs-lay-flat-hose">why lay flat cannot go on the suction</a>, and how <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">TPU, NBR and PVC lay flat hose</a> compare.',
    related: ['suction-hose-vs-lay-flat-hose', 'tpu-vs-nbr-vs-pvc-lay-flat-hose'],
  },
  {
    slug: 'bauer-couplings-explained',
    html: 'On large-bore lay flat lines, Bauer couplings meet grooved, Storz, flanged and high-pressure alternatives; our <a href="/blog/lay-flat-hose-couplings-guide">lay flat hose coupling guide</a> compares them.',
    related: ['lay-flat-hose-couplings-guide'],
  },
  {
    slug: 'industrial-hose-couplings-guide',
    html: 'Large-bore lay flat hose has its own coupling families — forged-shank couplings with bolted clamps, ending in grooved, Storz or flanged connections. See our <a href="/blog/lay-flat-hose-couplings-guide">lay flat hose coupling guide</a>.',
    related: ['lay-flat-hose-couplings-guide'],
  },
  {
    slug: 'industrial-hose-guide',
    html: 'Lay flat hose — the woven-jacket hose that rolls flat for transport and runs out in lengths up to 400 m — has its own guide: <a href="/blog/lay-flat-hose-guide">lay flat hose types, pressure ratings, sizing and couplings</a>.',
    related: ['lay-flat-hose-guide', 'tpu-vs-nbr-vs-pvc-lay-flat-hose'],
  },
  {
    slug: 'well-service-and-stimulation-hose',
    html: 'The frac water itself usually reaches the pad through large-bore TPU lay flat hose rather than rigid pipe. Our comparison of <a href="/blog/lay-flat-hose-vs-hdpe-pipe">lay flat hose and HDPE pipe</a> and the <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> cover how those transfer lines are chosen and sized.',
    related: ['lay-flat-hose-vs-hdpe-pipe', 'lay-flat-hose-flow-and-friction-loss'],
  },
  {
    slug: 'oil-suction-and-discharge-hose',
    html: 'For temporary fuel transfer over longer distances, an <a href="/p/antistatic-tpu-lay-flat-fuel-hose">antistatic TPU lay flat hose</a> with a copper earthing wire in the jacket is an alternative to rigid-wall hose; see <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">TPU vs NBR vs PVC lay flat hose</a>.',
    related: ['tpu-vs-nbr-vs-pvc-lay-flat-hose'],
  },
  {
    slug: 'desalination-and-water-treatment-hose',
    html: 'Temporary bypass and transfer lines around plant work are often run in lay flat hose; see the <a href="/blog/lay-flat-hose-guide">lay flat hose guide</a> and <a href="/blog/lay-flat-hose-pressure-ratings">how its pressure ratings work</a>.',
    related: ['lay-flat-hose-guide', 'lay-flat-hose-pressure-ratings'],
  },
]

/** Generated or closing blocks: the new sentence goes before the first of these. */
const TAIL = new Set(['faq_block', 'product_embed', 'category_link', 'related_articles', 'page_link', 'market_reach', 'as_of_stamp', 'cta_block'])

const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { slug: { in: PLANS.map((p) => p.slug) }, isPublished: true },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const bySlug = new Map(posts.map((p) => [p.slug, p]))
  const backup: Array<{ slug: string; bodyBlocks: unknown }> = []

  for (const plan of PLANS) {
    const post = bySlug.get(plan.slug)
    if (!post) {
      console.log(`  ! ${plan.slug}: not published`)
      continue
    }
    const blocks = [...(post.bodyBlocks as Array<Record<string, unknown>>)]
    const firstHref = /href="([^"]+)"/.exec(plan.html)![1]!
    const already = JSON.stringify(blocks).includes(`href=\\"${firstHref}\\"`)
    if (!already) {
      const at = blocks.findIndex((b) => TAIL.has(b.type as string))
      blocks.splice(at === -1 ? blocks.length : at, 0, { type: 'paragraph', html: plan.html })
    }
    const ri = blocks.findIndex((b) => b.type === 'related_articles')
    if (ri === -1) {
      const ci = blocks.findIndex((b) => b.type === 'cta_block')
      blocks.splice(ci === -1 ? blocks.length : ci, 0, { type: 'related_articles', slugs: plan.related })
    } else {
      const current = (blocks[ri]!.slugs as string[]) ?? []
      blocks[ri] = { ...blocks[ri], slugs: [...new Set([...plan.related, ...current])].slice(0, 6) }
    }
    const parsed = BlogBlocksSchema.safeParse(blocks)
    if (!parsed.success) {
      console.log(`  ✗ ${plan.slug}: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
      process.exitCode = 1
      continue
    }
    backup.push({ slug: plan.slug, bodyBlocks: post.bodyBlocks })
    if (DRY_RUN) {
      console.log(`[dry-run] ${plan.slug}: ${already ? 'sentence present' : 'add sentence'}, related → ${plan.related.join(', ')}`)
      continue
    }
    await db.blogPost.update({ where: { id: post.id }, data: { bodyBlocks: parsed.data as unknown as Prisma.InputJsonValue } })
    console.log(`  ✓ ${plan.slug}`)
  }
  if (BACKUP && !DRY_RUN) writeFileSync(BACKUP, JSON.stringify(backup, null, 1))
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
