/**
 * Fold "Molykote Specialty Lubricants" into "Molykote Greases" and retire it.
 *
 * The category held four products. Three were deleted on 2026-08-18 as
 * unsourced placeholder listings (`remove-unsourced-molykote.ts`), leaving one:
 * `Molykote Long Term 2 Plus Extreme Pressure`, which DuPont describes as an
 * "Extreme Pressure Bearing Grease". It belongs in Greases, and a category page
 * showing a single product reads as broken.
 *
 * The category row is unpublished rather than deleted, matching how
 * `metallic-ptfe-hoses` was retired: the row stays so nothing referencing it
 * breaks, `isPublished: false` makes the page 404, its megamenu entry is
 * removed, and a redirect in `next.config.ts` sends the old URL to Greases.
 * Note that redirect has to live in `next.config.ts` — the `Redirect` table the
 * admin SEO section writes to is not read by anything at runtime.
 *
 * The product keeps its own slug, so no product URL changes.
 *
 * Idempotent: re-running finds the product already in Greases, the category
 * already unpublished and the menu entry already gone, and reports that.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/retire-molykote-specialty-lubricants.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const FROM = 'molykote-specialty-lubricants'
const TO = 'molykote-greases'

async function main() {
  const dryRun = process.argv.slice(2).includes('--dry-run')

  const from = await db.category.findUnique({
    where: { slug: FROM },
    select: { id: true, name: true, isPublished: true, _count: { select: { children: true } } },
  })
  if (!from) {
    console.log(`[molykote] ${FROM} does not exist — nothing to do`)
    return
  }
  const to = await db.category.findUnique({ where: { slug: TO }, select: { id: true, name: true } })
  if (!to) throw new Error(`missing destination category ${TO}`)

  // A category with children would orphan them; that is not what this handles.
  if (from._count.children > 0) {
    throw new Error(`${FROM} has ${from._count.children} sub-categories — not a simple fold`)
  }

  const products = await db.product.findMany({
    where: { categoryId: from.id },
    select: { id: true, sku: true, title: true },
  })
  const navItems = await db.navMenuItem.findMany({
    where: { categoryId: from.id },
    select: { id: true, label: true },
  })

  console.log(
    `[molykote] ${from.name} -> ${to.name}: ${products.length} product(s), ` +
      `${navItems.length} menu entr(y|ies), published=${from.isPublished}`,
  )
  for (const p of products) console.log(`   move ${p.sku} — ${p.title}`)
  for (const n of navItems) console.log(`   remove menu entry "${n.label}"`)

  if (dryRun) {
    console.log('\n[molykote] dry run — nothing written')
    return
  }

  await db.$transaction(async (tx) => {
    if (products.length) {
      await tx.product.updateMany({
        where: { id: { in: products.map((p) => p.id) } },
        data: { categoryId: to.id },
      })
    }
    if (navItems.length) {
      await tx.navMenuItem.deleteMany({ where: { id: { in: navItems.map((n) => n.id) } } })
    }
    await tx.category.update({
      where: { id: from.id },
      data: { isPublished: false },
    })
  })

  const left = await db.product.count({ where: { categoryId: from.id } })
  console.log(
    `\n[molykote] done — ${products.length} product(s) moved to ${to.name}, ` +
      `${navItems.length} menu entr(y|ies) removed, ${FROM} unpublished (${left} products left on it)`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
