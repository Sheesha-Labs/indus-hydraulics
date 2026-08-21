/**
 * Retire the three hand-built specialist hose assemblies.
 *
 *   IH-IH-BULKSTREAM   Bulkstream Hand-Built Hose Assembly
 *   IH-IH-GSM-HOSE     GSM Ball-Joint Armoured Hose
 *   IH-IH-HEAT-TRACED  Heat Traced / Jacketed Hose
 *
 * These are made-to-order assemblies with no comparable sibling to generate an
 * image from, and the founder has asked for them to come off the catalogue.
 *
 * Checked before deleting, not assumed:
 *   - `rfq_lines`, `order_lines` and `saved_list_items` are RESTRICT and all
 *     read zero. A non-zero count here is a real business record and the script
 *     refuses rather than cascading over it — re-checked at run time, because
 *     an RFQ could land between the survey and the run.
 *   - `product_specs` (13 each) and `product_faqs` (7 each) CASCADE and are
 *     therefore destroyed silently. They are written to
 *     `data/retired-specialist-hoses-<date>.json` first so the rows can be
 *     reconstructed; this is the same trap that quietly ate 35 FAQs during the
 *     PR #258 rebuild.
 *   - No images, documents, cross-references, blog links or nav entries point
 *     at any of the three.
 *
 * Their URLs are live and indexed, so each gets a 301 to the parent
 * `Industrial Hoses` category rather than a bare 404. The `Specialist &
 * Custom-Built Hoses` category itself is deliberately LEFT IN PLACE: these are
 * its only three products, so it becomes empty, and whether it survives as a
 * "we build custom assemblies" landing page or gets hidden from the megamenu is
 * a merchandising decision, not a cleanup side effect.
 *
 * Idempotent: a SKU already gone is reported and skipped.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/remove-specialist-hoses.ts [--dry-run]
 */
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const BACKUP_DIR = resolve(__dirname, '../../data')
const pdpPath = (slug: string) => `/p/${slug}`
const REDIRECT_TARGET = '/c/industrial-hoses'

const SKUS = ['IH-IH-BULKSTREAM', 'IH-IH-GSM-HOSE', 'IH-IH-HEAT-TRACED'] as const

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const problems: string[] = []
  const backup: unknown[] = []
  let removed = 0

  for (const sku of SKUS) {
    const p = await db.product.findUnique({
      where: { sku },
      include: { specs: true, faqs: true, images: true, documents: true, crossReferences: true },
    })
    if (!p) {
      console.log(`skip ${sku} — not present`)
      continue
    }

    // Re-check the RESTRICT relations at run time. A survey taken minutes ago
    // is not evidence that no RFQ has landed since.
    const [rfq, ord, saved] = await Promise.all([
      db.rfqLine.count({ where: { productId: p.id } }),
      db.orderLine.count({ where: { productId: p.id } }),
      db.savedListItem.count({ where: { productId: p.id } }),
    ])
    if (rfq || ord || saved) {
      problems.push(
        `${sku}: has business references (rfq=${rfq} order=${ord} saved=${saved}) — NOT deleted`
      )
      continue
    }
    if (p.images.length) {
      problems.push(`${sku}: has ${p.images.length} image(s) — media retirement not handled here`)
      continue
    }

    backup.push({
      sku: p.sku,
      title: p.title,
      slug: p.slug,
      categoryId: p.categoryId,
      brandId: p.brandId,
      status: p.status,
      descriptionShort: p.descriptionShort,
      descriptionLong: p.descriptionLong,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      focusKeyword: p.focusKeyword,
      specs: p.specs.map((s) => ({
        group: s.group,
        label: s.label,
        value: s.value,
        unit: s.unit,
        position: s.position,
        isFilterable: s.isFilterable,
      })),
      faqs: p.faqs.map((f) => ({ position: f.position, question: f.question, answer: f.answer })),
      documents: p.documents.length,
      crossReferences: p.crossReferences.length,
    })

    console.log(
      `${dryRun ? '[dry-run] ' : ''}DELETE ${sku} "${p.title}"  ` +
        `(${p.specs.length} specs, ${p.faqs.length} faqs cascade)  /${p.slug} -> ${REDIRECT_TARGET}`
    )
    removed++
    if (dryRun) continue

    const slug = p.slug
    await db.$transaction(
      async (tx) => {
        await tx.product.delete({ where: { id: p.id } })
        await tx.redirect.upsert({
          where: { fromPath: pdpPath(slug) },
          update: { toPath: REDIRECT_TARGET, statusCode: 301, isActive: true },
          create: {
            fromPath: pdpPath(slug),
            toPath: REDIRECT_TARGET,
            statusCode: 301,
            isActive: true,
          },
        })
      },
      { maxWait: 30_000, timeout: 30_000 }
    )
  }

  if (!dryRun && backup.length) {
    const stamp = new Date().toISOString().slice(0, 10)
    const file = join(BACKUP_DIR, `retired-specialist-hoses-${stamp}.json`)
    writeFileSync(file, JSON.stringify(backup, null, 2))
    console.log(`\nbackup written to ${file}`)
  }

  // Report the consequence rather than acting on it.
  const cat = await db.category.findUnique({
    where: { slug: 'specialist-hoses' },
    select: { id: true, name: true, _count: { select: { products: true } } },
  })
  if (cat) {
    const nav = await db.navMenuItem.count({ where: { categoryId: cat.id } })
    console.log(
      `\n"${cat.name}" now holds ${cat._count.products} product(s); ` +
        `${nav} nav entr${nav === 1 ? 'y' : 'ies'} still point at it.`
    )
  }

  console.log(`\n── summary ──\nremoved ${removed}`)
  if (problems.length) {
    console.log(`${problems.length} problem(s):`)
    for (const x of problems) console.log(`  - ${x}`)
  } else {
    console.log('no problems')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
