/**
 * GSC 2026-11-20 market meta rewrite — live DB, no deploy.
 *
 * Rewrites the per-country meta title and description (`hero.meta_title`,
 * `hero.meta_description`) of the `market/<slug>` Pages & Blocks documents
 * whose Search Console numbers say they are winnable: average position <= 20
 * with >= 30 impressions, or >= 100 impressions at a CTR under 2% (90 days to
 * 2026-11-19). Russia and Belarus (screening-first copy) and the seven markets
 * whose meta was rewritten earlier on 2026-11-20 are not in the payload.
 *
 * Touches only those two fields. A market with no document yet (Sri Lanka,
 * Lebanon) gets one built the way the 2026-10-10 seed built the others: every
 * section in template order, filled from the record's own copy, so the page
 * body renders exactly as it does today.
 *
 * Refuses to write unless, for every market:
 *   - `validateSections` passes,
 *   - the rendered page body (`applyMarketCopy`) is identical before and after,
 *   - `marketMeta` returns the new title and description,
 *   - no list field becomes empty that was not empty before.
 *
 * The storefront appends " | Indus Hydraulics" (19 chars), so a stored title
 * is held to 41 characters (60 rendered); descriptions to 155.
 *
 *   tsx src/imports/2026-11-20-market-meta-rewrite/run.ts                    dry run: old -> new
 *   tsx src/imports/2026-11-20-market-meta-rewrite/run.ts --backup=<file>    save rollback, then write
 *   tsx src/imports/2026-11-20-market-meta-rewrite/run.ts --rollback=<file>  restore from that file
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  MARKET_PAGES,
  MARKET_SECTIONS,
  applyMarketCopy,
  marketBySlug,
  marketCopyValues,
  marketMeta,
  marketPageDef,
  subPageContentKey,
  validateSections,
  type SectionValues,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Row = { slug: string; meta_title: string; meta_description?: string }
type Backup = Array<{ key: string; existed: boolean; sections: StoredSection[] | null }>

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(readFileSync(path.join(HERE, 'payload.json'), 'utf8')) as Row[]
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const BACKUP = arg('backup')
const ROLLBACK = arg('rollback')

const SUFFIX = ' | Indus Hydraulics'
const HELD = new Set(['russia', 'belarus'])

const valuesOf = (sections: StoredSection[]) => (k: string) =>
  (sections.find((s) => s.key === k)?.values ?? {}) as SectionValues

/** Paths of every empty array in a section list, e.g. `sectors.items`. */
function emptyLists(sections: StoredSection[]): Set<string> {
  const out = new Set<string>()
  for (const s of sections)
    for (const [f, v] of Object.entries(s.values ?? {})) if (Array.isArray(v) && v.length === 0) out.add(`${s.key}.${f}`)
  return out
}

async function rollback(file: string): Promise<void> {
  const snap = JSON.parse(readFileSync(file, 'utf8')) as Backup
  for (const b of snap) {
    if (b.existed) {
      await db.pageContent.update({
        where: { key: b.key },
        data: { sections: b.sections as unknown as Prisma.InputJsonValue },
      })
    } else {
      await db.pageContent.deleteMany({ where: { key: b.key } })
    }
    console.log(`  ↺ ${b.key}`)
  }
  console.log(`Rolled back ${snap.length} market document(s)`)
}

async function main(): Promise<void> {
  if (ROLLBACK) return rollback(ROLLBACK)

  const errors: string[] = []
  const docs = await db.pageContent.findMany({
    where: { key: { in: payload.map((r) => subPageContentKey('market', r.slug)) } },
    select: { key: true, sections: true },
  })
  const byKey = new Map(docs.map((d) => [d.key, (Array.isArray(d.sections) ? d.sections : []) as StoredSection[]]))
  const planned: Array<{ key: string; existed: boolean; before: StoredSection[] | null; sections: StoredSection[] }> = []

  for (const r of payload) {
    const tag = r.slug
    if (HELD.has(r.slug)) errors.push(`${tag}: held market, not to be rewritten`)
    if ((r.meta_title + SUFFIX).length > 60) errors.push(`${tag}: title ${(r.meta_title + SUFFIX).length} chars rendered`)
    if (r.meta_description && r.meta_description.length > 155)
      errors.push(`${tag}: description ${r.meta_description.length} chars`)

    const market = marketBySlug(r.slug)
    const record = MARKET_PAGES[r.slug]
    if (!market || !record) {
      errors.push(`${tag}: no market record`)
      continue
    }
    const key = subPageContentKey('market', r.slug)
    const stored = byKey.get(key) ?? null

    // A missing document is built as the 2026-10-10 seed built the rest: the
    // record's own copy, every section in template order.
    let base: StoredSection[]
    if (stored) {
      base = stored
    } else {
      const copy = marketCopyValues(record)
      base = MARKET_SECTIONS.map((def) => ({ key: def.key, enabled: true, values: { ...(copy[def.key] ?? {}) } }) as StoredSection)
    }
    const order = MARKET_SECTIONS.map((d) => d.key)
    if (base.map((s) => s.key).join() !== order.join()) errors.push(`${tag}: sections not in template order`)

    const next = base.map((s) =>
      s.key !== 'hero'
        ? s
        : ({
            ...s,
            values: {
              ...(s.values ?? {}),
              meta_title: r.meta_title,
              ...(r.meta_description ? { meta_description: r.meta_description } : {}),
            },
          } as StoredSection)
    )

    const result = validateSections(marketPageDef(market), next)
    if (!result.ok) {
      for (const i of result.issues) errors.push(`${tag} — ${i.section}.${i.field}: ${i.message}`)
      continue
    }
    const written = result.sections as StoredSection[]

    const bodyBefore = stored ? applyMarketCopy(record, valuesOf(stored)) : record
    const bodyAfter = applyMarketCopy(record, valuesOf(written))
    if (!isDeepStrictEqual(JSON.parse(JSON.stringify(bodyBefore)), JSON.parse(JSON.stringify(bodyAfter))))
      errors.push(`${tag}: page body would change`)

    const meta = marketMeta(valuesOf(written))
    if (meta.title !== r.meta_title) errors.push(`${tag}: title would not render`)
    if (r.meta_description && meta.description !== r.meta_description) errors.push(`${tag}: description would not render`)

    const beforeEmpty = emptyLists(stored ?? [])
    const newlyEmpty = [...emptyLists(written)].filter((p) => !beforeEmpty.has(p))
    // A new document may carry an empty list only where the record itself has none.
    if (stored && newlyEmpty.length) errors.push(`${tag}: lists would empty: ${newlyEmpty.join(', ')}`)
    if (!stored && newlyEmpty.length) console.log(`  · ${tag}: new doc empty lists ${newlyEmpty.join(', ')}`)

    const oldMeta = marketMeta(valuesOf(stored ?? []))
    const oldTitle = oldMeta.title ?? `Hydraulic & Industrial Hose Supplier in ${market.name}`
    const oldDesc = oldMeta.description ?? market.summary
    console.log(`\n${tag}${stored ? '' : ' (new document)'}`)
    console.log(`  T - ${oldTitle}\n  T + ${r.meta_title}`)
    if (r.meta_description) console.log(`  D - ${oldDesc}\n  D + ${r.meta_description}`)

    planned.push({ key, existed: !!stored, before: stored, sections: written })
  }

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exitCode = 1
    return
  }
  console.log(`\n${planned.length} market document(s) validated`)
  if (!BACKUP) return console.log('dry run: nothing written (pass --backup=<file> to write)')

  const snap: Backup = planned.map((p) => ({ key: p.key, existed: p.existed, sections: p.before }))
  writeFileSync(BACKUP, JSON.stringify(snap, null, 1))
  console.log(`rollback saved: ${BACKUP}`)

  for (const p of planned) {
    const sections = p.sections as unknown as Prisma.InputJsonValue
    if (p.existed) await db.pageContent.update({ where: { key: p.key }, data: { sections } })
    else await db.pageContent.create({ data: { key: p.key, kind: 'market', sections } })
    console.log(`  ✓ ${p.key}`)
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
