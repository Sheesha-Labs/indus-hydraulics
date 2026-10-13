/**
 * Links five existing articles into wave 2: one sentence in the body where the topic meets lay flat
 * hose, and the wave’s articles at the head of each `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS, so a re-run of the 2026-10-06 pillar-backlinks
 * script keeps them. The sentence is skipped when the post already links its first target, so a
 * re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-2/backlinks.ts --backup=/path/backup.json
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
    html: 'On Gulf construction sites, where the water table often sits within a couple of metres of the surface, see how a full <a href="/blog/construction-dewatering-hose-gcc">construction dewatering hose system</a> is put together, and what the <a href="/blog/dewatering-discharge-permits-dubai-qatar">discharge permit in Dubai, Abu Dhabi or Qatar</a> asks for.',
    related: ['construction-dewatering-hose-gcc', 'dewatering-discharge-permits-dubai-qatar'],
  },
  {
    slug: 'oil-suction-and-discharge-hose',
    html: 'Static is the hazard every fuel line shares: our <a href="/blog/antistatic-fuel-transfer-hose-guide">antistatic fuel transfer hose guide</a> explains M and Ω hose and how to bond and earth a temporary line.',
    related: ['antistatic-fuel-transfer-hose-guide'],
  },
  {
    slug: 'well-service-and-stimulation-hose',
    html: 'For sizing those water lines — flow in barrels a minute, friction per kilometre, pressure and couplings — see <a href="/blog/frac-water-transfer-lay-flat-hose">frac water transfer with lay flat hose</a>.',
    related: ['frac-water-transfer-lay-flat-hose'],
  },
  {
    slug: 'hydraulic-hose-in-uae-heat',
    html: 'Lay flat water and fuel hose faces the same summer from the outside in; see <a href="/blog/lay-flat-hose-in-gulf-heat">lay flat hose in Gulf heat</a>.',
    related: ['lay-flat-hose-in-gulf-heat'],
  },
  {
    slug: 'water-well-drilling-rig-fittings',
    html: 'Once the well is drilled, the pump often goes in on a flexible riser rather than steel column pipe; see <a href="/blog/flexible-borehole-riser-vs-steel-column-pipe">flexible borehole riser hose vs steel column pipe</a>.',
    related: ['flexible-borehole-riser-vs-steel-column-pipe'],
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
