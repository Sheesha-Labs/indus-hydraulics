/**
 * Appends the long-tail FAQs in ./plans.ts to category pages. Content, not
 * code: no deploy.
 *
 * Each FAQ answers a real search phrase from the 2026-11-20 keyword map, from
 * the category's own catalogue data only (script-checked: no number or
 * standard not already in that data, no stock/approval/superlative claims).
 * FAQs are published as FAQPage structured data with the band.
 *
 * Appends to the Pages & Blocks `category/<slug>` FAQ list; never replaces or
 * reorders what is there, never exceeds 8 (the field's maximum). Guard: the
 * existing list must hash to `existingSha256`, so a list edited since drafting
 * is reported, not overwritten. Idempotent: a question already present is
 * skipped. `contentUpdatedAt` is set so the sitemap date moves.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-category-faqs/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-category-faqs/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

import type { Prisma } from '@prisma/client'

import { db } from '../../index'
import { CATEGORY_FAQS } from './plans'

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)
const MAX = 8

type Faq = { q: string; a: string }
type Section = { key: string; enabled?: boolean; values?: Record<string, unknown> }
const sha = (items: Faq[]): string => createHash('sha256').update(JSON.stringify(items.map((i) => [i.q, i.a]))).digest('hex')

async function main(): Promise<void> {
  const keys = CATEGORY_FAQS.map((c) => `category/${c.slug}`)
  const docs = await db.pageContent.findMany({ where: { key: { in: keys } }, select: { id: true, key: true, sections: true } })
  const byKey = new Map(docs.map((d) => [d.key, d]))
  const cats = await db.category.findMany({ where: { slug: { in: CATEGORY_FAQS.map((c) => c.slug) } }, select: { id: true, slug: true } })
  const catId = new Map(cats.map((c) => [c.slug, c.id]))
  const errors: string[] = []
  const jobs: Array<{ slug: string; docId: string; before: unknown; sections: Section[]; added: number }> = []
  let done = 0
  for (const plan of CATEGORY_FAQS) {
    const doc = byKey.get(`category/${plan.slug}`)
    if (!doc || !catId.get(plan.slug)) { errors.push(`${plan.slug}: no document or category`); continue }
    const sections = (doc.sections as Section[]).map((s) => ({ ...s, values: { ...(s.values ?? {}) } }))
    const faq = sections.find((s) => s.key === 'faq')
    if (!faq) { errors.push(`${plan.slug}: no faq section`); continue }
    const items = ((faq.values!.items as Faq[] | undefined) ?? []).map((i) => ({ q: i.q, a: i.a }))
    const present = new Set(items.map((i) => i.q))
    const fresh = plan.faqs.filter((f) => !present.has(f.q))
    if (fresh.length === 0) { done++; continue }
    if (sha(items) !== plan.existingSha256) { errors.push(`${plan.slug}: FAQ list changed since drafting`); continue }
    if (items.length + fresh.length > MAX) { errors.push(`${plan.slug}: would exceed ${MAX} FAQs`); continue }
    faq.values!.items = [...items, ...fresh]
    jobs.push({ slug: plan.slug, docId: doc.id, before: doc.sections, sections, added: fresh.length })
  }
  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${jobs.length} categor(ies), ${jobs.reduce((n, j) => n + j.added, 0)} FAQ(s) to add, ${done} already done`)
  if (DRY_RUN) return
  if (!ROLLBACK_FILE) { console.error('refusing to write without --rollback-file=<absolute path>'); process.exitCode = 1; return }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(jobs.map((j) => ({ key: `category/${j.slug}`, sections: j.before }))))
  console.log(`rollback written: ${ROLLBACK_FILE}`)
  const now = new Date()
  for (const j of jobs) {
    await db.$transaction(async (tx) => {
      await tx.pageContent.update({ where: { id: j.docId }, data: { sections: j.sections as unknown as Prisma.InputJsonValue } })
      await tx.category.update({ where: { id: catId.get(j.slug)! }, data: { contentUpdatedAt: now } })
    }, { timeout: 30_000, maxWait: 10_000 })
    console.log(`  ✓ /c/${j.slug} +${j.added}`)
  }
  console.log('done')
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1 })
  .finally(() => db.$disconnect())
