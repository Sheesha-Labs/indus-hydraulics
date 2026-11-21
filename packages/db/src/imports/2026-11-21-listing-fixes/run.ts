/**
 * Three listing errors found while writing the 2026-11-21 search-gap articles.
 *
 * 1. ratchet-strap-2in-50-mm — the product-level spec, description and one FAQ give the minimum
 *    breaking load as "5,000 kg" next to a WLL of 3,333 lbs. The size table shows the maker rates
 *    the hook versions at 10,000 lbs and the flat snap hook and D ring versions at 5,000 kg. The
 *    summary now says both, by end fitting.
 * 2. aluminium-oval-sleeve — the drawing columns A, B, C, D and L are scrambled across the size
 *    rows (D jumps 21.4 / 8.7 / 11.9 / 35.7; B reads 139.7 at 5/8″; L reads 209.5 at 1″). The
 *    source export is no longer on disk, so the columns are removed rather than guessed; size and
 *    weight stay. Two FAQs that promised dimensions are reworded to match.
 * 3. Beam flange widths on seven trolley and clamp listings are bare numbers ("75-220"); the
 *    `beamFlange` column has no unit. " mm" is appended, matching the one listing that has it.
 *
 * Content, not code: no deploy. Guards: every edit checks the current value first and skips
 * (reports) anything that no longer matches. Idempotent. Refuses to write without --rollback-file.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-21-listing-fixes/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-21-listing-fixes/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import type { Prisma } from '@prisma/client'

import { db } from '../../index'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

const STRAP = 'ratchet-strap-2in-50-mm'
const STRAP_MBL = '10,000 lbs (4,536 kg) or 5,000 kg, by end fitting'
const STRAP_TEXT: Array<[string, string]> = [
  [
    'Minimum breaking load 5,000 kg.',
    'Minimum breaking load 10,000 lbs (4,536 kg) on the grab hook and chain extension versions, 5,000 kg on the flat snap hook and D ring versions.',
  ],
]
const STRAP_FAQ: Array<[string, string]> = [
  [
    'The manufacturer also lists a minimum breaking load of 5,000 kg.',
    'The manufacturer lists a minimum breaking load of 10,000 lbs on the grab hook and chain extension versions and 5,000 kg on the flat snap hook and D ring versions.',
  ],
]

const SLEEVE = 'aluminium-oval-sleeve'
const SLEEVE_DROP = ['A', 'B', 'C', 'D', 'L'] as const
const SLEEVE_FAQ: Array<[string, string]> = [
  ['The size table lists every Indus part number with its own dimensions and rating, so quote', 'The size table lists every Indus part number with its weight, so quote'],
  ['The size table gives each one its own Indus part number and dimensions, and', 'The size table gives each one its own Indus part number, and'],
  ['No load rating is published on the Aluminium Oval Sleeve listing, only dimensions, so we state none here.', 'No load rating is published on the Aluminium Oval Sleeve listing, so we state none here.'],
]

const BEAM_FLANGE_SLUGS = [
  'geared-beam-trolley-type-b',
  'geared-beam-trolley-type-c',
  'geared-beam-trolley-type-f',
  'lifting-beam-clamp',
  'push-beam-trolley-type-b',
  'push-beam-trolley-type-c',
  'push-beam-trolley-type-f',
]
const BARE_RANGE = /^\d+(\.\d+)?-\d+(\.\d+)?$/

type Dim = Record<string, unknown>
type Rollback = {
  specs: Array<{ id: string; value: string }>
  products: Array<{ id: string; descriptionLong: string | null }>
  faqs: Array<{ id: string; answer: string }>
  variants: Array<{ id: string; dimensions: unknown }>
}

async function main(): Promise<void> {
  const rb: Rollback = { specs: [], products: [], faqs: [], variants: [] }
  const ops: Array<() => Promise<unknown>> = []
  const notes: string[] = []
  const skipped: string[] = []

  // 1. Strap
  const strap = await db.product.findUnique({
    where: { slug: STRAP },
    select: { id: true, descriptionLong: true, specs: { select: { id: true, label: true, value: true } }, faqs: { select: { id: true, answer: true } } },
  })
  if (!strap) throw new Error(`${STRAP} not found`)
  const mbl = strap.specs.find((s) => s.label === 'Minimum breaking load')
  if (mbl?.value === '5,000 kg') {
    rb.specs.push({ id: mbl.id, value: mbl.value })
    ops.push(() => db.productSpec.update({ where: { id: mbl.id }, data: { value: STRAP_MBL } }))
    notes.push(`${STRAP}: spec MBL "5,000 kg" → "${STRAP_MBL}"`)
  } else skipped.push(`${STRAP}: spec MBL is "${mbl?.value ?? '—'}"`)
  let long = strap.descriptionLong ?? ''
  for (const [from, to] of STRAP_TEXT) {
    if (long.includes(from)) long = long.replace(from, to)
    else skipped.push(`${STRAP}: description has no "${from}"`)
  }
  if (long !== (strap.descriptionLong ?? '')) {
    rb.products.push({ id: strap.id, descriptionLong: strap.descriptionLong })
    ops.push(() => db.product.update({ where: { id: strap.id }, data: { descriptionLong: long, contentUpdatedAt: new Date() } }))
    notes.push(`${STRAP}: description breaking-load sentence`)
  }
  for (const [from, to] of STRAP_FAQ) {
    const f = strap.faqs.find((x) => x.answer.includes(from))
    if (!f) {
      skipped.push(`${STRAP}: no FAQ with "${from.slice(0, 40)}…"`)
      continue
    }
    rb.faqs.push({ id: f.id, answer: f.answer })
    const answer = f.answer.replace(from, to)
    ops.push(() => db.productFaq.update({ where: { id: f.id }, data: { answer } }))
    notes.push(`${STRAP}: FAQ breaking-load line`)
  }

  // 2. Sleeve
  const sleeve = await db.product.findUnique({
    where: { slug: SLEEVE },
    select: { id: true, variants: { select: { id: true, dimensions: true } }, faqs: { select: { id: true, answer: true } } },
  })
  if (!sleeve) throw new Error(`${SLEEVE} not found`)
  let rows = 0
  for (const v of sleeve.variants) {
    const d = (v.dimensions ?? {}) as Dim
    if (!SLEEVE_DROP.some((k) => k in d)) continue
    rb.variants.push({ id: v.id, dimensions: v.dimensions })
    const next = Object.fromEntries(Object.entries(d).filter(([k]) => !(SLEEVE_DROP as readonly string[]).includes(k)))
    ops.push(() => db.productVariant.update({ where: { id: v.id }, data: { dimensions: next as Prisma.InputJsonValue } }))
    rows++
  }
  if (rows) notes.push(`${SLEEVE}: drop A/B/C/D/L from ${rows} rows`)
  else skipped.push(`${SLEEVE}: no rows carry A/B/C/D/L`)
  for (const [from, to] of SLEEVE_FAQ) {
    const f = sleeve.faqs.find((x) => x.answer.includes(from))
    if (!f) {
      skipped.push(`${SLEEVE}: no FAQ with "${from.slice(0, 40)}…"`)
      continue
    }
    rb.faqs.push({ id: f.id, answer: f.answer })
    const answer = f.answer.replace(from, to)
    ops.push(() => db.productFaq.update({ where: { id: f.id }, data: { answer } }))
    notes.push(`${SLEEVE}: FAQ "${from.slice(0, 40)}…"`)
  }

  // 3. Beam flange units
  const beams = await db.product.findMany({
    where: { slug: { in: BEAM_FLANGE_SLUGS } },
    select: { slug: true, variants: { select: { id: true, dimensions: true } } },
  })
  for (const p of beams) {
    let n = 0
    for (const v of p.variants) {
      const d = (v.dimensions ?? {}) as Dim
      const bf = d.beamFlange
      if (typeof bf !== 'string' || !BARE_RANGE.test(bf)) continue
      rb.variants.push({ id: v.id, dimensions: v.dimensions })
      const next = { ...d, beamFlange: `${bf} mm` }
      ops.push(() => db.productVariant.update({ where: { id: v.id }, data: { dimensions: next as Prisma.InputJsonValue } }))
      n++
    }
    if (n) notes.push(`${p.slug}: beam flange + " mm" on ${n} rows`)
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${ops.length} write(s)`)
  for (const n of notes) console.log(`  ✓ ${n}`)
  for (const s of skipped) console.log(`  – skipped: ${s}`)
  if (DRY_RUN || ops.length === 0) return
  if (!ROLLBACK_FILE) {
    console.error('refusing to write without --rollback-file=<absolute path>')
    process.exitCode = 1
    return
  }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(rb, null, 1))
  console.log(`rollback written: ${ROLLBACK_FILE}`)
  for (const op of ops) await op()
  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
