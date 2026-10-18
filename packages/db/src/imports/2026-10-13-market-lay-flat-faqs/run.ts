/**
 * Adds one lay flat hose FAQ to each of the 18 GCC and European market pages (2026-10-13), so each
 * page answers the lay flat question for its own applications — dewatering and frac water in the
 * GCC, slurry umbilical systems, over-pumping, mining and snowmaking in Europe. No deploy: it writes
 * the `faq` values of the `market/<slug>` Pages & Blocks documents.
 *
 * Appends, or replaces an existing item with the same question, so a re-run is idempotent. Refuses
 * a market whose merged page would not render the new FAQ.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-market-lay-flat-faqs/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-13-market-lay-flat-faqs/run.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  MARKET_PAGES,
  applyMarketCopy,
  marketBySlug,
  marketPageDef,
  subPageContentKey,
  validateSections,
  type SectionValues,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Row = { slug: string; faq: { q: string; a: string } }

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(readFileSync(path.join(HERE, 'payload.json'), 'utf8')) as Row[]
const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)

async function main(): Promise<void> {
  const errors: string[] = []
  const docs = await db.pageContent.findMany({
    where: { key: { in: payload.map((r) => subPageContentKey('market', r.slug)) } },
    select: { key: true, sections: true },
  })
  const docByKey = new Map(docs.map((d) => [d.key, (Array.isArray(d.sections) ? d.sections : []) as StoredSection[]]))
  const planned: Array<{ key: string; sections: StoredSection[]; before: StoredSection[] }> = []

  for (const r of payload) {
    const market = marketBySlug(r.slug)
    const record = MARKET_PAGES[r.slug]
    const key = subPageContentKey('market', r.slug)
    const stored = docByKey.get(key)
    if (!market || !record || !stored) {
      errors.push(`${r.slug}: no market record or document`)
      continue
    }
    const sections = stored.map((s) => {
      if (s.key !== 'faq') return s
      const items = ((s.values?.items as Array<{ q: string; a: string }>) ?? []).filter((i) => i.q !== r.faq.q)
      return { ...s, values: { ...(s.values ?? {}), items: [...items, r.faq] } } as StoredSection
    })
    const result = validateSections(marketPageDef(market), sections)
    if (!result.ok) {
      for (const i of result.issues) errors.push(`${r.slug} — ${i.section}.${i.field}: ${i.message}`)
      continue
    }
    const values = (k: string) => (result.sections.find((s) => s.key === k)?.values ?? {}) as SectionValues
    const page = applyMarketCopy(record, values)
    if (!page.faqs.some((f) => f.question === r.faq.q)) errors.push(`${r.slug}: the new FAQ would not render`)
    planned.push({ key, sections: result.sections as StoredSection[], before: stored })
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${planned.length} market page(s) validated`)
  if (DRY_RUN) return
  if (BACKUP) writeFileSync(BACKUP, JSON.stringify(planned.map((p) => ({ key: p.key, sections: p.before })), null, 1))
  for (const p of planned) {
    await db.pageContent.update({ where: { key: p.key }, data: { sections: p.sections as unknown as Prisma.InputJsonValue } })
    console.log(`  ✓ ${p.key}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
