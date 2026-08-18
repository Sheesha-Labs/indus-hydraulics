/**
 * Delete the twenty Molykote listings that were never sourced from anywhere.
 *
 * These are not products whose photo we failed to find. DuPont publishes no
 * page for any of them — re-checked against the live sitemap on 2026-08-18,
 * which returned nothing for 1102, 1292, G5700, 7093, 7405, 7414, 7438,
 * P-1600, 739, Clover, Separator, Long Term W2 or 165. Every one carries the
 * placeholder signature the Molykote import was written to undo: content score
 * 41, exactly eight specs and eight FAQs, no data sheet, and a service
 * temperature range of "-40°C to +200°C (typical)" that was copied onto every
 * product regardless of what it actually is.
 *
 * So the page had nothing true on it beyond the name, and no source to fix it
 * from. The owner's call was to delete rather than unpublish.
 *
 * `Molykote D-7620 Anti-Friction Coating` is deliberately NOT in this list. It
 * has no image either — DuPont names a Scene7 asset that 403s on the public CDN
 * — but its specs, description and data sheet all come from a real DuPont page,
 * and it scores 69. A missing photo is not a reason to drop a documented
 * product.
 *
 * The SKUs are listed literally rather than derived from "has no image", so
 * this script cannot widen its own blast radius if it is ever re-run against a
 * catalogue in a different state.
 *
 * Before deleting, every row is written to `data/removed-molykote-<date>.json`
 * — product, specs and FAQs — so "permanent" still has a way back.
 *
 * Specs, FAQs, images, documents, cross-references and blog links cascade.
 * RfqLine, OrderLine and SavedListItem do NOT cascade and would block the
 * delete; the script counts them first and refuses rather than half-finishing.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/remove-unsourced-molykote.ts [--dry-run]
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Frozen. Adding to this list is a decision, not a side effect of a query. */
const SKUS = [
  'IH-LUB-1102-GAS-COCK-GREASE',
  'IH-LUB-1292',
  'IH-LUB-165-LT',
  'IH-LUB-165-LT-A',
  'IH-LUB-2-POWDER',
  'IH-LUB-340',
  'IH-LUB-7093',
  'IH-LUB-739',
  'IH-LUB-7405',
  'IH-LUB-7414',
  'IH-LUB-7438',
  'IH-LUB-CLOVER-COMPOUND',
  'IH-LUB-G5700',
  'IH-LUB-LONG-TERM-W2-MULTI-PURPOSE',
  'IH-LUB-P-1600',
  'IH-LUB-P33-LOW-TEMPERATURE-LUBRICANT',
  'IH-LUB-P44-HIGH-TEMPERATURE-LUBRICANT',
  'IH-LUB-PG-54-PLASTISLIP-GREASE',
  'IH-LUB-PG-75-PLASTISLIP-GREASE',
  'IH-LUB-SEPARATOR-SPRAY',
] as const

async function main() {
  const dryRun = process.argv.slice(2).includes('--dry-run')

  const products = await db.product.findMany({
    where: { sku: { in: [...SKUS] } },
    select: {
      id: true,
      sku: true,
      slug: true,
      title: true,
      status: true,
      contentScore: true,
      descriptionShort: true,
      descriptionLong: true,
      seoTitle: true,
      seoDescription: true,
      categoryId: true,
      brandId: true,
      category: { select: { slug: true } },
      specs: { select: { group: true, label: true, value: true, unit: true, position: true } },
      faqs: { select: { question: true, answer: true, position: true } },
      images: { select: { mediaId: true } },
      documents: { select: { title: true, kind: true } },
      _count: { select: { rfqLines: true, orderLines: true, savedListItems: true } },
    },
  })

  const missing = SKUS.filter((s) => !products.some((p) => p.sku === s))
  if (missing.length) {
    console.log(`[molykote] already gone, nothing to do for: ${missing.join(', ')}`)
  }
  if (!products.length) {
    console.log('[molykote] nothing to remove')
    return
  }

  // These three relations have no cascade, so a referenced product cannot be
  // deleted. Better to stop with the catalogue intact than to delete half.
  const referenced = products.filter(
    (p) => p._count.rfqLines || p._count.orderLines || p._count.savedListItems,
  )
  if (referenced.length) {
    console.error('[molykote] refusing to delete — these are referenced by real records:')
    for (const p of referenced) {
      console.error(
        `  ${p.sku}: ${p._count.rfqLines} RFQ lines, ${p._count.orderLines} order lines, ` +
          `${p._count.savedListItems} saved-list items`,
      )
    }
    process.exitCode = 1
    return
  }

  // A backup is what makes this recoverable. Written before anything is
  // touched, and committed alongside the script.
  const stamp = new Date().toISOString().slice(0, 10)
  const backupPath = resolve(__dirname, `../../data/removed-molykote-${stamp}.json`)
  const backup = {
    removedOn: stamp,
    reason:
      'No DuPont source page exists for any of these; their specs and FAQs were placeholder ' +
      'content (score 41, 8 specs, 8 FAQs, no data sheet). Owner chose deletion over unpublishing.',
    products: products.map(({ _count, ...p }) => p),
  }
  writeFileSync(backupPath, JSON.stringify(backup, null, 1))
  console.log(`[molykote] backed up ${products.length} products to ${backupPath}`)

  if (dryRun) {
    for (const p of products) {
      console.log(
        `[dry-run] delete ${p.sku} — ${p.title} (${p.category?.slug ?? 'no category'}, ` +
          `${p.specs.length} specs, ${p.faqs.length} faqs, score ${p.contentScore})`,
      )
    }
    console.log(`\n[molykote] dry run — ${products.length} products would be deleted`)
    return
  }

  const result = await db.product.deleteMany({ where: { id: { in: products.map((p) => p.id) } } })
  console.log(`\n[molykote] deleted ${result.count} products (specs and FAQs cascaded)`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
