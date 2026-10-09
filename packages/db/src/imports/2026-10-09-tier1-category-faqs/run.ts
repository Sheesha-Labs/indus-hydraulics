/**
 * Answer-first copy for the 18 top-level category pages (ChatGPT / AI-search
 * visibility, tier 1), approved by Ayush 2026-10-09. No deploy: every field
 * is Pages & Blocks content the storefront already reads.
 *
 *   docs   — per category: the hero's opening paragraph (overrides the short
 *            description on the page), "How to choose" and "Standards" bands
 *            where the shelf had none, and up to eight FAQs (existing ones
 *            kept, one corrected). 4 documents updated, 14 created, all in
 *            template order (a partial document renders its bands above H1).
 *   blurbs — six category short/SEO descriptions that claimed products,
 *            brands or monograms the catalogue does not have.
 *
 * Guards: a document written since review is refused (its existing FAQs must
 * all still be in the payload, and no guidance/standards band is overwritten);
 * every document passes validateSections; a blurb is only replaced if it still
 * reads as it did at review. A backup of every touched row is written first.
 *
 * Caches are not purged; shelf pages pick the copy up within a day. Run
 * `node scripts/indexnow-submit.mjs --section categories --since <date>` once
 * they have.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-09-tier1-category-faqs/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-09-tier1-category-faqs/run.ts --backup=/path/backup.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CATEGORY_SECTIONS,
  categoryPageDef,
  subPageContentKey,
  validateSections,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'

type Band = { heading: string; body: string }
type Faq = { q: string; a: string }
type CategoryCopy = { slug: string; intro: string; guidance: Band | null; standards: Band | null; faq: Faq[] }
type Blurb = { shortDescription?: string; seoDescription?: string }
type Payload = { categories: CategoryCopy[]; blurbs: Record<string, Blurb> }

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(readFileSync(path.join(HERE, 'payload.json'), 'utf8')) as Payload

const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP = process.argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)

/** What the six blurbs said when they were reviewed; anything else was edited since. */
const BLURB_STARTS: Record<string, string> = {
  'valves-manifolds': 'Hydraulic and process valves — Yuken and Bosch Rexroth',
  'seals-accessories': 'Hydraulic power unit accessories — HYDAC 10-micron',
  cylinders: 'Double-acting hydraulic cylinders — ISO 6020/2',
  'hydraulic-pumps': 'Axial piston, vane and gear hydraulic pumps — Bosch Rexroth A10VSO',
  'oil-gas-hoses': 'Specialty hoses for upstream oil & gas',
  'blowout-preventers': 'Annular and ram blowout preventers, ram blocks',
}

const hasValues = (s: StoredSection | undefined) =>
  !!s && Object.values(s.values ?? {}).some((v) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0))

type Planned = { key: string; slug: string; sections: StoredSection[]; mode: 'create' | 'update'; before: unknown }

async function planDocs(errors: string[]): Promise<Planned[]> {
  const slugs = payload.categories.map((c) => c.slug)
  const [categories, docs] = await Promise.all([
    db.category.findMany({ where: { slug: { in: slugs }, isPublished: true, parentId: null }, select: { slug: true, name: true } }),
    db.pageContent.findMany({
      where: { key: { in: slugs.map((s) => subPageContentKey('category', s)) } },
      select: { key: true, sections: true },
    }),
  ])
  const bySlug = new Map(categories.map((c) => [c.slug, c]))
  const docByKey = new Map(docs.map((d) => [d.key, (Array.isArray(d.sections) ? d.sections : []) as StoredSection[]]))
  const planned: Planned[] = []

  for (const copy of payload.categories) {
    const category = bySlug.get(copy.slug)
    if (!category) {
      errors.push(`${copy.slug}: not a published top-level category`)
      continue
    }
    const key = subPageContentKey('category', copy.slug)
    const stored = docByKey.get(key)
    const byKey = new Map((stored ?? []).map((s) => [s.key, s]))

    if (stored) {
      const existingQs = ((byKey.get('faq')?.values?.items as Faq[] | undefined) ?? []).map((i) => i.q)
      const payloadQs = new Set(copy.faq.map((i) => i.q))
      const lost = existingQs.filter((q) => !payloadQs.has(q))
      if (lost.length) errors.push(`${copy.slug}: FAQ edited since review — ${lost.join(' | ')}`)
      if (hasValues(byKey.get('hero'))) errors.push(`${copy.slug}: hero already has override copy`)
      for (const band of ['guidance', 'standards'] as const) {
        if (copy[band] && hasValues(byKey.get(band))) errors.push(`${copy.slug}: ${band} already written — not overwriting`)
      }
    }

    const sections = CATEGORY_SECTIONS.map((def): StoredSection => {
      const prev = byKey.get(def.key)
      const base: StoredSection = prev ?? ({ key: def.key, enabled: true, values: {} } as StoredSection)
      const values: Record<string, unknown> = { ...(base.values ?? {}) }
      if (def.key === 'hero') values.intro = copy.intro
      if (def.key === 'guidance' && copy.guidance) Object.assign(values, copy.guidance)
      if (def.key === 'standards' && copy.standards) Object.assign(values, copy.standards)
      if (def.key === 'faq') values.items = copy.faq
      return { ...base, values } as StoredSection
    })

    const result = validateSections(categoryPageDef(category), sections)
    if (!result.ok) {
      for (const issue of result.issues) errors.push(`${copy.slug} — ${issue.section} · ${issue.field}: ${issue.message}`)
      continue
    }
    planned.push({ key, slug: copy.slug, sections: result.sections, mode: stored ? 'update' : 'create', before: stored ?? null })
  }
  return planned
}

type PlannedBlurb = { slug: string; data: Blurb; before: Blurb }

async function planBlurbs(errors: string[]): Promise<PlannedBlurb[]> {
  const rows = await db.category.findMany({
    where: { slug: { in: Object.keys(payload.blurbs) } },
    select: { slug: true, shortDescription: true, seoDescription: true },
  })
  const planned: PlannedBlurb[] = []
  for (const [slug, data] of Object.entries(payload.blurbs)) {
    const row = rows.find((r) => r.slug === slug)
    if (!row) {
      errors.push(`blurb ${slug}: category not found`)
      continue
    }
    if (!(row.shortDescription ?? '').startsWith(BLURB_STARTS[slug] ?? '\u0000')) {
      errors.push(`blurb ${slug}: short description edited since review`)
      continue
    }
    planned.push({ slug, data, before: { shortDescription: row.shortDescription ?? undefined, seoDescription: row.seoDescription ?? undefined } })
  }
  return planned
}

async function main(): Promise<void> {
  const errors: string[] = []
  const docs = await planDocs(errors)
  const blurbs = await planBlurbs(errors)

  for (const d of docs) {
    const faq = d.sections.find((s) => s.key === 'faq')?.values?.items as Faq[]
    console.log(`${d.mode}: ${d.key} — ${faq.length} FAQs`)
  }
  for (const b of blurbs) console.log(`blurb: ${b.slug} (${Object.keys(b.data).join(', ')})`)

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }
  if (DRY_RUN) {
    console.log('\n--dry-run: validated, nothing written')
    return
  }
  if (!BACKUP) throw new Error('--backup=<file> is required to write')
  writeFileSync(BACKUP, JSON.stringify({ docs: docs.map((d) => ({ key: d.key, before: d.before })), blurbs }, null, 1))

  for (const d of docs) {
    const sections = d.sections as unknown as Prisma.InputJsonValue
    if (d.mode === 'create') await db.pageContent.create({ data: { key: d.key, kind: 'category', sections } })
    else await db.pageContent.update({ where: { key: d.key }, data: { sections } })
  }
  // A Pages & Blocks document does not move the shelf's sitemap <lastmod>;
  // these pages gained several hundred words each, so they are re-dated.
  await db.category.updateMany({ where: { slug: { in: docs.map((d) => d.slug) } }, data: { contentUpdatedAt: new Date() } })
  for (const b of blurbs) await db.category.update({ where: { slug: b.slug }, data: b.data })

  console.log(`\nwritten: ${docs.length} documents (${docs.filter((d) => d.mode === 'create').length} created), ${blurbs.length} blurbs; backup ${BACKUP}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
