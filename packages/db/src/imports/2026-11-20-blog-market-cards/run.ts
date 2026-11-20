/**
 * Adds the market cards in ./plans.ts to the live articles.
 *
 * Content, not code: no deploy. Each article is one row update. Articles and
 * market pages revalidate within the hour; purge `_N_T_/blog/<slug>` and
 * `_N_T_/markets/<slug>` to see them sooner.
 *
 * Validation runs in full before anything is written:
 *   - every market is released and advertised (not in REACH_EXCLUDED_MARKET_SLUGS);
 *   - no article ends up with two cards for one market, or a card for a market
 *     its market_reach block already names, or more than three market cards;
 *   - every edited article still parses as BlogBlocks.
 *
 * Idempotent: a card already present is reported as done and skipped.
 * Refuses to write without --rollback-file.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-blog-market-cards/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-blog-market-cards/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import {
  BlogBlocksSchema,
  MARKETS,
  REACH_EXCLUDED_MARKET_SLUGS,
  estimateReadingMinutes,
  releasedMarketPage,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'
import { MARKET_CARD_PLANS } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

/** Who the market page's freight and document notes are for, by sector. */
const AUDIENCE: Record<string, string> = {
  mining: 'mining and processing operations',
  'oil-gas': 'oil and gas operators and contractors',
  marine: 'ports, yards and vessel operators',
  construction: 'construction and plant contractors',
  steel: 'steel and metals plants',
  power: 'power and utility buyers',
}

/** Names that read wrongly without an article in running text. */
const WITH_THE = /^(United |Republic |Dominican |Netherlands$|Philippines$|Gambia$|Czech Republic$|Central African)/

type Block = Record<string, unknown> & { type: string }

function displayName(name: string): string {
  return WITH_THE.test(name) ? `the ${name}` : name
}

function card(market: { slug: string; name: string }, sector: string): Block {
  const audience = AUDIENCE[sector]
  if (!audience) throw new Error(`no audience line for sector ${sector}`)
  return {
    type: 'page_link',
    kind: 'market',
    slug: market.slug,
    label: `Supplying ${displayName(market.name)} from Dubai`,
    blurb: `Freight, import documents and lead times for ${audience} in ${displayName(market.name)}.`,
  }
}

/** After the article's last market card; else before related articles, the reach block or the CTA; else at the end. */
function insertAt(blocks: Block[]): number {
  let last = -1
  blocks.forEach((b, i) => {
    if (b.type === 'page_link' && b.kind === 'market') last = i
  })
  if (last >= 0) return last + 1
  for (const t of ['related_articles', 'market_reach', 'cta_block']) {
    const i = blocks.findIndex((b) => b.type === t)
    if (i >= 0) return i
  }
  return blocks.length
}

async function main(): Promise<void> {
  const errors: string[] = []
  const bySlug = new Map(MARKETS.map((m) => [m.slug, m]))
  const excluded = new Set(REACH_EXCLUDED_MARKET_SLUGS)
  for (const [post, cards] of Object.entries(MARKET_CARD_PLANS)) {
    for (const c of cards) {
      if (!bySlug.has(c.market) || !releasedMarketPage(c.market)) errors.push(`${post}: market ${c.market} is not released`)
      if (excluded.has(c.market)) errors.push(`${post}: market ${c.market} is not advertised`)
      if (!AUDIENCE[c.sector]) errors.push(`${post}: unknown sector ${c.sector}`)
    }
  }

  const slugs = Object.keys(MARKET_CARD_PLANS)
  const posts = await db.blogPost.findMany({
    where: { slug: { in: slugs }, isPublished: true, deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const found = new Map(posts.map((p) => [p.slug, p]))
  for (const s of slugs) if (!found.has(s)) errors.push(`${s}: not found or not live`)

  type Planned = { id: string; slug: string; blocks: Block[]; before: unknown; added: string[] }
  const planned: Planned[] = []
  let added = 0
  let skipped = 0
  for (const slug of slugs) {
    const post = found.get(slug)
    if (!post) continue
    const blocks = ((Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []) as Block[]).map((b) => ({ ...b }))
    const cardsHere = () => blocks.filter((b) => b.type === 'page_link' && b.kind === 'market').map((b) => b.slug as string)
    const reach = new Set(
      blocks
        .filter((b) => b.type === 'market_reach')
        .flatMap((b) => (b.groups as Array<{ markets: Array<{ slug: string }> }>).flatMap((g) => g.markets.map((m) => m.slug)))
    )
    const done: string[] = []
    for (const c of MARKET_CARD_PLANS[slug]!) {
      if (cardsHere().includes(c.market)) {
        skipped++
        continue
      }
      if (reach.has(c.market)) {
        errors.push(`${slug}: ${c.market} is already in the article's market_reach block`)
        continue
      }
      blocks.splice(insertAt(blocks), 0, card(bySlug.get(c.market)!, c.sector))
      done.push(c.market)
      added++
    }
    const n = cardsHere()
    if (n.length > 3) errors.push(`${slug}: would carry ${n.length} market cards (max 3)`)
    if (new Set(n).size !== n.length) errors.push(`${slug}: duplicate market card`)
    const parsed = BlogBlocksSchema.safeParse(blocks)
    if (!parsed.success) {
      for (const i of parsed.error.issues) errors.push(`${slug}: ${i.path.join('.')}: ${i.message}`)
      continue
    }
    if (done.length) planned.push({ id: post.id, slug, blocks, before: post.bodyBlocks, added: done })
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} article(s) to update, ${added} new card(s), ${skipped} already done`)
  for (const p of planned) console.log(`  /blog/${p.slug}  + ${p.added.join(', ')}`)
  if (DRY_RUN) return
  if (!ROLLBACK_FILE) {
    console.error('refusing to write without --rollback-file=<absolute path>')
    process.exitCode = 1
    return
  }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(planned.map((p) => ({ id: p.id, slug: p.slug, bodyBlocks: p.before }))))
  console.log(`rollback written: ${ROLLBACK_FILE}`)
  for (const p of planned) {
    const parsed = BlogBlocksSchema.parse(p.blocks)
    await db.blogPost.update({
      where: { id: p.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(p.blocks)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(parsed),
      },
    })
    console.log(`  ✓ /blog/${p.slug}`)
  }
  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
