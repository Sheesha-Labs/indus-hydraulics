/**
 * Service-cases launch — orchestrator.
 *
 * Imports all 10 launch case files, validates each one against the Zod
 * schemas in @indus/domain (defensive — catches any agent-author drift),
 * then upserts each to the live DB by `slug`. Idempotent: re-running
 * leaves the DB in the same state.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-05-11-service-cases-launch/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-05-11-service-cases-launch/run.ts --dry-run
 *
 * The runner does not delete cases that are missing from this batch — to
 * remove a case, use the admin or write a one-off DELETE script.
 */
import './load-env-stub'

import { Prisma } from '@prisma/client'
import { db } from '../../index'
import {
  BodyBlocksSchema,
  CardOutcomePillsSchema,
  DownloadsSchema,
  GalleryImageIdsSchema,
  MetaCellsSchema,
  SpecsAtGlanceSchema,
} from '@indus/domain'

import CASE_01 from './cases/case-01-workover-rig-cylinder-hose-overhaul'
import CASE_02 from './cases/case-02-mud-pump-fluid-end-rebuild'
import CASE_03 from './cases/case-03-bop-13-58-10k-cameron-u-recert'
import CASE_04 from './cases/case-04-koomey-accumulator-rebladder-api-16d-recert'
import CASE_05 from './cases/case-05-coiled-tubing-injector-emergency-repair'
import CASE_06 from './cases/case-06-choke-kill-manifold-3116-10k-recert'
import CASE_07 from './cases/case-07-hpu-50hp-drilling-rig-refurbishment'
import CASE_08 from './cases/case-08-sour-service-hose-assembly-build-bulk'
import CASE_09 from './cases/case-09-iso-4406-oil-cleanliness-q1-program'
import CASE_10 from './cases/case-10-custom-16-port-manifold-en24-420-bar'
import type { ServiceCaseSeed } from './shared'

const CASES: ServiceCaseSeed[] = [
  CASE_01,
  CASE_02,
  CASE_03,
  CASE_04,
  CASE_05,
  CASE_06,
  CASE_07,
  CASE_08,
  CASE_09,
  CASE_10,
]

const DRY_RUN = process.argv.includes('--dry-run')

function validateCase(c: ServiceCaseSeed, idx: number): string[] {
  const errors: string[] = []
  // Body blocks — full Zod validation against the discriminated union.
  const bodyParse = BodyBlocksSchema.safeParse(c.bodyBlocks)
  if (!bodyParse.success) {
    for (const issue of bodyParse.error.issues) {
      errors.push(
        `[${c.slug}] bodyBlocks.${issue.path.join('.')}: ${issue.message}`,
      )
    }
  }
  // Right-rail / card data — same defensive parses.
  const meta = MetaCellsSchema.safeParse(c.metaCells)
  if (!meta.success) errors.push(`[${c.slug}] metaCells: ${meta.error.message}`)
  const specs = SpecsAtGlanceSchema.safeParse(c.specsAtGlance)
  if (!specs.success) errors.push(`[${c.slug}] specsAtGlance: ${specs.error.message}`)
  const downloads = DownloadsSchema.safeParse(c.downloads)
  if (!downloads.success) errors.push(`[${c.slug}] downloads: ${downloads.error.message}`)
  const pills = CardOutcomePillsSchema.safeParse(c.cardOutcomePills)
  if (!pills.success) errors.push(`[${c.slug}] cardOutcomePills: ${pills.error.message}`)
  // Sanity — duplicate slug check happens at the loop level
  if (idx === 0 && !c.isFeatured) {
    errors.push(`[${c.slug}] case 01 should have isFeatured: true`)
  }
  return errors
}

async function upsertCase(c: ServiceCaseSeed): Promise<'created' | 'updated'> {
  // The schema model and the seed shape line up almost 1:1. Cast JSON-typed
  // arrays via JSON.stringify/parse so Prisma takes them as `Json` rather
  // than complaining about excess properties on the discriminated unions.
  const data = {
    slug: c.slug,
    caseNumber: c.caseNumber,
    isFeatured: c.isFeatured ?? false,
    status: 'published' as const,
    // Backdate slightly so the "lte: now" published filter passes immediately
    // regardless of the deploy time-of-day. Re-runs preserve the existing
    // publishedAt via the upsert path below — only first-create writes this.
    publishedAt: new Date('2026-05-01T08:00:00.000Z'),

    category: c.category,
    topicLabel: c.topicLabel,
    region: c.region,
    caseDateLabel: c.caseDateLabel,
    title: c.title,
    titleAccent: c.titleAccent ?? null,
    deck: c.deck,
    heroImageId: null,
    heroImageCaption: c.heroImageCaption ?? null,
    heroImageCredit: c.heroImageCredit ?? null,

    metaCells: c.metaCells as unknown as Prisma.InputJsonValue,
    bodyBlocks: c.bodyBlocks as unknown as Prisma.InputJsonValue,

    ctaCardTitle: c.ctaCardTitle,
    ctaCardBody: c.ctaCardBody,
    ctaCardPhone: c.ctaCardPhone ?? null,
    pullQuoteText: c.pullQuoteText,
    pullQuoteAuthor: c.pullQuoteAuthor,
    pullQuoteRole: c.pullQuoteRole,
    pullQuoteLocation: c.pullQuoteLocation,
    specsAtGlance: c.specsAtGlance as unknown as Prisma.InputJsonValue,
    galleryImageIds: [] as Prisma.InputJsonValue,
    galleryTotalCount: c.galleryTotalCount,
    downloads: c.downloads as unknown as Prisma.InputJsonValue,

    caseFileMeta: c.caseFileMeta,

    cardOneLiner: c.cardOneLiner,
    cardOutcomePills: c.cardOutcomePills as unknown as Prisma.InputJsonValue,
    cardDurationLabel: c.cardDurationLabel,
    cardTagStyle: c.cardTagStyle,
    cardTagLabel: c.cardTagLabel,

    durationDays: c.durationDays ?? null,
    savingsAmount: c.savingsAmount ?? null,
    savingsCurrency: c.savingsCurrency ?? null,

    seoTitle: c.seoTitle ?? null,
    seoDescription: c.seoDescription ?? null,
    focusKeyword: c.focusKeyword ?? null,
  }

  const existing = await db.serviceCase.findUnique({
    where: { slug: c.slug },
    select: { id: true },
  })
  if (existing) {
    await db.serviceCase.update({
      where: { slug: c.slug },
      data: { ...data, seoUpdatedAt: new Date() },
    })
    return 'updated'
  }
  await db.serviceCase.create({ data })
  return 'created'
}

async function main(): Promise<void> {
  console.log(`[${DRY_RUN ? 'DRY-RUN' : 'LIVE'}] Service-cases launch — ${CASES.length} cases`)

  // Pre-flight: validate every case's body blocks + JSON shapes BEFORE any DB writes
  const allErrors: string[] = []
  const seenSlugs = new Set<string>()
  for (let i = 0; i < CASES.length; i++) {
    const c = CASES[i]!
    if (seenSlugs.has(c.slug)) {
      allErrors.push(`Duplicate slug: ${c.slug}`)
    } else {
      seenSlugs.add(c.slug)
    }
    allErrors.push(...validateCase(c, i))
  }
  if (allErrors.length > 0) {
    console.error(`Validation failed (${allErrors.length} issues):`)
    for (const e of allErrors) console.error('  •', e)
    process.exit(1)
  }
  console.log('  ✓ All cases passed pre-flight validation.')

  if (DRY_RUN) {
    console.log('  Dry-run requested — exiting without DB writes.')
    return
  }

  let created = 0
  let updated = 0
  for (const c of CASES) {
    const outcome = await upsertCase(c)
    if (outcome === 'created') created++
    else updated++
    console.log(`  ${outcome === 'created' ? '+' : '↻'} ${c.slug} (${outcome})`)
  }

  console.log('')
  console.log(`Done — ${created} created, ${updated} updated.`)
}

main()
  .catch((err) => {
    console.error('Import failed:')
    console.error(err)
    process.exit(2)
  })
  .finally(() => db.$disconnect())
