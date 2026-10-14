/**
 * Links six existing lifting articles into lifting wave 10: one sentence in the body where the topic
 * meets the new chain, hardware and trolley articles, and those articles at the head of each
 * `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS (or the post's own seed, where it has no entry), so
 * a re-run of either keeps them. The sentence is skipped when the post already links its first
 * target, so a re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-10/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'chain-grades-explained',
    html: 'Choosing between the two lifting grades is covered in <a href="/blog/grade-80-vs-grade-100-chain-slings">Grade 80 vs Grade 100 chain slings</a>; for corrosive or clean areas, see <a href="/blog/stainless-steel-lifting-chain">stainless steel lifting chain</a>.',
    related: ['grade-80-vs-grade-100-chain-slings', 'stainless-steel-lifting-chain', 'working-load-limit-vs-breaking-strength', 'types-of-lifting-slings', 'din-link-chain-standards', 'sling-angle-chart'],
  },
  {
    slug: 'master-links-explained',
    html: 'How the master link is joined to the chain and the hooks is covered in <a href="/blog/hammerlock-vs-clevis-chain-fittings">hammerlocks, clevis fittings and connecting links</a>.',
    related: ['hammerlock-vs-clevis-chain-fittings', 'grade-80-vs-grade-100-chain-slings', 'sling-angle-chart', 'lifting-hook-types', 'chain-grades-explained', 'types-of-lifting-slings'],
  },
  {
    slug: 'lifting-hook-types',
    html: 'Whether a swivel hook may turn under load is covered in <a href="/blog/lifting-swivels-explained">lifting swivels explained</a>; grab hooks used to shorten legs in <a href="/blog/chain-sling-shortening-clutches-and-grab-hooks">shortening a chain sling</a>.',
    related: ['lifting-swivels-explained', 'chain-sling-shortening-clutches-and-grab-hooks', 'master-links-explained', 'lifting-gear-rejection-criteria', 'chain-grades-explained', 'types-of-shackles'],
  },
  {
    slug: 'chain-sling-codes-explained',
    html: 'The shorteners and connectors behind the codes are covered in <a href="/blog/chain-sling-shortening-clutches-and-grab-hooks">shortening a chain sling</a> and <a href="/blog/hammerlock-vs-clevis-chain-fittings">hammerlocks, clevis fittings and connecting links</a>.',
    related: ['chain-sling-shortening-clutches-and-grab-hooks', 'hammerlock-vs-clevis-chain-fittings', 'chain-grades-explained', 'sling-angle-chart', 'master-links-explained', 'lifting-hook-types'],
  },
  {
    slug: 'chain-block-vs-lever-hoist-vs-electric-hoist',
    html: 'To run a chain block or electric hoist along an I-beam, see the <a href="/blog/beam-trolley-guide">beam trolley guide</a>.',
    related: ['beam-trolley-guide', 'shutdown-and-turnaround-rigging', 'lifting-chillers-and-rooftop-plant', 'snatch-block-vs-pulley-block', 'lifting-hook-types', 'lifting-equipment-inspection-uae'],
  },
  {
    slug: 'stainless-vs-galvanized-rigging-gulf',
    html: 'For stainless chain that carries a lifting rating, and how it compares with Grade 80, see <a href="/blog/stainless-steel-lifting-chain">stainless steel lifting chain</a>.',
    related: ['stainless-steel-lifting-chain', 'jetty-and-marine-construction-rigging', 'types-of-shackles', 'chain-grades-explained', 'wire-rope-eye-terminations', 'why-fittings-seize-in-coastal-air'],
  },
  {
    slug: 'how-to-rig-a-shackle-correctly',
    html: 'For the cotters and retaining pins that keep shackle bolts and nuts in place, see <a href="/blog/lynch-pins-r-clips-and-wire-lock-pins">lynch pins, R-clips and wire lock pins</a>.',
    related: ['lynch-pins-r-clips-and-wire-lock-pins', 'g-209-vs-g-2130-vs-g-213-shackle', 'sling-angle-chart', 'shackle-buying-guide-uae', 'lifting-gear-rejection-criteria', 'types-of-shackles'],
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
