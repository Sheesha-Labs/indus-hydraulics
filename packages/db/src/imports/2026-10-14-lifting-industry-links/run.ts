/**
 * Gives the lifting and rigging articles industry cards, by composing their new link-graph
 * entries onto what is live.
 *
 * Until 2026-10-14 the lifting articles carried their related lists in their seeds and had no
 * entry in `BLOG_CROSS_LINKS`, so they could not carry a page card. Their entries now hold the
 * same related lists plus one or two industry cards (construction, oil and gas, marine, mining,
 * steel). Industry cards only: the market budget in blog-cross-links.test.ts is untouched.
 *
 * Same composition as the importer (`withCrossLinks` with the article's own category).
 * Idempotent. The drift check allows the related list and page cards to change and nothing else.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-lifting-industry-links/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-14-lifting-industry-links/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes, type BlogBlocksInput } from '@indus/domain'

import { db } from '../../index'
import { BLOG_CROSS_LINKS } from '../blog-cross-links'
import { syncArticleLinks, withCrossLinks } from '../blog-article-import'

export const BACKLINKED = [
  'chain-block-vs-lever-hoist-vs-electric-hoist',
  'chain-grades-explained',
  'chain-sling-capacity-chart',
  'crosby-pattern-numbers-explained',
  'din-link-chain-standards',
  'eye-bolt-capacity-chart',
  'eye-bolt-types-and-angled-loads',
  'lever-vs-ratchet-load-binder',
  'lifting-equipment-inspection-uae',
  'lifting-gear-rejection-criteria',
  'lifting-gear-test-certificate',
  'lifting-hook-types',
  'master-links-explained',
  'pad-eye-vs-swivel-lifting-point',
  'precast-concrete-lifting-clutch',
  'ratchet-strap-vs-chain-and-binder',
  'shackle-size-and-capacity-chart',
  'sling-angle-chart',
  'sling-colour-code-chart',
  'snap-hooks-and-quick-links',
  'snatch-block-vs-pulley-block',
  'spelter-sockets-open-vs-closed',
  'stainless-vs-galvanized-rigging-gulf',
  'turnbuckle-types',
  'types-of-lifting-slings',
  'types-of-shackles',
  'webbing-and-round-sling-capacity-chart',
  'wire-rope-breaking-strength-chart',
  'wire-rope-clips-installation',
  'wire-rope-construction-explained',
  'wire-rope-eye-terminations',
  'wire-rope-sling-capacity-chart',
  'wire-rope-thimble-types',
  'working-load-limit-vs-breaking-strength',
]

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)

const relatedOf = (blocks: BlogBlocksInput): string[] =>
  blocks.flatMap((b) =>
    b.type === 'related_articles'
      ? (b as { slugs: string[] }).slugs
      : b.type === 'page_link'
        ? [`[${(b as { kind: string }).kind}:${(b as { slug: string }).slug}]`]
        : []
  )

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

  // The only intended changes are the related list and the page cards. Anything else moving means
  // the live article has drifted from what the map would compose, and that is
  // worth a look before writing over it.
  // Both sides go through the schema first, so defaults it fills in (a table
  // row's `highlight: false`, a callout's tone) do not read as drift.
  const withoutRelated = (blocks: BlogBlocksInput) => {
    const parsed = BlogBlocksSchema.safeParse(blocks)
    const normal = (parsed.success ? parsed.data : blocks) as BlogBlocksInput
    return JSON.stringify(normal.filter((b) => b.type !== 'related_articles' && b.type !== 'page_link'))
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
    console.error(`${drifted} article(s) would change beyond their related list and page cards — rerun with --allow-drift to accept`)
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
