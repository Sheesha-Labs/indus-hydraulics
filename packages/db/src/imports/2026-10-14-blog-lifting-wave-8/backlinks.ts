/**
 * Links six existing lifting articles into lifting wave 8: one sentence in the body where the topic meets lay flat
 * hose, and the wave’s articles at the head of each `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS, so a re-run of the 2026-10-06 pillar-backlinks
 * script keeps them. The sentence is skipped when the post already links its first target, so a
 * re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-8/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'types-of-lifting-slings',
    html: 'For what a site actually stocks, see the <a href="/blog/site-mobilisation-rigging-kit">site mobilisation rigging kit</a> and <a href="/blog/tower-crane-rigging-gear">tower crane rigging gear</a>.',
    related: ['site-mobilisation-rigging-kit', 'tower-crane-rigging-gear'],
  },
  {
    slug: 'chain-block-vs-lever-hoist-vs-electric-hoist',
    html: 'Where these hoists earn their keep on projects: <a href="/blog/shutdown-and-turnaround-rigging">shutdown and turnaround rigging</a> and <a href="/blog/lifting-chillers-and-rooftop-plant">lifting chillers and rooftop plant</a>.',
    related: ['shutdown-and-turnaround-rigging', 'lifting-chillers-and-rooftop-plant'],
  },
  {
    slug: 'precast-concrete-lifting-clutch',
    html: 'For the slings, links and multi-leg rules above the clutch, see <a href="/blog/precast-panel-and-beam-rigging">precast panel and beam rigging</a>.',
    related: ['precast-panel-and-beam-rigging'],
  },
  {
    slug: 'stainless-vs-galvanized-rigging-gulf',
    html: 'For rigging on jetties, quays and barges, see <a href="/blog/jetty-and-marine-construction-rigging">rigging for jetty and marine construction</a>.',
    related: ['jetty-and-marine-construction-rigging'],
  },
  {
    slug: 'lifting-equipment-inspection-uae',
    html: 'Setting up the register and loft on a new site is covered in the <a href="/blog/site-mobilisation-rigging-kit">site mobilisation rigging kit</a>; daily checks for crane crews in <a href="/blog/tower-crane-rigging-gear">tower crane rigging gear</a>.',
    related: ['site-mobilisation-rigging-kit', 'tower-crane-rigging-gear'],
  },
  {
    slug: 'vertical-vs-horizontal-plate-lifting-clamps',
    html: 'For the rest of a steel erection crew’s kit, see <a href="/blog/steel-erection-rigging-equipment">steel erection rigging equipment</a>.',
    related: ['steel-erection-rigging-equipment'],
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
