/**
 * Bring every category's title and meta description inside what Google shows.
 *
 * MEASURED BEFORE WRITING THIS: of 195 categories, 97 had a title that ran
 * past the SERP budget once the layout appended " | Indus Hydraulics", 88 had
 * a meta description over 160 characters, and 52 had neither field set at all
 * and were falling back to the category name and its on-page paragraph.
 *
 * The derivation is pure and unit-tested in `@indus/domain` →
 * `seo/category-meta.ts`. Nothing here writes a sentence that was not already
 * on the page: a title is cut down from the stored title, a description from
 * the stored description or the on-page paragraph. A category with nothing to
 * cut down is left alone and reported.
 *
 * RUN THE FOCUS-KEYWORD BACKFILL AFTER THIS, NOT BEFORE. A keyword is only
 * written when the phrase appears in BOTH the slug and the title, so 93
 * categories were skipped last time for want of a title. Fixing the titles
 * first is what lets them qualify — the other order does nothing.
 *
 * Idempotent: a second run finds nothing to change.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/backfill-category-seo-fields.ts [--apply]
 */
import { fitCategoryDescription, fitCategoryTitle, STORED_TITLE_BUDGET } from '@indus/domain'
import { db } from '../index'

type Change = {
  slug: string
  field: 'seoTitle' | 'seoDescription'
  before: string | null
  after: string
}

async function main() {
  const apply = process.argv.includes('--apply')
  const verbose = process.argv.includes('--verbose')

  const categories = await db.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      seoTitle: true,
      seoDescription: true,
      shortDescription: true,
    },
    orderBy: { slug: 'asc' },
  })

  const changes: Change[] = []
  const untouched: string[] = []
  const updates = new Map<string, { seoTitle?: string; seoDescription?: string }>()

  for (const c of categories) {
    const title = fitCategoryTitle(c.seoTitle, c.name)
    const description = fitCategoryDescription(c.seoDescription, c.shortDescription)

    if (!title && !description) {
      untouched.push(c.slug)
      continue
    }
    const update: { seoTitle?: string; seoDescription?: string } = {}
    if (title) {
      changes.push({ slug: c.slug, field: 'seoTitle', before: c.seoTitle, after: title })
      update.seoTitle = title
    }
    if (description) {
      changes.push({
        slug: c.slug,
        field: 'seoDescription',
        before: c.seoDescription,
        after: description,
      })
      update.seoDescription = description
    }
    updates.set(c.id, update)
  }

  // A title repeated across two shelves is two pages competing for one query.
  const titles = new Map<string, string[]>()
  for (const c of categories) {
    const final = updates.get(c.id)?.seoTitle ?? c.seoTitle ?? c.name
    const list = titles.get(final.toLowerCase()) ?? []
    list.push(c.slug)
    titles.set(final.toLowerCase(), list)
  }
  const collisions = [...titles.entries()].filter(([, slugs]) => slugs.length > 1)

  if (verbose) {
    for (const ch of changes) {
      console.log(`\n${ch.slug} · ${ch.field}`)
      console.log(`  before (${ch.before?.length ?? 0}): ${ch.before ?? '—'}`)
      console.log(`  after  (${ch.after.length}): ${ch.after}`)
    }
  }

  const titleChanges = changes.filter((c) => c.field === 'seoTitle')
  const descChanges = changes.filter((c) => c.field === 'seoDescription')
  const stillLong = titleChanges.filter((c) => c.after.length > STORED_TITLE_BUDGET)

  console.log(`\n[category-seo] ${categories.length} categories`)
  console.log(`  titles to rewrite:       ${titleChanges.length}`)
  console.log(`  descriptions to rewrite: ${descChanges.length}`)
  console.log(`  already fine:            ${untouched.length}`)
  if (stillLong.length > 0) {
    console.log(`  STILL OVER BUDGET:       ${stillLong.map((c) => c.slug).join(', ')}`)
  }
  if (collisions.length > 0) {
    console.log(`  DUPLICATE TITLES:`)
    for (const [title, slugs] of collisions) console.log(`    "${title}" — ${slugs.join(', ')}`)
  }

  if (!apply) {
    console.log('\n  dry run — pass --apply to write')
    return
  }

  for (const [id, data] of updates) {
    await db.category.update({ where: { id }, data })
  }
  console.log(`\n  applied to ${updates.size} categories`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
