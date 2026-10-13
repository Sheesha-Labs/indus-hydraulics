/**
 * Links six existing lifting articles into lifting wave 7: one sentence in the body where the topic meets lay flat
 * hose, and the wave’s articles at the head of each `related_articles` list (capped at six).
 *
 * The related slugs are also in BLOG_CROSS_LINKS, so a re-run of the 2026-10-06 pillar-backlinks
 * script keeps them. The sentence is skipped when the post already links its first target, so a
 * re-run is idempotent.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/backlinks.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-blog-lifting-wave-7/backlinks.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'
import { BlogBlocksSchema } from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Plan = { slug: string; html: string; related: string[] }

export const PLANS: Plan[] = [
  {
    slug: 'types-of-shackles',
    html: 'For buying and using them: the <a href="/blog/shackle-buying-guide-uae">shackle buying guide for UAE and GCC projects</a>, <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209 vs G-2130 vs G-213</a>, and <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a>.',
    related: ['shackle-buying-guide-uae', 'g-209-vs-g-2130-vs-g-213-shackle', 'how-to-rig-a-shackle-correctly'],
  },
  {
    slug: 'turnbuckle-types',
    html: 'Next steps: <a href="/blog/how-to-choose-and-tension-a-turnbuckle">how to choose and tension a turnbuckle</a>, <a href="/blog/din-1480-vs-din-1478-turnbuckle">DIN 1480 vs DIN 1478</a>, and <a href="/blog/turnbuckles-for-guy-wires-and-cable-bracing">turnbuckles for guy wires and cable bracing</a>.',
    related: ['how-to-choose-and-tension-a-turnbuckle', 'din-1480-vs-din-1478-turnbuckle', 'turnbuckles-for-guy-wires-and-cable-bracing'],
  },
  {
    slug: 'shackle-size-and-capacity-chart',
    html: 'Same size, different rating: see <a href="/blog/commercial-grade-vs-lifting-grade-shackles">commercial grade vs lifting grade shackles</a>, <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209 vs G-2130 vs G-213</a> and the <a href="/blog/bs-3032-din-82101-as-2741-shackles">non-US shackle standards</a>.',
    related: ['commercial-grade-vs-lifting-grade-shackles', 'g-209-vs-g-2130-vs-g-213-shackle', 'bs-3032-din-82101-as-2741-shackles'],
  },
  {
    slug: 'crosby-pattern-numbers-explained',
    html: 'The three anchor patterns contractors order most are compared in <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209 vs G-2130 vs G-213</a>; British, German and Australian shackles in <a href="/blog/bs-3032-din-82101-as-2741-shackles">BS 3032, DIN 82101 and AS 2741</a>.',
    related: ['g-209-vs-g-2130-vs-g-213-shackle', 'bs-3032-din-82101-as-2741-shackles'],
  },
  {
    slug: 'lifting-equipment-inspection-uae',
    html: 'Inspection starts at the store door: see <a href="/blog/shackle-markings-explained">shackle markings explained</a> for the receiving check, and the <a href="/blog/shackle-buying-guide-uae">shackle buying guide</a> for what to put on the order.',
    related: ['shackle-markings-explained', 'shackle-buying-guide-uae'],
  },
  {
    slug: 'wire-rope-clips-installation',
    html: 'Clips are usually one part of a guy or bracing line; see <a href="/blog/turnbuckles-for-guy-wires-and-cable-bracing">turnbuckles for guy wires and cable bracing</a> for the whole assembly.',
    related: ['turnbuckles-for-guy-wires-and-cable-bracing'],
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
