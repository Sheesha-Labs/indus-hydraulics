/**
 * Localised copy for the top 20 export markets — GCC, Iraq and Africa
 * (2026-10-10, approved by Ayush). No deploy: it writes Pages & Blocks values
 * that `applyMarketCopy` lays over each market record.
 *
 * Per market: meta title and description, the opening paragraph, the four hero
 * facts, the six sectors and 10–12 FAQs (the two template questions every
 * market page carried — currency, branch — replaced with country-specific
 * ones). Regulatory, document and transit statements come only from the
 * forwarder-verified records. The makes listed in oilfield answers are listed,
 * never described as an authorisation (Ayush, 2026-10-10).
 *
 * RUN AFTER the market-copy seed (2026-10-10-market-copy-seed): every market
 * must already have its `market/<slug>` document. The runner refuses any market
 * whose document is missing, and any value `applyMarketCopy` would not use
 * (a list at the wrong count, a duplicated sector) — so nothing it writes is
 * silently ignored on the live page.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-market-top20/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-10-market-top20/run.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  MARKET_PAGES,
  applyMarketCopy,
  marketBySlug,
  marketMeta,
  marketPageDef,
  subPageContentKey,
  validateSections,
  type SectionValues,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Copy = {
  slug: string
  meta_title: string
  meta_description: string
  lede: string
  facts: Array<{ label: string; value: string }>
  sectors: Array<{ slug: string; name: string; description: string }>
  faqs: Array<{ q: string; a: string }>
}

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(readFileSync(path.join(HERE, 'payload.json'), 'utf8')) as Copy[]
const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)

async function main(): Promise<void> {
  const errors: string[] = []
  const docs = await db.pageContent.findMany({
    where: { key: { in: payload.map((c) => subPageContentKey('market', c.slug)) } },
    select: { key: true, sections: true },
  })
  const docByKey = new Map(
    docs.map((d) => [d.key, (Array.isArray(d.sections) ? d.sections : []) as StoredSection[]])
  )
  const planned: Array<{ key: string; sections: StoredSection[]; before: StoredSection[] }> = []

  for (const c of payload) {
    const market = marketBySlug(c.slug)
    const record = MARKET_PAGES[c.slug]
    const key = subPageContentKey('market', c.slug)
    const stored = docByKey.get(key)
    if (!market || !record) {
      errors.push(`${c.slug}: no market record`)
      continue
    }
    if (!stored) {
      errors.push(`${c.slug}: no ${key} document — run the market-copy seed first`)
      continue
    }

    const set: Record<string, Record<string, unknown>> = {
      hero: {
        lede: c.lede,
        facts: c.facts,
        meta_title: c.meta_title,
        meta_description: c.meta_description,
      },
      sectors: { items: c.sectors },
      faq: { items: c.faqs },
    }
    const sections = stored.map((s) =>
      set[s.key] ? ({ ...s, values: { ...(s.values ?? {}), ...set[s.key] } } as StoredSection) : s
    )
    const result = validateSections(marketPageDef(market), sections)
    if (!result.ok) {
      for (const i of result.issues)
        errors.push(`${c.slug} — ${i.section}.${i.field}: ${i.message}`)
      continue
    }

    // Prove every field takes effect: the merged page must carry exactly the
    // payload, not the record it would fall back to.
    const values = (k: string) =>
      (result.sections.find((s) => s.key === k)?.values ?? {}) as SectionValues
    const page = applyMarketCopy(record, values)
    const meta = marketMeta(values)
    if (page.lede !== c.lede.trim()) errors.push(`${c.slug}: lede would not apply`)
    if (page.facts.map((f) => f.value).join('|') !== c.facts.map((f) => f.value.trim()).join('|'))
      errors.push(`${c.slug}: facts would not apply`)
    if (
      page.sectors.map((s) => s.description).join('|') !==
      c.sectors.map((s) => s.description.trim()).join('|')
    )
      errors.push(`${c.slug}: sectors would not apply`)
    if (page.faqs.length !== c.faqs.length || page.faqs[0]?.question !== c.faqs[0]?.q.trim())
      errors.push(`${c.slug}: faqs would not apply`)
    if (meta.title !== c.meta_title.trim() || meta.description !== c.meta_description.trim())
      errors.push(`${c.slug}: meta would not apply`)

    planned.push({ key, sections: result.sections, before: stored })
  }

  console.log(`${planned.length} market documents to update`)
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
    await db.pageContent.update({
      where: { key: p.key },
      data: { sections: p.sections as unknown as Prisma.InputJsonValue },
    })
  }
  console.log(`written ${planned.length}; backup ${BACKUP}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
