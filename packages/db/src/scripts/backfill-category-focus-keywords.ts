/**
 * Backfill `Category.focusKeyword` for every published category.
 *
 * All 178 published categories shipped with `focusKeyword` NULL, so the
 * keyword checks in `scoreEntity` never ran for a single one of them. The SEO
 * health dashboard has been scoring categories out of a smaller denominator
 * than products since the SEO OS shipped, and the focus-keyword column has
 * been blank throughout.
 *
 * The derivation and the reasoning behind it live in
 * `@indus/domain` → `seo/focus-keyword.ts`, which is unit-tested. The short
 * version: a keyword that does not match *lowers* the score, so this only
 * writes keywords that clear both applicable checks and leaves the rest NULL.
 *
 * Dry-run by default. Pass `--apply` to write.
 *
 *   pnpm exec tsx --env-file=../../apps/web/.env.local \
 *     src/scripts/backfill-category-focus-keywords.ts [--apply]
 */
import { deriveCategoryFocusKeyword, CATEGORY_KEYWORD_MIN_WEIGHT } from '@indus/domain'
import { db } from '../index'

async function main() {
  const apply = process.argv.includes('--apply')

  const cats = await db.category.findMany({
    where: { isPublished: true },
    select: { id: true, slug: true, name: true, seoTitle: true, focusKeyword: true },
    orderBy: { slug: 'asc' },
  })

  const planned: { id: string; slug: string; keyword: string; weight: number }[] = []
  const skipped: { slug: string; reason: string }[] = []

  for (const c of cats) {
    if (c.focusKeyword) {
      skipped.push({ slug: c.slug, reason: `already set: "${c.focusKeyword}"` })
      continue
    }
    const best = deriveCategoryFocusKeyword(c.slug, c.name, c.seoTitle)
    if (!best) {
      skipped.push({ slug: c.slug, reason: 'no specific phrase appears in both title and slug' })
      continue
    }
    planned.push({ id: c.id, slug: c.slug, keyword: best.keyword, weight: best.weight })
  }

  console.log(`published categories: ${cats.length}`)
  console.log(`planned:              ${planned.length}`)
  console.log(`skipped:              ${skipped.length}\n`)

  console.log('  slug -> keyword')
  for (const p of planned) console.log(`  ${p.slug} -> "${p.keyword}"`)

  if (skipped.length) {
    console.log('\nskipped:')
    for (const s of skipped) console.log(`  ${s.slug}: ${s.reason}`)
  }

  const full = planned.filter((p) => p.weight === CATEGORY_KEYWORD_MIN_WEIGHT).length
  console.log(`\nkeywords scoring a full ${CATEGORY_KEYWORD_MIN_WEIGHT}/${CATEGORY_KEYWORD_MIN_WEIGHT}: ${full}/${planned.length}`)

  if (!apply) {
    console.log('\nDRY RUN — pass --apply to write.')
    await db.$disconnect()
    return
  }

  let written = 0
  for (const p of planned) {
    await db.category.update({ where: { id: p.id }, data: { focusKeyword: p.keyword } })
    written++
  }
  console.log(`\nwrote focusKeyword on ${written} categories.`)
  await db.$disconnect()
}

main()
