/**
 * Links five existing articles into wave 3: one sentence in the body where the topic meets lay flat
 * hose, and the wave’s articles at the head of each `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS, so a re-run of the 2026-10-06 pillar-backlinks
 * script keeps them. The sentence is skipped when the post already links its first target, so a
 * re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-blog-lay-flat-wave-3/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'storz-coupling-sizes',
    html: 'Storz couplings also run to large bores on lay flat lines for flood pumping and water transfer; see <a href="/blog/flood-response-pumping-lay-flat-hose">flood response pumping with lay flat hose</a>, and how the fire hose they join is specified in <a href="/blog/fire-hose-standards-en-14540-bs-6391-nfpa">fire hose standards compared</a>.',
    related: ['flood-response-pumping-lay-flat-hose', 'fire-hose-standards-en-14540-bs-6391-nfpa'],
  },
  {
    slug: 'concrete-pump-hydraulic-hose',
    html: 'At the other end of the pump, the concrete itself leaves through a placement hose; see <a href="/blog/concrete-placement-hose-guide">concrete placement hose: pressure classes and hose whip</a>.',
    related: ['concrete-placement-hose-guide'],
  },
  {
    slug: 'tractor-hydraulic-hose',
    html: 'Tractor hydraulics also drive the reels and hose movers of slurry umbilical systems; see the <a href="/blog/slurry-umbilical-system-guide">slurry umbilical system guide</a>.',
    related: ['slurry-umbilical-system-guide'],
  },
  {
    slug: 'quarry-and-crusher-fittings',
    html: 'Pits and quarries also pump water continuously; see <a href="/blog/mine-dewatering-lay-flat-hose">mine dewatering hose</a> for the hose side.',
    related: ['mine-dewatering-lay-flat-hose'],
  },
  {
    slug: 'copper-mine-hydraulic-fittings',
    html: 'For the water side of the mine — sump pumps, pit dewatering and acid mine water — see <a href="/blog/mine-dewatering-lay-flat-hose">mine dewatering hose: TPU vs NBR lay flat</a>.',
    related: ['mine-dewatering-lay-flat-hose'],
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
