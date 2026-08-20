/**
 * Give "Molykote Oils & Fluids" and "Molykote Dispersions" their megamenu
 * entries.
 *
 * Both categories were created by the Molykote expansion (PR #244) but never
 * got a menu entry, so their 40 products were reachable only by direct URL,
 * search, or the Lubricants category index — not by browsing the nav. Caught
 * while folding Specialty Lubricants away, which is what made the gap visible:
 * the Molykote column listed four categories where the catalogue had six.
 *
 * They join the existing Molykote column under "Lubricants (Molykote)", which
 * sits at L3 — the deepest level the megamenu renders. Positions continue the
 * existing run rather than starting at 0, which would reorder the column.
 *
 * Idempotent: an entry already pointing at the category is left alone.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/add-molykote-nav-entries.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const MENU_SLUG = 'primary-megamenu'
const PARENT_LABEL = 'Lubricants (Molykote)'

/** Category slug -> the label the column should show. */
const ENTRIES: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'molykote-oils', label: 'Oils & Fluids' },
  { slug: 'molykote-dispersions', label: 'Dispersions' },
]

async function main() {
  const dryRun = process.argv.slice(2).includes('--dry-run')

  const parent = await db.navMenuItem.findFirst({
    where: { label: PARENT_LABEL, menu: { slug: MENU_SLUG } },
    select: { id: true, menuId: true },
  })
  if (!parent) throw new Error(`nav parent "${PARENT_LABEL}" not found in ${MENU_SLUG}`)

  const max = await db.navMenuItem.aggregate({
    where: { parentId: parent.id },
    _max: { position: true },
  })
  let position = (max._max.position ?? -1) + 1

  let added = 0
  for (const e of ENTRIES) {
    const category = await db.category.findUnique({ where: { slug: e.slug }, select: { id: true } })
    if (!category) {
      console.log(`  ! category ${e.slug} does not exist — skipped`)
      continue
    }
    const already = await db.navMenuItem.findFirst({
      where: { parentId: parent.id, categoryId: category.id },
      select: { id: true },
    })
    if (already) {
      console.log(`  = ${e.label} already in the menu`)
      continue
    }
    if (dryRun) {
      console.log(`  [dry-run] add "${e.label}" -> ${e.slug} at position ${position++}`)
      added++
      continue
    }
    await db.navMenuItem.create({
      data: {
        menuId: parent.menuId,
        parentId: parent.id,
        position: position++,
        label: e.label,
        linkType: 'category',
        categoryId: category.id,
      },
    })
    console.log(`  + ${e.label} -> ${e.slug}`)
    added++
  }

  console.log(`\n[molykote] ${dryRun ? 'dry run — ' : ''}${added} menu entr${added === 1 ? 'y' : 'ies'} added`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
