/**
 * Brings the two older marine posts (2026-10-06 wave 3) into line with the Marine vertical.
 *
 * `types-of-marine-anchors` named three makers' patterns — Danforth, Baldt and Bruce — and linked the four
 * product pages that were renamed without them on 2026-11-07 (the old slugs now 301). This rewrites those
 * passages to the pattern names the listings use (lightweight fluke, classic cast-head stockless, claw),
 * adds the ship and offshore anchors that arrived with the Marine root, rebuilds the stock list from the
 * live `marine-anchors` and `offshore-anchors` shelves, and links the new anchor chain & mooring articles.
 *
 * `anchor-chain-grades-u1-u2-u3` said the chain was listed to 40 mm (now 162 mm stud link, 90 mm studless),
 * pointed its category link at the accessories shelf the chain has left, and linked none of the new
 * articles. Figures it quotes were re-checked against the live rows and are unchanged.
 *
 * Edits the stored bodies, not the seeds: the stored bodies carry a later fill-in block the seeds do not,
 * so a seed re-import would lose it. Idempotent — every edit checks for its own result first. Validates
 * with BlogBlocksSchema and resyncs the link table.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-08-blog-anchor-chain-mooring/fix-older-marine-posts.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-08-blog-anchor-chain-mooring/fix-older-marine-posts.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes } from '@indus/domain'

import { db } from '../../index'
import { syncBlogPostLinks } from '../../blog-links'

type Block = Record<string, unknown> & { type: string }

const DRY_RUN = process.argv.includes('--dry-run')

/** Exact-string replacements applied to the JSON of a body. Each pair is skipped if `from` is absent. */
function replaceAll(blocks: Block[], pairs: [string, string][]): Block[] {
  let s = JSON.stringify(blocks)
  for (const [from, to] of pairs) {
    const f = JSON.stringify(from).slice(1, -1)
    const t = JSON.stringify(to).slice(1, -1)
    if (s.includes(f)) s = s.split(f).join(t)
    else if (!s.includes(t)) console.warn(`  ! text not found, edit skipped: ${from.slice(0, 70)}…`)
  }
  return JSON.parse(s) as Block[]
}

function indexOfType(blocks: Block[], type: string, pred: (b: Block) => boolean = () => true): number {
  return blocks.findIndex((b) => b.type === type && pred(b))
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── types-of-marine-anchors ───────────────────────────────────────────────

const ANCHORS = {
  slug: 'types-of-marine-anchors',
  title: 'Types of marine anchors: stockless, Hall, Pool, HHP, Admiralty, fluke, claw and offshore drag anchors',
  excerpt:
    'Ship anchors, small-craft anchors and offshore mooring anchors are different families with different jobs. The anchor types we list, how each one holds, the mass ranges available and what to specify when ordering one.',
  seoDescription:
    'Stockless, Hall, Pool, HHP, Admiralty, fluke, plough, claw, grapnel and offshore drag anchors: how each one holds, the mass ranges we list and what to specify.',
}

const ANCHOR_TEXT: [string, string][] = [
  [
    'For ships: stockless bower anchors such as the Hall, Baldt and Pool types, which stow in the hawse pipe; high holding power (HHP) stockless anchors; and stocked anchors such as the Admiralty pattern. For small craft: fluke anchors (Danforth), plough anchors (CQR), claw anchors (Bruce), delta anchors and grapnels. Ship anchors are specified by mass — on our listings from 20 kg to 35,000 kg — and small-craft anchors by mass or length.',
    'For ships: stockless bower anchors such as the Hall, Pool and Spek types, which stow in the hawse pipe; high holding power (HHP) anchors; and stocked anchors such as the Admiralty pattern. For small craft: lightweight fluke anchors, plough anchors (CQR), claw anchors, delta anchors and grapnels. For offshore moorings: drag embedment anchors. Ship anchors are specified by mass — on our listings from 10 kg to 46,000 kg — and small-craft anchors by mass or length.',
  ],
  [
    'Stockless anchors (Hall, Baldt, Pool) have flukes that pivot on the crown and stow straight into the hawse pipe.',
    'Stockless anchors (Hall, Pool, Spek and the classic cast-head pattern) have flukes that pivot on the crown and stow straight into the hawse pipe.',
  ],
  [
    'HHP stockless anchors are designed to hold more for their mass; ours (type HY-14) run from 56 kg to 13,500 kg.',
    'HHP anchors are designed to hold more for their mass; ours include the HY-14 stockless (56 kg to 13,500 kg) and the AC-14 (30 kg to 36,000 kg).',
  ],
  ['Small-craft anchors trade setting ability against seabed type: fluke for sand and mud, plough and claw for mixed ground, grapnel for rock.', 'Small-craft anchors trade setting ability against seabed type: fluke for sand and mud, plough and claw for mixed ground, grapnel for rock. Offshore drag embedment anchors are chosen by the mooring analysis.'],
  [
    'The Hall, Baldt and Pool patterns are variations on the theme, differing in fluke shape, crown design and whether the head is cast or welded.',
    'The <a href="/p/hall-anchor">Hall</a>, <a href="/p/pool-anchor-type-n">Pool</a>, <a href="/p/spek-stockless-anchor">Spek</a> and <a href="/p/stockless-anchor-classic-cast-head-pattern">classic cast-head</a> patterns are variations on the theme, differing in fluke shape, crown design and whether the head is cast or welded; the <a href="/p/us-navy-stockless-anchor">US Navy stockless</a> and the short-shank <a href="/p/spek-stockless-anchor-type-m-short-shank">Spek type M</a> are further variants.',
  ],
  [
    'They are specified by mass, and the mass a ship carries is set by its class rules.',
    'They are specified by mass, and the mass a ship carries is set by its class rules from its <a href="/blog/equipment-number-anchor-chain-sizing">equipment number</a>.',
  ],
  [
    'so use the class rule for the vessel rather than a like-for-like weight swap.',
    'so use the class rule for the vessel rather than a like-for-like weight swap — and an HHP anchor is proof tested to the load of the heavier ordinary anchor it replaces (see <a href="/blog/anchor-proof-load-testing">anchor proof load testing</a>). Our HHP types include the <a href="/p/ac-14-high-holding-power-anchor">AC-14</a>, the <a href="/p/hhp-stockless-anchor-type-hy-14">HY-14</a>, the <a href="/p/high-holding-power-fluke-anchor">HHP fluke anchor</a> and the <a href="/p/super-high-holding-power-pool-anchor-type-tw">super HHP Pool type TW</a>.',
  ],
  [
    'Fluke anchors such as the Danforth set deep in sand and mud and hold very well for their weight, but struggle in rock and weed.',
    '<a href="/p/lightweight-fluke-anchor">Lightweight fluke anchors</a> set deep in sand and mud and hold very well for their weight, but struggle in rock and weed.',
  ],
  ['and claw (Bruce) anchors set in a wider range of bottoms', 'and <a href="/p/claw-anchor">claw</a> anchors set in a wider range of bottoms'],
  [
    'Size the chain and shackles with the anchor, from components rated for the job — see anchor chain grades U1, U2 and U3.',
    'Size the chain and shackles with the anchor, from components rated for the job — see anchor chain grades U1, U2 and U3 and the arrangement of a chain cable.',
  ],
  [
    'The chain that goes with a bower anchor is covered in <a href="/blog/anchor-chain-grades-u1-u2-u3">anchor chain grades U1, U2 and U3</a>.',
    'The chain that goes with a bower anchor is covered in <a href="/blog/anchor-chain-grades-u1-u2-u3">anchor chain grades U1, U2 and U3</a> and <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a>.',
  ],
  ['Hall, Baldt and Pool are stockless types.', 'Hall, Pool and Spek are stockless types.'],
  [
    'A fluke anchor such as a Danforth sets deep and holds very well in sand and mud. Plough and claw anchors cope better with mixed ground.',
    'A lightweight fluke anchor sets deep and holds very well in sand and mud. Plough and claw anchors cope better with mixed ground.',
  ],
  ['Anchor types, patterns, mass ranges, materials and certification checked against our marine anchor listings.', 'Anchor types, patterns, mass ranges, materials and certification checked against our marine and offshore anchor listings.'],
]

const ANCHOR_TABLE_ROWS = [
  ['Hall', 'Stockless bower anchor', '100 kg to 11,100 kg'],
  ['Stockless, classic cast-head pattern', 'Stockless bower anchor', '50 kg to 35,000 kg'],
  ['Spek (and short-shank type M)', 'Stockless bower anchor', '50 kg to 29,000 kg; type M 2,460 kg to 20,000 kg'],
  ['Pool (type N, welded and type TW)', 'Stockless bower anchor', 'Type N 20 kg to 17,200 kg; welded 60 kg to 17,260 kg; TW 60 kg to 16,125 kg'],
  ['HHP stockless (HY-14)', 'High holding power bower anchor', '56 kg to 13,500 kg'],
  ['AC-14 and super HHP Pool TW', 'High holding power anchors', 'AC-14 30 kg to 36,000 kg; TW 17 kg to 2,295 kg'],
  ['Admiralty (GB 545-96), JIS and stock anchors', 'Stocked anchors', 'Admiralty 50 kg to 10,000 kg; JIS 100 kg to 46,000 kg; stock 10 kg to 12,000 kg'],
  ['Single fluke', 'One-fluke anchor', '75 kg to 8,000 kg'],
  ['Lightweight fluke', 'Fluke anchor', '1.5 kg to 18,000 kg'],
  ['Plough (CQR), claw, delta', 'Small-craft anchors', 'Plough 5–16 kg; claw 2–20 kg; delta 230–450 mm'],
  ['Grapnel', 'Folding or four-prong, small craft and retrieval', 'Folding 0.7 kg up; four-prong 2–20 kg'],
  ['Offshore drag embedment', 'Mooring anchors for rigs, buoys and floating units', '240 kg to 40,000 kg across the types listed'],
]

function fixAnchors(body: Block[], stockHtml: string): Block[] {
  let out = replaceAll(body, ANCHOR_TEXT)

  const table = indexOfType(out, 'comparison_table')
  if (table >= 0) {
    out[table] = { ...out[table]!, rows: ANCHOR_TABLE_ROWS.map((cells, i) => ({ cells, highlight: i === 0 })) }
  }

  // New section before "Ordering an anchor", renumbering it /06.
  if (indexOfType(out, 'section_head', (b) => b.anchor === 'offshore') === -1) {
    const ordering = indexOfType(out, 'section_head', (b) => b.anchor === 'ordering')
    if (ordering >= 0) {
      out[ordering] = { ...out[ordering]!, number: '/06' }
      out.splice(
        ordering,
        0,
        { type: 'section_head', number: '/05', title: 'Offshore mooring anchors.', anchor: 'offshore' },
        {
          type: 'paragraph',
          html: 'Rigs, buoys and floating production units are moored with drag embedment anchors, which are pulled into the seabed until their flukes are buried and hold many times their own weight. They are chosen by the mooring analysis for the soil and the load, not from a ship’s equipment table. We list them as their makers name them, among them the <a href="/p/drag-embedment-anchor">drag embedment anchor</a>, <a href="/p/stevin-anchor">Stevin</a>, <a href="/p/offdrill-ii-anchor">Offdrill II</a> and <a href="/p/superior-delta-anchor">Superior Delta</a>, from 240 kg to 40,000 kg; <a href="/p/mushroom-anchor">mushroom anchors</a> serve buoys and light moorings. How they connect to the line is in <a href="/blog/offshore-mooring-components">offshore mooring components</a>.',
        }
      )
    }
  }

  const faq = indexOfType(out, 'faq_block')
  if (faq >= 0) {
    const items = out[faq]!.items as { question: string; answer: string }[]
    if (!items.some((i) => i.question.startsWith('How heavy an anchor'))) {
      out[faq] = {
        ...out[faq]!,
        items: [
          ...items,
          {
            question: 'How heavy an anchor does a ship need?',
            answer: 'The class rules set it from the ship’s equipment number: for example, 3,060 kg per bower anchor for an equipment number of 980 to 1,059, or 2,295 kg if HHP anchors are fitted.',
          },
        ],
      }
    }
  }

  const stock = indexOfType(out, 'prose', (b) => String(b.html).includes('fill-in:stock-list'))
  if (stock >= 0) out[stock] = { ...out[stock]!, html: stockHtml }

  const embed = indexOfType(out, 'product_embed')
  if (embed >= 0) {
    out[embed] = {
      ...out[embed]!,
      skus: ['IH-LR-AN-HALL', 'IH-LR-AN-SPEK', 'IH-LR-AN-HHP14', 'IH-MR-AN-AC14', 'IH-LR-AN-ADM', 'IH-LR-AN-DAN', 'IH-LR-AN-BCA', 'IH-MR-OA-DRG'],
    }
  }

  const chainLink = indexOfType(out, 'category_link', (b) => b.slug === 'anchor-chain-accessories')
  if (chainLink >= 0) {
    out[chainLink] = { type: 'category_link', slug: 'offshore-anchors', label: 'Offshore anchors', blurb: 'Drag embedment and mushroom anchors for rigs, buoys and floating units.' }
  }

  const related = indexOfType(out, 'related_articles')
  if (related >= 0) {
    out[related] = {
      ...out[related]!,
      slugs: ['equipment-number-anchor-chain-sizing', 'anchor-proof-load-testing', 'anchor-chain-cable-arrangement', 'anchor-chain-grades-u1-u2-u3', 'offshore-mooring-components', 'types-of-mooring-bollards'],
    }
  }

  const stamp = indexOfType(out, 'as_of_stamp')
  if (stamp >= 0) out[stamp] = { ...out[stamp]!, verifiedOn: '2026-11-08' }
  return out
}

// ── anchor-chain-grades-u1-u2-u3 ──────────────────────────────────────────

const GRADES_TEXT: [string, string][] = [
  [
    'Both are listed from 12.5 mm to 40 mm in grades U1, U2 and U3, hot-dip galvanised or bitumen coated.',
    'Both are listed in grades U1, U2 and U3 — <a href="/p/stud-link-anchor-chain-grades-u1-u2-and-u3">stud link</a> from 12.5 mm to 162 mm and studless to 90 mm.',
  ],
  [
    '— so compare the rows, not the size.',
    '— so compare the rows, not the size. The full comparison is in <a href="/blog/stud-link-vs-studless-chain">stud link vs studless chain</a>.',
  ],
  [
    'it is shaped like a chain link so it passes over the windlass gypsy with the chain.',
    'it is shaped like a chain link so it passes over the windlass gypsy with the chain — see <a href="/blog/how-to-assemble-a-kenter-shackle">how to dismantle and assemble a Kenter shackle</a>.',
  ],
  [
    'Match the shackle grade and size to the chain.',
    'Match the shackle grade and size to the chain. How the lengths, shackles, swivel forerunner and end fastening fit together is in <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a>.',
  ],
  [
    'The anchor the chain serves is covered in <a href="/blog/types-of-marine-anchors">types of marine anchors</a>;',
    'The chain size and length a ship needs come from its <a href="/blog/equipment-number-anchor-chain-sizing">equipment number</a>; the anchor the chain serves is covered in <a href="/blog/types-of-marine-anchors">types of marine anchors</a>;',
  ],
  [
    'Proof and breaking loads by grade and size, finishes, shackle standard, grades and materials checked against our anchor chain listings.',
    'Proof and breaking loads by grade and size, size ranges, shackle standard, grades and materials checked against our anchor chain listings.',
  ],
]

function fixGrades(body: Block[]): Block[] {
  const out = replaceAll(body, GRADES_TEXT)

  const sizes = indexOfType(out, 'comparison_table', (b) => String(b.caption).includes('grade U2'))
  if (sizes >= 0 && !(out[sizes + 1]?.type === 'paragraph' && String(out[sizes + 1]!.html).includes('anchor-chain-size-chart'))) {
    out.splice(sizes + 1, 0, {
      type: 'paragraph',
      html: 'Every size from 12.5 mm to 137 mm in all three grades, with the inch equivalents, is in the <a href="/blog/anchor-chain-size-chart">anchor chain size chart</a>, and the weights in the <a href="/blog/anchor-chain-weight-chart">weight chart</a>. Offshore mooring chain uses a different, stronger family of grades — see <a href="/blog/offshore-mooring-chain-grades-r3-r4-r5">grades ORQ, R3, R3S, R4, R4S and R5</a>.',
    })
  }

  const faq = indexOfType(out, 'faq_block')
  if (faq >= 0) {
    const items = out[faq]!.items as { question: string; answer: string }[]
    if (!items.some((i) => i.question.startsWith('What grade is offshore'))) {
      out[faq] = {
        ...out[faq]!,
        items: [
          ...items,
          {
            question: 'What grade is offshore mooring chain?',
            answer: 'Offshore mooring chain is made in its own grades — ORQ, R3, R3S, R4, R4S and R5 — which are stronger than U3 and carry a toughness requirement.',
          },
        ],
      }
    }
  }

  const embed = indexOfType(out, 'product_embed')
  if (embed >= 0) {
    out[embed] = { ...out[embed]!, skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-SACGU1U2U', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-JSDGU2U3', 'IH-LR-AC-ESDGU2U3', 'IH-LR-AC-SFACGU2U3'] }
  }

  const accessories = indexOfType(out, 'category_link', (b) => b.slug === 'anchor-chain-accessories')
  if (accessories >= 0 && indexOfType(out, 'category_link', (b) => b.slug === 'anchor-chain') === -1) {
    out[accessories] = { type: 'category_link', slug: 'anchor-chain', label: 'Anchor chain', blurb: 'Stud link and studless anchor chain in grades U1, U2 and U3, by the 27.5 m length.' }
    out.splice(accessories + 1, 0, {
      type: 'category_link',
      slug: 'anchor-chain-accessories',
      label: 'Anchor chain accessories',
      blurb: 'Kenter, D and pear shackles, swivels, forerunners, end and enlarged links.',
    })
  }

  const related = indexOfType(out, 'related_articles')
  if (related >= 0) {
    out[related] = {
      ...out[related]!,
      slugs: ['anchor-chain-size-chart', 'stud-link-vs-studless-chain', 'anchor-chain-cable-arrangement', 'offshore-mooring-chain-grades-r3-r4-r5', 'types-of-marine-anchors', 'chain-grades-explained'],
    }
  }

  const stamp = indexOfType(out, 'as_of_stamp')
  if (stamp >= 0) out[stamp] = { ...out[stamp]!, verifiedOn: '2026-11-08' }
  return out
}

// ── run ───────────────────────────────────────────────────────────────────

async function stockListHtml(): Promise<string> {
  const products = await db.product.findMany({
    where: { status: 'active', category: { slug: { in: ['marine-anchors', 'offshore-anchors'] } } },
    select: { slug: true, title: true, category: { select: { slug: true } } },
    orderBy: { title: 'asc' },
  })
  const li = (slug: string) =>
    products
      .filter((p) => p.category?.slug === slug)
      .map((p) => `<li><a href="/p/${p.slug}">${esc(p.title)}</a></li>`)
      .join('')
  return `<!-- fill-in:stock-list --><h3>What we list</h3><p>Every listing on our Marine Anchors shelf:</p><ul>${li('marine-anchors')}</ul><p>And on our Offshore Anchors shelf:</p><ul>${li('offshore-anchors')}</ul>`
}

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { slug: { in: [ANCHORS.slug, 'anchor-chain-grades-u1-u2-u3'] } },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const stockHtml = await stockListHtml()

  for (const post of posts) {
    const before = post.bodyBlocks as unknown as Block[]
    const after = post.slug === ANCHORS.slug ? fixAnchors(before, stockHtml) : fixGrades(before)
    const parsed = BlogBlocksSchema.safeParse(after)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) console.error(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      process.exitCode = 1
      return
    }
    const text = JSON.stringify(parsed.data)
    const leftovers = ['Danforth', 'Baldt', 'Bruce', '/p/danforth-anchor', '/p/baldt-stockless-anchor', '/p/bruce-claw-anchor', 'stainless-steel-danforth'].filter((w) => text.includes(w))
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${post.slug}: ${before.length} → ${parsed.data.length} blocks${leftovers.length ? ` — LEFTOVER: ${leftovers.join(', ')}` : ''}`)
    if (DRY_RUN) continue

    await db.blogPost.update({
      where: { id: post.id },
      data: {
        bodyBlocks: JSON.parse(text) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(parsed.data),
        ...(post.slug === ANCHORS.slug ? { title: ANCHORS.title, excerpt: ANCHORS.excerpt, seoDescription: ANCHORS.seoDescription } : {}),
      },
    })
    await syncBlogPostLinks(post.id, parsed.data)
    console.log(`  ✓ /blog/${post.slug}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
