/**
 * Seed every market's Pages & Blocks document with the copy its record renders
 * today (2026-10-10, approved by Ayush: "all market copy" into the CMS).
 *
 * After this, market copy is edited in Pages & Blocks · Markets and goes live
 * without a deploy. The seed is a pure copy: `applyMarketCopy(record, seeded)`
 * equals the record (pinned by market-copy.test.ts), so no visitor sees a
 * change on the day it runs.
 *
 * Writes `market/<slug>` for every market with a record, in template order (a
 * partial document renders its bands above the H1). An existing document is
 * kept: its stored values win, and only empty copy fields are filled.
 *
 * RUN AFTER the code that reads these fields is deployed — on older code the
 * extra fields are inert, but there is no reason to write them first.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-market-copy-seed/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-market-copy-seed/run.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import {
  MARKET_PAGES,
  MARKET_SECTIONS,
  marketBySlug,
  marketCopyValues,
  marketPageDef,
  subPageContentKey,
  validateSections,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)

const isEmpty = (v: unknown) =>
  v === null ||
  v === undefined ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0)

async function main(): Promise<void> {
  const errors: string[] = []
  const slugs = Object.keys(MARKET_PAGES)
  const existing = await db.pageContent.findMany({
    where: { key: { in: slugs.map((s) => subPageContentKey('market', s)) } },
    select: { key: true, sections: true },
  })
  const byKey = new Map(
    existing.map((d) => [d.key, (Array.isArray(d.sections) ? d.sections : []) as StoredSection[]])
  )

  const planned: Array<{
    key: string
    sections: StoredSection[]
    mode: 'create' | 'update'
    before: unknown
  }> = []
  for (const slug of slugs) {
    const market = marketBySlug(slug)
    const page = MARKET_PAGES[slug]!
    if (!market) {
      errors.push(`${slug}: no market`)
      continue
    }
    const key = subPageContentKey('market', slug)
    const stored = byKey.get(key)
    const storedByKey = new Map((stored ?? []).map((s) => [s.key, s]))
    const copy = marketCopyValues(page)

    const sections = MARKET_SECTIONS.map((def): StoredSection => {
      const prev = storedByKey.get(def.key)
      const values: Record<string, unknown> = { ...(prev?.values ?? {}) }
      for (const [field, value] of Object.entries(copy[def.key] ?? {})) {
        if (isEmpty(values[field])) values[field] = value
      }
      return { key: def.key, enabled: prev?.enabled ?? true, values } as StoredSection
    })
    const result = validateSections(marketPageDef(market), sections)
    if (!result.ok) {
      for (const i of result.issues) errors.push(`${slug} — ${i.section}.${i.field}: ${i.message}`)
      continue
    }
    planned.push({
      key,
      sections: result.sections,
      mode: stored ? 'update' : 'create',
      before: stored ?? null,
    })
  }

  console.log(
    `${planned.filter((p) => p.mode === 'create').length} to create, ${planned.filter((p) => p.mode === 'update').length} to update`
  )
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }
  if (DRY_RUN) return console.log('--dry-run: validated, nothing written')
  if (!BACKUP) throw new Error('--backup=<file> is required to write')
  writeFileSync(
    BACKUP,
    JSON.stringify(
      planned.map((p) => ({ key: p.key, before: p.before })),
      null,
      1
    )
  )

  for (const p of planned) {
    const sections = p.sections as unknown as Prisma.InputJsonValue
    if (p.mode === 'create')
      await db.pageContent.create({ data: { key: p.key, kind: 'market', sections } })
    else await db.pageContent.update({ where: { key: p.key }, data: { sections } })
  }
  console.log(`written ${planned.length} market documents; backup ${BACKUP}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
