/**
 * Links six existing lifting articles into lifting wave 9: one sentence in the body where the topic
 * meets the new compliance and buying articles, and those articles at the head of each
 * `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS (or the post's own seed, where it has no entry), so
 * a re-run of either keeps them. The sentence is skipped when the post already links its first
 * target, so a re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-9/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'lifting-equipment-inspection-uae',
    html: 'What the register itself should record is covered in <a href="/blog/lifting-equipment-register-uae">the lifting equipment register</a>; for Saudi Arabia and the rest of the Gulf, see <a href="/blog/lifting-equipment-rules-gcc">lifting equipment rules across the GCC</a>.',
    related: ['lifting-equipment-register-uae', 'lifting-equipment-rules-gcc', 'site-mobilisation-rigging-kit', 'lifting-gear-rejection-criteria', 'lifting-gear-test-certificate', 'shackle-markings-explained'],
  },
  {
    slug: 'lifting-gear-test-certificate',
    html: 'What the proof load on a certificate does and does not prove is covered in <a href="/blog/proof-load-testing-lifting-gear">proof load testing of lifting gear</a>; checking a certificate against the item in <a href="/blog/how-to-spot-counterfeit-rigging-hardware">how to spot counterfeit rigging hardware</a>.',
    related: ['proof-load-testing-lifting-gear', 'how-to-spot-counterfeit-rigging-hardware'],
  },
  {
    slug: 'lifting-gear-rejection-criteria',
    html: 'For the US standard’s inspection levels and removal criteria for shackles, links, swivels and turnbuckles, see <a href="/blog/asme-b30-26-rigging-hardware-explained">ASME B30.26 explained</a>.',
    related: ['asme-b30-26-rigging-hardware-explained'],
  },
  {
    slug: 'working-load-limit-vs-breaking-strength',
    html: 'For the third figure on most certificates — the test load each item was proved to — see <a href="/blog/proof-load-testing-lifting-gear">proof load testing of lifting gear</a>.',
    related: ['proof-load-testing-lifting-gear', 'types-of-shackles', 'sling-angle-chart', 'types-of-lifting-slings', 'chain-grades-explained', 'lifting-equipment-inspection-uae'],
  },
  {
    slug: 'shackle-markings-explained',
    html: 'If the markings are missing or do not add up, see <a href="/blog/how-to-spot-counterfeit-rigging-hardware">how to spot counterfeit rigging hardware</a>.',
    related: ['how-to-spot-counterfeit-rigging-hardware'],
  },
  {
    slug: 'shackle-buying-guide-uae',
    html: 'When you send the enquiry, the <a href="/blog/rigging-hardware-rfq-checklist">rigging hardware RFQ checklist</a> lists what a supplier needs to quote the right shackle first time.',
    related: ['rigging-hardware-rfq-checklist', 'site-mobilisation-rigging-kit', 'g-209-vs-g-2130-vs-g-213-shackle', 'how-to-rig-a-shackle-correctly', 'shackle-markings-explained', 'how-to-spot-counterfeit-rigging-hardware'],
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
