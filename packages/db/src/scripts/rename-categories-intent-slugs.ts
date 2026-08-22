/**
 * Move the ten highest-value category hubs to intent-phrase URLs.
 *
 * Our slugs were pure taxonomy — `hoses-fittings`, `bsp-adapters` — and not
 * one of the 188 carried a term anyone types into Google. The competitor
 * teardown that prompted this found the opposite: their category slugs read
 * `hydraulic-hoses-suppliers-in-dubai` while the on-page label stays clean,
 * and those pages are the main reason they still rank.
 *
 * Slug, title and focus keyword move together, deliberately. Renaming the
 * slug alone would break the alignment the focus-keyword backfill just
 * established: `scoreEntity` requires the keyword to appear in both the title
 * and the URL, and "hydraulic hose fittings" is not a substring of
 * "Hydraulic Hoses & Fittings" — the ampersand and the plural break it. A
 * slug-only rename would therefore have *lowered* the score on all ten.
 *
 * Every triple below is asserted before anything is written: the title must
 * sit inside TITLE_RANGE, and the keyword must appear in both the new title
 * and the new slug. A triple that fails aborts the run rather than writing
 * a page that scores worse than it did before.
 *
 * Redirects use the same `recordSlugRedirect` the admin rename path uses, so
 * chains stay flat and the behaviour matches what an editor would get.
 *
 * Dry-run by default. Pass `--apply` to write.
 *
 *   pnpm exec tsx --env-file=../../apps/web/.env.local \
 *     src/scripts/rename-categories-intent-slugs.ts [--apply]
 */
import { Prisma } from '@prisma/client'
import { TITLE_RANGE } from '@indus/domain'
import { db, recordSlugRedirect } from '../index'

type Rename = {
  from: string
  slug: string
  seoTitle: string
  focusKeyword: string
}

/**
 * Ten hubs, chosen by subtree product count rather than direct count — a hub
 * holds its catalogue in its leaves, so direct counts rank leaves and miss
 * the pages that actually take supplier-intent traffic.
 *
 * Titles keep their specification tail after the em dash. The geo intent
 * leads because that is the query; the standards still qualify it for the
 * buyer who already knows what they need.
 */
const RENAMES: Rename[] = [
  {
    from: 'hoses-fittings',
    slug: 'hydraulic-hose-fittings-suppliers-uae',
    seoTitle: 'Hydraulic Hose Fittings Suppliers in UAE',
    focusKeyword: 'hydraulic hose fittings suppliers',
  },
  {
    from: 'industrial-hoses',
    slug: 'industrial-hose-suppliers-uae',
    seoTitle: 'Industrial Hose Suppliers in UAE — Air, Water, Steam',
    focusKeyword: 'industrial hose suppliers',
  },
  {
    from: 'lubricants',
    slug: 'industrial-lubricant-suppliers-uae',
    seoTitle: 'Industrial Lubricant Suppliers in UAE — Molykote',
    focusKeyword: 'industrial lubricant suppliers',
  },
  {
    from: 'flow-iron-wellhead',
    slug: 'flow-iron-wellhead-equipment-uae',
    seoTitle: 'Flow Iron & Wellhead Equipment in UAE — Frac Iron',
    focusKeyword: 'wellhead equipment',
  },
  {
    from: 'oilfield-valves',
    slug: 'oilfield-valve-suppliers-uae',
    seoTitle: 'Oilfield Valve Suppliers in UAE — API 6A, 6D, 16C',
    focusKeyword: 'oilfield valve suppliers',
  },
  {
    // Also fixes a title that was 69 characters, over TITLE_RANGE.max.
    from: 'metallic-hoses',
    slug: 'metallic-hose-suppliers-uae',
    seoTitle: 'Metallic Hose Suppliers in UAE — Stainless & Alloy',
    focusKeyword: 'metallic hose suppliers',
  },
  {
    // Also fixes a title that was 16 characters, under TITLE_RANGE.min.
    from: 'molykote-greases',
    slug: 'molykote-grease-suppliers-uae',
    seoTitle: 'Molykote Grease Suppliers in UAE — Authorised',
    focusKeyword: 'molykote grease suppliers',
  },
  {
    from: 'bsp-adapters',
    slug: 'bsp-hydraulic-adapters-uae',
    seoTitle: 'BSP Hydraulic Adapters in UAE — BSPP & BSPT',
    focusKeyword: 'bsp hydraulic adapters',
  },
  {
    from: 'flow-iron-fittings',
    slug: 'flow-iron-fittings-suppliers-uae',
    seoTitle: 'Flow Iron Fittings Suppliers in UAE — Hammer Unions',
    focusKeyword: 'flow iron fittings suppliers',
  },
  {
    from: 'din-2353-bite-type-adapters',
    slug: 'din-2353-bite-type-adapters-uae',
    seoTitle: 'DIN 2353 Bite Type Adapters in UAE — 24° Cone',
    focusKeyword: 'din 2353 bite type adapters',
  },
]

/** Mirrors the two checks in scoreEntity that a rename can break. */
function validate(r: Rename): string[] {
  const errs: string[] = []
  const len = r.seoTitle.length
  if (len < TITLE_RANGE.min || len > TITLE_RANGE.max) {
    errs.push(`title is ${len} chars, outside ${TITLE_RANGE.min}–${TITLE_RANGE.max}`)
  }
  const k = r.focusKeyword.toLowerCase()
  if (!r.seoTitle.toLowerCase().includes(k)) errs.push(`keyword "${k}" is not in the title`)
  const url = `/${r.slug}`.toLowerCase()
  if (!url.includes(k.replace(/\s+/g, '-')) && !url.includes(k)) {
    errs.push(`keyword "${k}" is not in the slug`)
  }
  return errs
}

/**
 * Three places store a category slug as a literal string rather than a
 * foreign key, so a rename does not reach them:
 *
 *   - `nav_menu_items.customUrl` on `custom_url` items. The megamenu needs
 *     these because its entries carry `?sub=` filters, which an FK link
 *     cannot express — so the query string has to survive the rewrite.
 *   - `blog_posts.bodyBlocks`, where a `category_link` block holds a slug.
 *     These fail soft (the card silently disappears), which is worse than
 *     failing loudly.
 *   - `industries.featuredCategorySlugs`.
 *
 * Everything else — breadcrumbs, the sitemap, `linkType: 'category'` nav
 * items — resolves through the FK and follows a rename on its own.
 */
async function carryReferences(
  tx: Prisma.TransactionClient,
  from: string,
  to: string,
): Promise<{ nav: number; blog: number; industries: number }> {
  // Rewrite only the path segment, so `?sub=hose` survives.
  const nav = await tx.$executeRaw`
    UPDATE nav_menu_items
    SET "customUrl" = regexp_replace("customUrl", ${`^/c/${from}(?=$|[?#])`}, ${`/c/${to}`})
    WHERE "linkType" = 'custom_url'
      AND "customUrl" ~ ${`^/c/${from}($|[?#])`}
  `

  const posts = await tx.blogPost.findMany({
    where: { bodyBlocks: { array_contains: [{ type: 'category_link', slug: from }] } },
    select: { id: true, bodyBlocks: true },
  })
  for (const p of posts) {
    const blocks = p.bodyBlocks as unknown
    if (!Array.isArray(blocks)) continue
    const next = blocks.map((b) =>
      b && typeof b === 'object' && (b as { type?: string }).type === 'category_link' &&
      (b as { slug?: string }).slug === from
        ? { ...(b as object), slug: to }
        : b,
    )
    await tx.blogPost.update({ where: { id: p.id }, data: { bodyBlocks: next as Prisma.InputJsonValue } })
  }

  const inds = await tx.industry.findMany({
    where: { featuredCategorySlugs: { array_contains: from } },
    select: { id: true, featuredCategorySlugs: true },
  })
  for (const i of inds) {
    const slugs = i.featuredCategorySlugs as unknown
    if (!Array.isArray(slugs)) continue
    await tx.industry.update({
      where: { id: i.id },
      data: { featuredCategorySlugs: slugs.map((s) => (s === from ? to : s)) as Prisma.InputJsonValue },
    })
  }

  return { nav, blog: posts.length, industries: inds.length }
}

/** Same three sources, counted for the dry run. */
async function countReferences(): Promise<Map<string, { nav: number; blog: number; industries: number }>> {
  const out = new Map<string, { nav: number; blog: number; industries: number }>()
  for (const r of RENAMES) {
    const nav = await db.navMenuItem.count({
      where: { linkType: 'custom_url', customUrl: { startsWith: `/c/${r.from}` } },
    })
    const blog = await db.blogPost.count({
      where: { bodyBlocks: { array_contains: [{ type: 'category_link', slug: r.from }] } },
    })
    const industries = await db.industry.count({
      where: { featuredCategorySlugs: { array_contains: r.from } },
    })
    out.set(r.from, { nav, blog, industries })
  }
  return out
}

async function main() {
  const apply = process.argv.includes('--apply')

  let invalid = 0
  for (const r of RENAMES) {
    const errs = validate(r)
    if (errs.length) {
      invalid++
      console.error(`INVALID ${r.from}:`)
      for (const e of errs) console.error(`   ${e}`)
    }
  }
  if (invalid) {
    console.error(`\n${invalid} invalid rename(s). Nothing written.`)
    await db.$disconnect()
    process.exitCode = 1
    return
  }
  console.log(`all ${RENAMES.length} renames validate (title length, keyword in title and slug)\n`)

  for (const r of RENAMES) {
    const current = await db.category.findUnique({
      where: { slug: r.from },
      select: { id: true, name: true, seoTitle: true },
    })
    if (!current) {
      console.log(`SKIP ${r.from} — not found (already renamed?)`)
      continue
    }
    const taken = await db.category.findUnique({ where: { slug: r.slug }, select: { id: true } })
    if (taken && taken.id !== current.id) {
      console.error(`ABORT ${r.from} — target slug ${r.slug} is already used by another category`)
      process.exitCode = 1
      await db.$disconnect()
      return
    }

    console.log(`${r.from}`)
    console.log(`  slug   -> ${r.slug}`)
    console.log(`  title  -> ${r.seoTitle} (${r.seoTitle.length})`)
    console.log(`  kw     -> ${r.focusKeyword}`)

    if (!apply) continue

    await db.$transaction(async (tx) => {
      await tx.category.update({
        where: { id: current.id },
        data: { slug: r.slug, seoTitle: r.seoTitle, focusKeyword: r.focusKeyword },
      })
      await recordSlugRedirect(tx, {
        fromPath: `/c/${r.from}`,
        toPath: `/c/${r.slug}`,
        notes: 'Category moved to an intent-phrase URL',
      })
      const carried = await carryReferences(tx, r.from, r.slug)
      console.log(
        `  written — nav ${carried.nav}, blog ${carried.blog}, industries ${carried.industries}`,
      )
    })
  }

  if (!apply) {
    const refs = await countReferences()
    console.log('\nreferences that will be carried across:')
    for (const [slug, c] of refs) {
      if (c.nav + c.blog + c.industries === 0) continue
      console.log(`  ${slug}: nav ${c.nav}, blog ${c.blog}, industries ${c.industries}`)
    }
    console.log('\nDRY RUN — pass --apply to write.')
  }
  await db.$disconnect()
}

main()
