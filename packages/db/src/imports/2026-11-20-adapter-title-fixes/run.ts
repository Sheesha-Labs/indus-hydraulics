/**
 * Applies ./plans.ts: title, SEO title, and the title at the head of the short
 * and SEO descriptions, for 64 adapter listings.
 *
 * Content, not code: no deploy. Guards: each row's current title must equal
 * `from` (or already equal `to`, which counts as done), so a listing someone
 * edited since the plan was made is reported, not overwritten. Description
 * heads are replaced only where they start with `${from} — `.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-adapter-title-fixes/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-adapter-title-fixes/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { db } from '../../index'
import { ADAPTER_TITLE_FIXES } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

const swapHead = (text: string | null, from: string, to: string): string | null =>
  text && text.startsWith(`${from} — `) ? `${to}${text.slice(from.length)}` : text

async function main(): Promise<void> {
  const rows = await db.product.findMany({
    where: { slug: { in: ADAPTER_TITLE_FIXES.map((f) => f.slug) } },
    select: { id: true, slug: true, title: true, seoTitle: true, descriptionShort: true, seoDescription: true },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  const errors: string[] = []
  const todo: Array<{ row: (typeof rows)[number]; fix: (typeof ADAPTER_TITLE_FIXES)[number] }> = []
  let done = 0
  for (const fix of ADAPTER_TITLE_FIXES) {
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
        seoTitle: row.seoTitle === fix.from || !row.seoTitle ? fix.to : row.seoTitle,
        descriptionShort: swapHead(row.descriptionShort, fix.from, fix.to),
        seoDescription: swapHead(row.seoDescription, fix.from, fix.to),
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
