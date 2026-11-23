/**
 * Phase 2 of the location-pages rebuild: load the written content for the
 * nine `/locations/<slug>` pages and the `/locations` hub FAQ.
 *
 * Writes `location/<slug>` (kind `location`) with every LOCATION_SECTIONS band
 * in template order — a partial document renders its bands above the H1 — and
 * `master/locations` with the hub defaults plus the FAQ. Every document is run
 * through `validateSections` against its own definition first; one invalid
 * document stops the whole run with nothing written.
 *
 * Content rules (owner decisions 2026-11-23): hose work only — no flushing,
 * testing or repair services; no premises outside Dubai; no response or
 * arrival times. `content/*.json` was checked against those rules by script
 * before it was committed.
 *
 * RUN AFTER the code that reads `location/*` is deployed, and at least an hour
 * after that deploy (pooler). Then purge the `page-content` tag and send
 * IndexNow for /locations and the nine area URLs.
 *
 *   bun packages/db/src/imports/2026-11-23-location-pages/run.ts --dry-run
 *   bun packages/db/src/imports/2026-11-23-location-pages/run.ts --backup=/abs/backup.json
 *   bun packages/db/src/imports/2026-11-23-location-pages/run.ts --rollback=/abs/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LOCATION_SECTIONS,
  getMasterPage,
  locationPageDef,
  masterContentKey,
  serviceAreasOrdered,
  subPageContentKey,
  validateSections,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)
const ROLLBACK = process.argv.find((a) => a.startsWith('--rollback='))?.slice('--rollback='.length)
const HERE = path.dirname(fileURLToPath(import.meta.url))

type AreaContent = {
  slug: string
  meta_title: string
  meta_description: string
  zones: { body: string | null; items: { name: string; desc: string }[] }
  industries: {
    body: string | null
    items: { name: string; desc: string; industry: string | null }[]
  }
  access: { checklist: string[] }
  faq: { q: string; a: string }[]
}

type Planned = { key: string; kind: string; sections: StoredSection[]; before: unknown }

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(HERE, 'content', file), 'utf8')) as T
}

/** One area's document: every band in template order, our values where we have them. */
function areaSections(c: AreaContent): StoredSection[] {
  const values: Record<string, Record<string, unknown>> = {
    hero: { meta_title: c.meta_title, meta_description: c.meta_description },
    zones: {
      body: c.zones.body,
      items: c.zones.items.map((z) => ({ enabled: true, name: z.name, desc: z.desc })),
    },
    industries: {
      body: c.industries.body,
      items: c.industries.items.map((i) => ({ name: i.name, desc: i.desc, industry: i.industry })),
    },
    access: { checklist: c.access.checklist.join('\n') },
    faq: { items: c.faq.map((f) => ({ q: f.q, a: f.a })) },
  }
  return LOCATION_SECTIONS.map(
    (def): StoredSection =>
      ({ key: def.key, enabled: true, values: { ...def.defaults, ...values[def.key] } }) as StoredSection
  )
}

async function rollback(file: string): Promise<void> {
  const rows = JSON.parse(readFileSync(file, 'utf8')) as { key: string; before: unknown }[]
  for (const row of rows) {
    if (row.before === null) await db.pageContent.deleteMany({ where: { key: row.key } })
    else
      await db.pageContent.update({
        where: { key: row.key },
        data: { sections: row.before as Prisma.InputJsonValue },
      })
  }
  console.log(`rolled back ${rows.length} document(s) from ${file}`)
}

async function main(): Promise<void> {
  if (ROLLBACK) return rollback(ROLLBACK)

  const errors: string[] = []
  const planned: Planned[] = []
  const areas = serviceAreasOrdered()
  const keys = [...areas.map((a) => subPageContentKey('location', a.slug)), masterContentKey('locations')]
  const existing = await db.pageContent.findMany({
    where: { key: { in: keys } },
    select: { key: true, sections: true },
  })
  const before = new Map(existing.map((d) => [d.key, d.sections]))

  for (const area of areas) {
    let content: AreaContent
    try {
      content = readJson<AreaContent>(`${area.slug}.json`)
    } catch {
      errors.push(`${area.slug}: no content/${area.slug}.json`)
      continue
    }
    if (content.slug !== area.slug) errors.push(`${area.slug}: file slug is ${content.slug}`)
    const result = validateSections(locationPageDef(area), areaSections(content))
    if (!result.ok) {
      for (const i of result.issues) errors.push(`${area.slug} — ${i.section}.${i.field}: ${i.message}`)
      continue
    }
    const key = subPageContentKey('location', area.slug)
    planned.push({ key, kind: 'location', sections: result.sections, before: before.get(key) ?? null })
  }

  // The hub: its shipped defaults, plus the FAQ. An existing document's other
  // edits are kept — only the FAQ band is replaced.
  const hubDef = getMasterPage('locations')
  if (!hubDef) errors.push('master page "locations" is not registered')
  else {
    const hub = readJson<{ faq: { q: string; a: string }[] }>('hub.json')
    const key = masterContentKey('locations')
    const stored = (before.get(key) as StoredSection[] | undefined) ?? []
    const storedByKey = new Map(stored.map((s) => [s.key, s]))
    const sections = hubDef.sections.map((def): StoredSection => {
      const prev = storedByKey.get(def.key)
      const base = { ...def.defaults, ...(prev?.values ?? {}) }
      return {
        key: def.key,
        enabled: prev?.enabled ?? true,
        values: def.key === 'faq' ? { ...base, items: hub.faq } : base,
      } as StoredSection
    })
    const result = validateSections(hubDef, sections)
    if (!result.ok) for (const i of result.issues) errors.push(`hub — ${i.section}.${i.field}: ${i.message}`)
    else planned.push({ key, kind: 'master', sections: result.sections, before: before.get(key) ?? null })
  }

  console.log(
    planned.map((p) => `${p.before ? 'update' : 'create'} ${p.key} (${p.sections.length} bands)`).join('\n')
  )
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }
  if (DRY_RUN) return console.log('\n--dry-run: validated, nothing written')
  if (!BACKUP) throw new Error('--backup=<file> is required to write')
  writeFileSync(BACKUP, JSON.stringify(planned.map((p) => ({ key: p.key, before: p.before })), null, 1))

  for (const p of planned) {
    const sections = p.sections as unknown as Prisma.InputJsonValue
    await db.pageContent.upsert({
      where: { key: p.key },
      create: { key: p.key, kind: p.kind, sections },
      update: { sections },
    })
  }
  console.log(`\nwritten ${planned.length} document(s); backup ${BACKUP}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
