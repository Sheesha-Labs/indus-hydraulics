/**
 * Applies ./plans.ts: title and SEO title for 596 lifting listings. The SEO
 * title is replaced only where it is the old title, with or without its dash.
 * Descriptions are left alone: they already state the ranges.
 *
 * Content, not code: no deploy. Guards: each row's current title must equal
 * `from` (or already equal `to`, which counts as done), so a listing someone
 * edited since the plan was made is reported, not overwritten.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-lifting-title-enrichment/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-lifting-title-enrichment/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { db } from '../../index'
import { LIFTING_TITLE_FIXES } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

/** The SEO title is the old title, or the old title with its dash dropped. */
const isOldSeoTitle = (seo: string | null, from: string): boolean =>
  !seo || seo === from || seo === from.replace(' — ', ' ')

async function main(): Promise<void> {
  const rows = await db.product.findMany({
    where: { slug: { in: LIFTING_TITLE_FIXES.map((f) => f.slug) } },
    select: { id: true, slug: true, title: true, seoTitle: true, descriptionShort: true, seoDescription: true },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  const errors: string[] = []
  const todo: Array<{ row: (typeof rows)[number]; fix: (typeof LIFTING_TITLE_FIXES)[number] }> = []
  let done = 0
  for (const fix of LIFTING_TITLE_FIXES) {
    const row = bySlug.get(fix.slug)
    if (!row) errors.push(`${fix.slug}: not found`)
    else if (row.title === fix.to) done++
    else if (row.title !== fix.from) errors.push(`${fix.slug}: title is now "${row.title}", expected "${fix.from}"`)
    else if (fix.to.length > 70) errors.push(`${fix.slug}: new title is ${fix.to.length} chars`)
    else todo.push({ row, fix })
  }
  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${todo.length} listing(s) to retitle, ${done} already done`)
  if (DRY_RUN) return
  if (!ROLLBACK_FILE) {
    console.error('refusing to write without --rollback-file=<absolute path>')
    process.exitCode = 1
    return
  }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(todo.map(({ row }) => row)))
  console.log(`rollback written: ${ROLLBACK_FILE}`)
  for (const { row, fix } of todo) {
    await db.product.update({
      where: { id: row.id },
      data: {
        title: fix.to,
        seoTitle: isOldSeoTitle(row.seoTitle, fix.from) ? fix.to : row.seoTitle,
      },
    })
    console.log(`  ✓ /p/${fix.slug}`)
  }
  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
