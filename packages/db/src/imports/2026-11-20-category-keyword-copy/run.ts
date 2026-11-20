/**
 * Applies ./plans.ts: the keyword map's copy for 204 hose, lifting and marine
 * categories — focus keyword, SEO title, meta description and the opening
 * paragraph. Content, not code: no deploy.
 *
 * Where the opening paragraph lives: the Pages & Blocks `category/<slug>`
 * document's hero `intro` override when the category has a document (199 of
 * 204); otherwise `categories.shortDescription` (5). Writing the override
 * rather than the short description leaves the card text elsewhere untouched.
 *
 * Guards, checked in full before anything is written:
 *   - the category exists and is published;
 *   - the current opening paragraph equals the one the copy was drafted from,
 *     so a category edited since is reported, not overwritten;
 *   - the hero section exists in the document; nothing else in it changes.
 * `keepTitleAndMeta` categories were retitled earlier the same day by the GSC
 * titles pass; only their intro and focus keyword change.
 *
 * `contentUpdatedAt` is set, because a document write does not move the
 * category's sitemap date and this copy is a real change.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-category-keyword-copy/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-category-keyword-copy/run.ts --rollback-file=/abs/path.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

import type { Prisma } from '@prisma/client'

import { db } from '../../index'
import { CATEGORY_COPY } from './plans'

const sha = (s: string | null | undefined): string => createHash('sha256').update(s ?? '').digest('hex')

const DRY_RUN = process.argv.includes('--dry-run')
const ROLLBACK_FILE = process.argv.find((a) => a.startsWith('--rollback-file='))?.slice('--rollback-file='.length)

type Section = { key: string; enabled?: boolean; values?: Record<string, unknown> }

async function main(): Promise<void> {
  const slugs = CATEGORY_COPY.map((c) => c.slug)
  const cats = await db.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, isPublished: true, shortDescription: true, seoTitle: true, seoDescription: true, focusKeyword: true },
  })
  const docs = await db.pageContent.findMany({ where: { key: { in: slugs.map((s) => `category/${s}`) } }, select: { id: true, key: true, sections: true } })
  const catBy = new Map(cats.map((c) => [c.slug, c]))
  const docBy = new Map(docs.map((d) => [d.key.slice('category/'.length), d]))
  const errors: string[] = []
  type Job = { copy: (typeof CATEGORY_COPY)[number]; cat: (typeof cats)[number]; doc: (typeof docs)[number] | undefined; sections: Section[] | undefined }
  const jobs: Job[] = []
  let done = 0
  for (const copy of CATEGORY_COPY) {
    const cat = catBy.get(copy.slug)
    if (!cat || !cat.isPublished) { errors.push(`${copy.slug}: missing or unpublished`); continue }
    const doc = docBy.get(copy.slug)
    let current: string | null
    let sections: Section[] | undefined
    if (doc) {
      sections = (doc.sections as Section[]).map((s) => ({ ...s, values: { ...(s.values ?? {}) } }))
      const hero = sections.find((s) => s.key === 'hero')
      if (!hero) { errors.push(`${copy.slug}: document has no hero section`); continue }
      current = (hero.values?.intro as string | null | undefined) ?? cat.shortDescription
    } else current = cat.shortDescription
    const already = (doc ? sections!.find((s) => s.key === 'hero')!.values!.intro : cat.shortDescription) === copy.intro
    if (already && cat.focusKeyword === copy.focusKeyword) { done++; continue }
    if (sha(current) !== copy.fromIntroSha256) { errors.push(`${copy.slug}: opening paragraph changed since drafting`); continue }
    if (doc) sections!.find((s) => s.key === 'hero')!.values!.intro = copy.intro
    jobs.push({ copy, cat, doc, sections })
  }
  if (errors.length) {
    console.error(`${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${jobs.length} categor(ies) to update, ${done} already done`)
  if (DRY_RUN) return
  if (!ROLLBACK_FILE) { console.error('refusing to write without --rollback-file=<absolute path>'); process.exitCode = 1; return }
  writeFileSync(ROLLBACK_FILE, JSON.stringify(jobs.map(({ cat, doc }) => ({ category: cat, document: doc ?? null }))))
  console.log(`rollback written: ${ROLLBACK_FILE}`)
  const now = new Date()
  for (const { copy, cat, doc, sections } of jobs) {
    await db.$transaction(async (tx) => {
      await tx.category.update({
        where: { id: cat.id },
        data: {
          focusKeyword: copy.focusKeyword,
          ...(copy.seoTitle ? { seoTitle: copy.seoTitle, seoDescription: copy.metaDescription, seoUpdatedAt: now } : {}),
          ...(doc ? {} : { shortDescription: copy.intro }),
          contentUpdatedAt: now,
        },
      })
      if (doc) await tx.pageContent.update({ where: { id: doc.id }, data: { sections: sections as unknown as Prisma.InputJsonValue } })
    }, { timeout: 30_000, maxWait: 10_000 })
    console.log(`  ✓ /c/${copy.slug}`)
  }
  console.log('done')
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1 })
  .finally(() => db.$disconnect())
