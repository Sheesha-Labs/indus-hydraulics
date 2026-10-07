/**
 * Re-applies the link graph to the existing articles whose related lists were
 * changed to point at the 2026-10-06 pillars and hubs.
 *
 * The three content waves of 2026-10-06 added pillar guides (industrial hose,
 * couplings, metal hose, hydraulic hose, fittings, hose assembly, oilfield
 * hose) and hubs (Molykote, flow iron). New articles link up to them through
 * `BLOG_CROSS_LINKS`; this runner gives the older articles the same edge by
 * composing their updated map entries onto what is live.
 *
 * Why not ../2026-08-25-blog-cross-links/run.ts: that runner requires every
 * article in the database to have a map entry, and the lifting and physical-AI
 * articles deliberately have none. This one touches only the slugs below.
 *
 * Same composition as the importer: `withCrossLinks` with the article's own
 * category, so the delivery-reach section is rebuilt in its usual place rather
 * than stranded above the regenerated links. Idempotent.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-blog-pillar-backlinks/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-blog-pillar-backlinks/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes, type BlogBlocksInput } from '@indus/domain'

import { db } from '../../index'
import { BLOG_CROSS_LINKS } from '../blog-cross-links'
import { syncArticleLinks, withCrossLinks } from '../blog-article-import'

export const BACKLINKED = [
  'api-16c-choke-and-kill-lines',
  'api-7k-16c-16d-which-standard',
  'api-7k-rotary-vibrator-hose',
  'bop-control-hose-fire-resistance',
  'braid-vs-spiral-hydraulic-hose',
  'bspp-vs-bspt',
  'chemical-transfer-hose-selection',
  'compact-hose-1sc-2sc',
  'en-853-856-857-vs-sae-100r',
  'food-grade-hose-compliance',
  'getting-a-hydraulic-hose-made',
  'grease-and-zerk-fittings',
  'hose-whip-restraint-and-burst-protection',
  'how-to-measure-a-hydraulic-hose',
  'how-to-read-a-hose-layline',
  'hydraulic-fitting-make-up-torque',
  'hydraulic-hose-dash-sizes',
  'hydraulic-hose-pressure-by-size',
  'hydraulic-thread-size-and-pitch-reference',
  'identify-any-hydraulic-fitting',
  'industrial-hose-is-not-hydraulic-hose',
  'jic-vs-orfs-vs-npt-vs-bsp',
  'measuring-a-fitting-without-gauges',
  'nace-mr0175-hose-documentation',
  'offshore-hydraulic-hose',
  'oilfield-hose-document-pack',
  'rig-site-hose-replacement-abu-dhabi',
  'sae-100r-hose-types',
  'skiving-and-fitting-selection',
  'steam-hose-safety',
  'water-suction-and-dewatering-hose',
  'what-to-send-for-a-fittings-quote',
  'what-to-send-for-a-hose-quote',
  'why-fittings-seize-in-coastal-air',
  'why-hydraulic-hoses-fail',
]

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)

const relatedOf = (blocks: BlogBlocksInput): string[] =>
  blocks.flatMap((b) => (b.type === 'related_articles' ? (b as { slugs: string[] }).slugs : []))

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { slug: { in: BACKLINKED }, deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true, isPublished: true, category: { select: { slug: true } } },
  })
  const errors: string[] = []
  for (const slug of BACKLINKED) {
    if (!posts.some((p) => p.slug === slug)) errors.push(`not found: ${slug}`)
    if (!BLOG_CROSS_LINKS[slug]) errors.push(`no map entry: ${slug}`)
  }

  const targets = [...new Set(BACKLINKED.flatMap((s) => BLOG_CROSS_LINKS[s]?.related ?? []))]
  const live = await db.blogPost.findMany({
    where: { slug: { in: targets }, isPublished: true, deletedAt: null },
    select: { slug: true },
  })
  const liveSet = new Set(live.map((p) => p.slug))
  for (const t of targets) if (!liveSet.has(t)) errors.push(`related target is not a published article: ${t}`)

  const planned = []
  for (const post of posts) {
    const current = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []) as BlogBlocksInput
    const composed = withCrossLinks(post.slug, current, post.category?.slug ?? undefined)
    const parsed = BlogBlocksSchema.safeParse(composed)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      continue
    }
    planned.push({ post, current, blocks: parsed.data })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  // The only intended change is the related list. Anything else moving means
  // the live article has drifted from what the map would compose, and that is
  // worth a look before writing over it.
  // Both sides go through the schema first, so defaults it fills in (a table
  // row's `highlight: false`, a callout's tone) do not read as drift.
  const withoutRelated = (blocks: BlogBlocksInput) => {
    const parsed = BlogBlocksSchema.safeParse(blocks)
    const normal = (parsed.success ? parsed.data : blocks) as BlogBlocksInput
    return JSON.stringify(normal.filter((b) => b.type !== 'related_articles'))
  }
  let drifted = 0
  for (const { post, current, blocks } of planned) {
    const before = relatedOf(current).join(', ')
    const after = relatedOf(blocks as BlogBlocksInput).join(', ')
    const other = withoutRelated(current) !== withoutRelated(blocks as BlogBlocksInput)
    if (other) drifted++
    console.log(
      `${DRY_RUN ? '[dry-run] ' : ''}/blog/${post.slug}${other ? '  ⚠ other blocks change too' : ''}\n    before: ${before}\n    after:  ${after}`
    )
  }
  if (drifted && !process.argv.includes('--allow-drift')) {
    console.error(`${drifted} article(s) would change beyond their related list — rerun with --allow-drift to accept`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN) return

  if (SNAPSHOT) {
    writeFileSync(SNAPSHOT, JSON.stringify(planned.map(({ post, current }) => ({ slug: post.slug, bodyBlocks: current })), null, 1))
    console.log(`snapshot written: ${planned.length} article(s)`)
  }
  for (const { post, blocks } of planned) {
    await db.blogPost.update({
      where: { id: post.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(blocks),
      },
    })
    await syncArticleLinks(post.id, blocks)
  }
  console.log(`done: ${planned.length} article(s) updated`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
