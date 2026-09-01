/**
 * Blog taxonomy seed — ten categories and four author profiles.
 *
 * Idempotent: upserts by `slug`, so re-running leaves the database in the
 * same state. Editorial fields an admin may have changed by hand — heroCopy,
 * bio, credentials, avatar — are written on CREATE only, never on update, so
 * this script cannot overwrite someone's edits by being run twice.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-17-blog-taxonomy/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-17-blog-taxonomy/run.ts --dry-run
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import CATEGORIES from './categories'
import AUTHORS from './authors'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const slugs = new Set<string>()
  for (const c of CATEGORIES) {
    if (slugs.has(c.slug)) throw new Error(`duplicate category slug: ${c.slug}`)
    slugs.add(c.slug)
  }

  const authorSlugs = new Set<string>()
  for (const a of AUTHORS) {
    if (authorSlugs.has(a.slug)) throw new Error(`duplicate author slug: ${a.slug}`)
    authorSlugs.add(a.slug)
  }

  console.log(
    `${DRY_RUN ? '[dry-run] ' : ''}seeding ${CATEGORIES.length} categories, ${AUTHORS.length} authors`,
  )

  if (DRY_RUN) {
    for (const c of CATEGORIES) console.log(`  category  /blog/c/${c.slug} — ${c.name}`)
    for (const a of AUTHORS) console.log(`  author    /blog/author/${a.slug} — ${a.name}`)
    return
  }

  for (const c of CATEGORIES) {
    await db.blogCategory.upsert({
      where: { slug: c.slug },
      // Name and ordering are structural and safe to re-assert. heroCopy and
      // description are editorial — an admin may have rewritten them, so they
      // are create-only.
      update: { name: c.name, position: c.position, isPublished: true },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        heroCopy: c.heroCopy,
        position: c.position,
        isPublished: true,
      },
    })
    console.log(`  ✓ category ${c.slug}`)
  }

  for (const a of AUTHORS) {
    await db.blogAuthor.upsert({
      where: { slug: a.slug },
      update: { name: a.name, jobTitle: a.jobTitle, position: a.position },
      create: {
        slug: a.slug,
        name: a.name,
        jobTitle: a.jobTitle,
        // `?? null` not `?? 0`: the column is nullable and a real person's
        // years of experience is a published claim, not a default.
        yearsExperience: a.yearsExperience ?? null,
        position: a.position,
        isPublished: true,
      },
    })
    console.log(`  ✓ author ${a.slug}`)
  }

  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
