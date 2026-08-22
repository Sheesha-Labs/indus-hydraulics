/**
 * Retire three listings that duplicate a product already in the catalogue.
 *
 * The multiseal import (#313) created `IH-DF-FEM-24-MS-HS` and its two elbows
 * from the master catalogue's `20511C` / `20541C` / `20591C`. A plain-cone
 * heavy-series listing already existed for each — `IH-DF-FEM-24-HS` and its
 * elbows — carrying the identical sealing form and no size table. So the
 * catalogue ended up with two pages per part, one with a table and one
 * without, which is worse than either alone.
 *
 * The mistake was building a batch of new listings without first asking which
 * of them we already sold. The audit answered that question family-by-family
 * against the SUPPLIER's catalogue and not against our own.
 *
 * The originals keep the URL. They are older, they carry the descriptions and
 * FAQs an editor may have touched, and their slug is the one anything external
 * would already point at. `legacy-fitting-size-tables` gives them the size
 * tables; this removes the newer pages and 301s them across.
 *
 * Deleting rather than marking discontinued: these listings are hours old, so
 * a discontinued page would be a permanent tombstone for a product that never
 * really existed separately. The redirect is what a visitor needs.
 *
 * Idempotent: a SKU already gone is skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/retire-duplicate-din-heavy.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'
import { recordSlugRedirect } from '../slug-redirect'

const db = new PrismaClient()

/** Duplicate → the older listing that keeps the URL. */
const RETIRE: Array<[string, string]> = [
  ['IH-DF-FEM-24-MS-HS', 'IH-DF-FEM-24-HS'],
  ['IH-DF-FEM-24-MS-HS-45', 'IH-DF-FEM-24-HS-45'],
  ['IH-DF-FEM-24-MS-HS-90', 'IH-DF-FEM-24-HS-90'],
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let removed = 0

  for (const [dupeSku, keepSku] of RETIRE) {
    const [dupe, keep] = await Promise.all([
      db.product.findUnique({
        where: { sku: dupeSku },
        select: { id: true, slug: true, _count: { select: { variants: true } } },
      }),
      db.product.findUnique({ where: { sku: keepSku }, select: { id: true, slug: true } }),
    ])
    if (!dupe) {
      console.log(`  · ${dupeSku} already gone`)
      continue
    }
    if (!keep) {
      throw new Error(`${dupeSku}: cannot retire, its replacement ${keepSku} does not exist`)
    }
    // The survivor must already have the table, or retiring the duplicate
    // would delete the only copy of the data on the site.
    const keepVariants = await db.productVariant.count({ where: { productId: keep.id } })
    if (keepVariants === 0) {
      throw new Error(
        `${keepSku} has no size table yet — run the legacy-fitting-size-tables payload first, ` +
          `or retiring ${dupeSku} loses its ${dupe._count.variants} sizes`,
      )
    }

    console.log(
      `${dryRun ? '[dry-run] ' : ''}delete ${dupeSku} (/p/${dupe.slug}) → 301 to /p/${keep.slug}`,
    )
    if (!dryRun) {
      await db.$transaction(async (tx) => {
        // Variants, specs, FAQs, images and cross-references all cascade from
        // the product. Media rows are referenced by ProductImage and survive.
        await tx.product.delete({ where: { id: dupe.id } })
        await recordSlugRedirect(tx, {
          fromPath: `/p/${dupe.slug}`,
          toPath: `/p/${keep.slug}`,
          notes: `${dupeSku} duplicated ${keepSku}; retired 2026-08-22`,
        })
      })
    }
    removed++
  }

  console.log(`\n[retire-din-heavy] ${removed} duplicate listings removed`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
