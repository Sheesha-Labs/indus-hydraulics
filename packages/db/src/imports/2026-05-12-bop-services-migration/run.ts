/**
 * BOP services migration + decommission — orchestrator.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-05-12-bop-services-migration/run.ts
 *   pnpm --filter @indus/db exec tsx src/imports/2026-05-12-bop-services-migration/run.ts --dry-run
 *
 * Five things, in order, inside ONE transaction so we don't half-migrate:
 *   1. Validate the 10 new ServiceCase rows (Zod pre-flight)
 *   2. Upsert the 10 new ServiceCase rows
 *   3. Delete the 13 IH-BOP-SVC-* products + their dependent rows
 *      (specs, FAQs, cross-references, documents, images)
 *   4. Delete the bop-services category (now empty)
 *   5. Remove the "Services" sub-section + leaf from the BOP megamenu column
 *
 * The 3 IH-BOP-SVC-* products that have direct case-study analogs (3, 4, 6 in
 * the launch wave) get 301-redirected to those existing cases via
 * `apps/web/next.config.ts`. The other 10 redirect to their newly-created
 * cases below.
 */
import './load-env-stub'

import { Prisma } from '@prisma/client'
import { db } from '../../index'
import {
  BodyBlocksSchema,
  CardOutcomePillsSchema,
  DownloadsSchema,
  MetaCellsSchema,
  SpecsAtGlanceSchema,
} from '@indus/domain'

import CASE_11 from './cases/case-11-bop-pressure-testing-api-std-53'
import CASE_12 from './cases/case-12-annual-bop-redress'
import CASE_13 from './cases/case-13-bop-stack-rental-11-10k-workover'
import CASE_14 from './cases/case-14-bop-field-service-crew'
import CASE_15 from './cases/case-15-ct-snubbing-wireline-bop-service'
import CASE_16 from './cases/case-16-subsea-bop-fat-sit-witness'
import CASE_17 from './cases/case-17-15k-hpht-bop-service'
import CASE_18 from './cases/case-18-diverter-system-recertification'
import CASE_19 from './cases/case-19-rcd-mpd-equipment-service'
import CASE_20 from './cases/case-20-iwcf-wellsharp-well-control-training'
import type { ServiceCaseSeed } from '../2026-05-11-service-cases-launch/shared'

const CASES: ServiceCaseSeed[] = [
  CASE_11,
  CASE_12,
  CASE_13,
  CASE_14,
  CASE_15,
  CASE_16,
  CASE_17,
  CASE_18,
  CASE_19,
  CASE_20,
]

/** SKUs of the 13 BOP service products being decommissioned. */
const PRODUCTS_TO_DELETE = [
  'IH-BOP-SVC-PRESSURE-TEST-API53-INDUS',
  'IH-BOP-SVC-ANNUAL-REDRESS-INDUS',
  'IH-BOP-SVC-RENTAL-11-10K-WORKOVER-INDUS',
  'IH-BOP-SVC-FIELD-CREW-INDUS',
  'IH-BOP-SVC-CT-SNUB-WL-TEST-INDUS',
  'IH-BOP-SVC-SUBSEA-FAT-SIT-INDUS',
  'IH-BOP-SVC-15K-HPHT-INDUS',
  'IH-BOP-SVC-DIVERTER-RECERT-INDUS',
  'IH-BOP-SVC-RCD-MPD-INDUS',
  'IH-BOP-SVC-IWCF-WELLSHARP-TRAINING-INDUS',
  // The 3 with direct case-study analogs (redirected via next.config.ts):
  'IH-BOP-SVC-RECERT-5YR-API16A-INDUS',
  'IH-BOP-SVC-KOOMEY-RECERT-API16D-INDUS',
  'IH-BOP-SVC-CHOKE-KILL-RECERT-API16C-INDUS',
]

const DRY_RUN = process.argv.includes('--dry-run')

function validateCase(c: ServiceCaseSeed): string[] {
  const errors: string[] = []
  const bodyParse = BodyBlocksSchema.safeParse(c.bodyBlocks)
  if (!bodyParse.success) {
    for (const issue of bodyParse.error.issues) {
      errors.push(
        `[${c.slug}] bodyBlocks.${issue.path.join('.')}: ${issue.message}`,
      )
    }
  }
  const meta = MetaCellsSchema.safeParse(c.metaCells)
  if (!meta.success) errors.push(`[${c.slug}] metaCells: ${meta.error.message}`)
  const specs = SpecsAtGlanceSchema.safeParse(c.specsAtGlance)
  if (!specs.success) errors.push(`[${c.slug}] specsAtGlance: ${specs.error.message}`)
  const downloads = DownloadsSchema.safeParse(c.downloads)
  if (!downloads.success) errors.push(`[${c.slug}] downloads: ${downloads.error.message}`)
  const pills = CardOutcomePillsSchema.safeParse(c.cardOutcomePills)
  if (!pills.success) errors.push(`[${c.slug}] cardOutcomePills: ${pills.error.message}`)
  return errors
}

type Counts = {
  casesCreated: number
  casesUpdated: number
  productsDeleted: number
  productSpecsDeleted: number
  productFaqsDeleted: number
  productCrossRefsDeleted: number
  productDocumentsDeleted: number
  productImagesDeleted: number
  categoriesDeleted: number
  navItemsDeleted: number
}

async function main(): Promise<void> {
  console.log(`[${DRY_RUN ? 'DRY-RUN' : 'LIVE'}] BOP services migration + decommission`)

  // ── Pre-flight validation ────────────────────────────────────────────
  const allErrors: string[] = []
  const seenSlugs = new Set<string>()
  for (const c of CASES) {
    if (seenSlugs.has(c.slug)) allErrors.push(`Duplicate slug: ${c.slug}`)
    else seenSlugs.add(c.slug)
    allErrors.push(...validateCase(c))
  }
  if (allErrors.length > 0) {
    console.error(`Validation failed (${allErrors.length} issues):`)
    for (const e of allErrors) console.error('  •', e)
    process.exit(1)
  }
  console.log('  ✓ All 10 new cases passed pre-flight validation.')

  if (DRY_RUN) {
    console.log('  Dry-run requested — exiting without DB writes.')
    return
  }

  // ── Single transaction: upsert + delete + cleanup ────────────────────
  // Default Postgres statement_timeout on Supabase is short. Catalogue work
  // can run for a few minutes; bump locally to keep the tx clean.
  const counts: Counts = await db.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe('SET LOCAL statement_timeout = 0')
      await tx.$executeRawUnsafe('SET LOCAL idle_in_transaction_session_timeout = 0')

      const c: Counts = {
        casesCreated: 0,
        casesUpdated: 0,
        productsDeleted: 0,
        productSpecsDeleted: 0,
        productFaqsDeleted: 0,
        productCrossRefsDeleted: 0,
        productDocumentsDeleted: 0,
        productImagesDeleted: 0,
        categoriesDeleted: 0,
        navItemsDeleted: 0,
      }

      // 1. Upsert 10 new ServiceCase rows
      for (const seed of CASES) {
        const existing = await tx.serviceCase.findUnique({
          where: { slug: seed.slug },
          select: { id: true },
        })
        const data = {
          slug: seed.slug,
          caseNumber: seed.caseNumber,
          isFeatured: seed.isFeatured ?? false,
          status: 'published' as const,
          // Backdate so the "lte: now" published filter passes immediately on
          // re-runs / fresh deploys, regardless of time-of-day.
          publishedAt: new Date('2026-05-01T08:00:00.000Z'),
          category: seed.category,
          topicLabel: seed.topicLabel,
          region: seed.region,
          caseDateLabel: seed.caseDateLabel,
          title: seed.title,
          titleAccent: seed.titleAccent ?? null,
          deck: seed.deck,
          heroImageId: null,
          heroImageCaption: seed.heroImageCaption ?? null,
          heroImageCredit: seed.heroImageCredit ?? null,
          metaCells: seed.metaCells as unknown as Prisma.InputJsonValue,
          bodyBlocks: seed.bodyBlocks as unknown as Prisma.InputJsonValue,
          ctaCardTitle: seed.ctaCardTitle,
          ctaCardBody: seed.ctaCardBody,
          ctaCardPhone: seed.ctaCardPhone ?? null,
          pullQuoteText: seed.pullQuoteText,
          pullQuoteAuthor: seed.pullQuoteAuthor,
          pullQuoteRole: seed.pullQuoteRole,
          pullQuoteLocation: seed.pullQuoteLocation,
          specsAtGlance: seed.specsAtGlance as unknown as Prisma.InputJsonValue,
          galleryImageIds: [] as Prisma.InputJsonValue,
          galleryTotalCount: seed.galleryTotalCount,
          downloads: seed.downloads as unknown as Prisma.InputJsonValue,
          caseFileMeta: seed.caseFileMeta,
          cardOneLiner: seed.cardOneLiner,
          cardOutcomePills: seed.cardOutcomePills as unknown as Prisma.InputJsonValue,
          cardDurationLabel: seed.cardDurationLabel,
          cardTagStyle: seed.cardTagStyle,
          cardTagLabel: seed.cardTagLabel,
          durationDays: seed.durationDays ?? null,
          savingsAmount: seed.savingsAmount ?? null,
          savingsCurrency: seed.savingsCurrency ?? null,
          seoTitle: seed.seoTitle ?? null,
          seoDescription: seed.seoDescription ?? null,
          focusKeyword: seed.focusKeyword ?? null,
        }
        if (existing) {
          await tx.serviceCase.update({
            where: { slug: seed.slug },
            data: { ...data, seoUpdatedAt: new Date() },
          })
          c.casesUpdated += 1
        } else {
          await tx.serviceCase.create({ data })
          c.casesCreated += 1
        }
        console.log(`  + ${seed.slug} (${existing ? 'updated' : 'created'})`)
      }

      // 2. Delete the 13 IH-BOP-SVC-* products + their dependents.
      // Order matters: dependents first so FK constraints don't block.
      const products = await tx.product.findMany({
        where: { sku: { in: PRODUCTS_TO_DELETE } },
        select: { id: true, sku: true },
      })
      const productIds = products.map((p) => p.id)
      console.log(`  → Deleting ${products.length} products + dependents...`)

      const deletedSpecs = await tx.productSpec.deleteMany({
        where: { productId: { in: productIds } },
      })
      c.productSpecsDeleted = deletedSpecs.count

      const deletedFaqs = await tx.productFaq.deleteMany({
        where: { productId: { in: productIds } },
      })
      c.productFaqsDeleted = deletedFaqs.count

      const deletedXRefs = await tx.productCrossReference.deleteMany({
        where: { productId: { in: productIds } },
      })
      c.productCrossRefsDeleted = deletedXRefs.count

      const deletedDocs = await tx.productDocument.deleteMany({
        where: { productId: { in: productIds } },
      })
      c.productDocumentsDeleted = deletedDocs.count

      const deletedImages = await tx.productImage.deleteMany({
        where: { productId: { in: productIds } },
      })
      c.productImagesDeleted = deletedImages.count

      const deletedProducts = await tx.product.deleteMany({
        where: { id: { in: productIds } },
      })
      c.productsDeleted = deletedProducts.count

      // 3. Delete the bop-services category (now empty of products)
      const categoryDeletion = await tx.category.deleteMany({
        where: { slug: 'bop-services' },
      })
      c.categoriesDeleted = categoryDeletion.count

      // 4. Remove the BOP Services sub-section (and its child leaf) from the
      //    "Blowout Preventer" megamenu column. The sub-section is identified
      //    by parentColumnCategorySlug = 'blowout-preventers' + sub-label.
      const bopColumn = await tx.navMenuItem.findFirst({
        where: {
          menu: { location: 'primary_megamenu' },
          parentId: null,
          category: { slug: 'blowout-preventers' },
        },
        select: { id: true },
      })
      if (bopColumn) {
        // Find the "Services" sub-section under the BOP column
        const servicesSubsection = await tx.navMenuItem.findFirst({
          where: {
            parentId: bopColumn.id,
            label: 'Services',
          },
          select: { id: true },
        })
        if (servicesSubsection) {
          // Cascade delete: leaves under sub-section first, then sub-section
          const leavesDeleted = await tx.navMenuItem.deleteMany({
            where: { parentId: servicesSubsection.id },
          })
          const subDeleted = await tx.navMenuItem.deleteMany({
            where: { id: servicesSubsection.id },
          })
          c.navItemsDeleted = leavesDeleted.count + subDeleted.count
        }
      }

      return c
    },
    {
      maxWait: 60_000,
      timeout: Number(process.env.INDUS_IMPORT_TIMEOUT_MS ?? 600_000),
    },
  )

  console.log('')
  console.log('Done — counts:')
  console.log(`  ServiceCases  — created ${counts.casesCreated}, updated ${counts.casesUpdated}`)
  console.log(`  Products      — deleted ${counts.productsDeleted}`)
  console.log(`  Product specs — deleted ${counts.productSpecsDeleted}`)
  console.log(`  Product FAQs  — deleted ${counts.productFaqsDeleted}`)
  console.log(`  Product XRefs — deleted ${counts.productCrossRefsDeleted}`)
  console.log(`  Product Docs  — deleted ${counts.productDocumentsDeleted}`)
  console.log(`  Product Imgs  — deleted ${counts.productImagesDeleted}`)
  console.log(`  Categories    — deleted ${counts.categoriesDeleted}`)
  console.log(`  Nav items     — deleted ${counts.navItemsDeleted}`)
}

main()
  .catch((err) => {
    console.error('Migration failed:')
    console.error(err)
    process.exit(2)
  })
  .finally(() => db.$disconnect())
