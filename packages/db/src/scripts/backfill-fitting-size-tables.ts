/**
 * Put size tables on the 59 fitting and ferrule listings that shipped without
 * one — 970 orderable sizes from the master supplier catalogue.
 *
 * WHY THIS EXISTS
 *
 * `import-crimp-fittings.ts` built the mechanism (`product_variants`, the size
 * table on the PDP, aliases folded into `search_tsv`) and used it for 64 new
 * listings. Every OTHER fitting listing on the site — BSP, DIN, metric, JIC,
 * ORFS, flange, ferrule — still had a page, a photo, a paragraph and nothing a
 * buyer could actually order. An audit against the supplier's 97-page master
 * catalogue put a number on it: for 91 of their 109 families we showed zero
 * sizes, and they publish sizes for all of them.
 *
 * This is that backfill. It adds ONLY variants and search aliases. Titles,
 * descriptions, specs, FAQs, SEO fields and images are left exactly as they
 * are — this import has no opinion about copy that predates it.
 *
 * WHAT IT IS NOT
 *
 * Not competitor cross-references. The crimp range carries Parker numbers
 * because the source book is Parker-equivalent and states them. This source is
 * our own supplier's house numbering, which we do not publish, so every
 * variant here has a null `competitorMpn` and the aliases are our part numbers
 * alone.
 *
 * PART NUMBERS
 *
 * Same scheme as the crimp range: `<listing sku>-<hose dash><port dash>`, each
 * field padded to two digits, or `<listing sku>-<dash>` for the families whose
 * table has a single size column (ferrules, banjo bolts, half flanges).
 *
 * Which printed field is the hose bore is decided by the DASH column, not by
 * position — the metric and BSP families number themselves `<thread>-<hose>`
 * while the inch families run `<hose>-<port>`. Two rows in the book have a
 * DASH cell that agrees with neither field; both are recorded in the payload
 * as `sourcePart` and reported at the end of the run.
 *
 * Idempotent: variants are replaced wholesale per listing, because the payload
 * is the whole size table.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/backfill-fitting-size-tables.ts \
 *     [--payload=DIR] [--dry-run] [--only=SKU] [--limit=N]
 *
 * `--payload` defaults to the original `fitting-size-tables`. A second payload
 * exists because one source table can serve several of our listings: the
 * `00400` ferrule table covers 4SP, 4SH DN10–16 and R12 DN6–16, and the first
 * pass gave it to 4SP alone, leaving the other two with an empty table beside
 * a source that describes them.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()


type Variant = {
  partNumber: string
  position: number
  hoseDash: number | null
  hoseInch: string | null
  hoseDn: number | null
  portLabel: string | null
  portDash: number | null
  /** Second and third threaded end — adapters only; null on hose fittings. */
  port2Label?: string | null
  port3Label?: string | null
  /** Manufacturer's published figures, where the source states them. */
  weightG?: number | null
  pressureBar?: number | null
  dimensions: Record<string, number | string>
  sourcePart: string
}

type Entry = {
  sku: string
  /** Source families and pages this listing's table was built from. */
  sources: string[]
  variants: Variant[]
}

type Payload = {
  source: string
  /** Rows whose printed DASH cell agreed with neither of its own size fields. */
  sizeFieldCorrections: string[]
  /** Rows folded away because a listing's two source tables repeat a size. */
  duplicateRowsDropped: string[]
  products: Entry[]
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

/**
 * Merge the variant part numbers into whatever `searchAliases` already holds,
 * rather than overwriting. Nothing on these listings writes the column today,
 * but the crimp importer owns it on its own listings and the two must not
 * fight if a SKU ever appears in both.
 */
function mergeAliases(existing: string | null, additions: string[]): string {
  const tokens = new Set((existing ?? '').split(/\s+/).filter(Boolean))
  for (const a of additions) tokens.add(a)
  return [...tokens].join(' ')
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const limitArg = argv.find((a) => a.startsWith('--limit='))
  const only = onlyArg ? onlyArg.split('=')[1] : null
  const payloadArg = argv.find((a) => a.startsWith('--payload='))
  const payloadName = payloadArg ? payloadArg.split('=')[1] : 'fitting-size-tables'
  const DATA = resolve(__dirname, `../../data/${payloadName}/size-tables.json`)
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

  const payload: Payload = JSON.parse(readFileSync(DATA, 'utf8'))
  let entries = payload.products
  if (only) entries = entries.filter((e) => e.sku === only)
  entries = entries.slice(0, limit)

  // A part number colliding with one already on a DIFFERENT product would fail
  // on the unique index halfway through the run, leaving the catalogue
  // half-updated. Check the whole batch first.
  const wanted = entries.flatMap((e) => e.variants.map((v) => v.partNumber))
  const clashes = await db.productVariant.findMany({
    where: {
      partNumber: { in: wanted },
      product: { sku: { notIn: entries.map((e) => e.sku) } },
    },
    select: { partNumber: true, product: { select: { sku: true } } },
  })
  if (clashes.length > 0) {
    throw new Error(
      `part numbers already used by another product: ${clashes
        .map((c) => `${c.partNumber} (${c.product.sku})`)
        .join(', ')}`,
    )
  }

  const problems: string[] = []
  let updated = 0
  let variantsWritten = 0
  let replaced = 0

  for (const e of entries) {
    const product = await db.product.findUnique({
      where: { sku: e.sku },
      select: {
        id: true,
        title: true,
        status: true,
        brandId: true,
        categoryId: true,
        focusKeyword: true,
        seoTitle: true,
        seoDescription: true,
        descriptionShort: true,
        descriptionLong: true,
        weightKg: true,
        countryOfOrigin: true,
        mpn: true,
        searchAliases: true,
      },
    })
    if (!product) {
      problems.push(`${e.sku}: no such product`)
      continue
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${e.sku} — ${e.variants.length} sizes from ${e.sources.join(', ')}`,
      )
      updated++
      continue
    }

    const productId = product.id
    const existing = await db.productVariant.count({ where: { productId } })
    if (existing > 0) replaced++

    await db.$transaction(
      async (tx) => {
        await tx.productVariant.deleteMany({ where: { productId } })
        await tx.productVariant.createMany({
          data: e.variants.map((v) => ({
            productId,
            partNumber: v.partNumber,
            position: v.position,
            hoseDash: v.hoseDash,
            hoseInch: v.hoseInch,
            hoseDn: v.hoseDn,
            portLabel: v.portLabel,
            portDash: v.portDash,
            port2Label: v.port2Label ?? null,
            port3Label: v.port3Label ?? null,
            weightG: v.weightG ?? null,
            pressureBar: v.pressureBar ?? null,
            dimensions: v.dimensions,
          })),
        })
        await tx.product.update({
          where: { id: productId },
          data: {
            searchAliases: mergeAliases(
              product.searchAliases,
              e.variants.map((v) => v.partNumber),
            ),
          },
        })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )
    variantsWritten += e.variants.length
    updated++

    // Content score does not read variants, but it does read the counts this
    // import leaves unchanged — recomputed so the admin's depth column is not
    // stale relative to the row we just touched.
    const [specCount, faqCount, documentCount, imageCount, crossReferenceCount] = await Promise.all([
      db.productSpec.count({ where: { productId } }),
      db.productFaq.count({ where: { productId } }),
      db.productDocument.count({ where: { productId } }),
      db.productImage.count({ where: { productId } }),
      db.productCrossReference.count({ where: { productId } }),
    ])
    const score = scoreProductContent({
      descriptionShortWords: words(product.descriptionShort ?? ''),
      descriptionLongWords: words(product.descriptionLong ?? ''),
      faqCount,
      specCount,
      crossReferenceCount,
      documentCount,
      imageCount,
      hasBrand: Boolean(product.brandId),
      hasCategory: Boolean(product.categoryId),
      hasFocusKeyword: Boolean(product.focusKeyword),
      hasSeoTitleAndDescription: Boolean(product.seoTitle && product.seoDescription),
      hasCommerceAttributes: Boolean(product.weightKg && product.countryOfOrigin && product.mpn),
    })
    await db.product.update({ where: { id: productId }, data: { contentScore: score.score } })

    if (updated % 15 === 0) console.log(`[${payloadName}] ${updated} listings processed…`)
  }

  console.log(
    `\n[${payloadName}] done — ${updated} listings updated, ${variantsWritten} sizes written, ` +
      `${replaced} listings already had a table, ${problems.length} problems`,
  )
  if (payload.sizeFieldCorrections.length > 0) {
    console.log(
      `  · source rows whose DASH cell contradicted their own part number, taken from the part number: ` +
        payload.sizeFieldCorrections.join(', '),
    )
  }
  if (payload.duplicateRowsDropped.length > 0) {
    console.log(
      `  · ${payload.duplicateRowsDropped.length} source rows folded away as repeats of a size already in the table` +
        ` (design variants of the same size, e.g. the "-A" ferrule)`,
    )
  }
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
