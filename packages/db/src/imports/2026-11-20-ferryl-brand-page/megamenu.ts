/**
 * Megamenu entries for the four Ferryl shelves (#645, #648).
 *
 *   1. "Instrumentation, Lubricants & Consumables" gets a new group "Wire Rope Lubricants (Ferryl)" — the
 *      pattern of "Lubricants (Molykote)" — placed after the other lubricant groups and before
 *      "Instrumentation & Controls", with the two Lubricants shelves under it.
 *   2. "Marine" gets a new group "Ship Maintenance Chemicals" after its existing groups, with the two
 *      Marine shelves under it.
 *   3. "Lifting & Rigging › Wire Rope & Fittings" gets a "Wire Rope Lubrication" link to the greases shelf.
 *
 * Unpublished shelves are refused. Idempotent: a link already pointing at the category under the same
 * parent is left alone. Script writes skip the nav-menu purge — run
 * `vercel cache invalidate --tag nav-menu` afterwards, and reload any open admin navigation editor before
 * saving there, or it writes the old tree back.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-ferryl-brand-page/megamenu.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-20-ferryl-brand-page/megamenu.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'

const MENU_SLUG = 'primary-megamenu'
const dryRun = process.argv.includes('--dry-run')

async function category(slug: string) {
  const c = await db.category.findUnique({ where: { slug }, select: { id: true, isPublished: true } })
  if (!c) throw new Error(`category ${slug} does not exist`)
  if (!c.isPublished) throw new Error(`category ${slug} is unpublished`)
  return c.id
}

async function topLevel(label: string) {
  const s = await db.navMenuItem.findFirst({ where: { label, parentId: null, menu: { slug: MENU_SLUG } }, select: { id: true, menuId: true } })
  if (!s) throw new Error(`section "${label}" not found`)
  return s
}

/** Find or create a group under a section, linking to `slug`. `before` = label of the group it goes ahead of. */
async function group(sectionLabel: string, label: string, slug: string, before?: string) {
  const section = await topLevel(sectionLabel)
  const categoryId = await category(slug)
  const found = await db.navMenuItem.findFirst({ where: { parentId: section.id, label }, select: { id: true, menuId: true } })
  if (found) {
    console.log(`  = group "${label}" already in "${sectionLabel}"`)
    return found
  }
  let position: number
  const anchor = before ? await db.navMenuItem.findFirst({ where: { parentId: section.id, label: before }, select: { position: true } }) : null
  if (anchor) {
    position = anchor.position
    console.log(`  ${dryRun ? '[dry-run] would shift' : '>'} groups at position >= ${position} in "${sectionLabel}" down one`)
    if (!dryRun) await db.navMenuItem.updateMany({ where: { parentId: section.id, position: { gte: position } }, data: { position: { increment: 1 } } })
  } else {
    const max = await db.navMenuItem.aggregate({ where: { parentId: section.id }, _max: { position: true } })
    position = (max._max.position ?? -1) + 1
  }
  console.log(`  ${dryRun ? '[dry-run] would add' : '+'} group "${label}" in "${sectionLabel}" at position ${position}`)
  if (dryRun) return { id: `dry:${label}`, menuId: section.menuId }
  return db.navMenuItem.create({
    data: { menuId: section.menuId, parentId: section.id, position, label, linkType: 'category', categoryId },
    select: { id: true, menuId: true },
  })
}

async function link(parent: { id: string; menuId: string }, label: string, slug: string) {
  const categoryId = await category(slug)
  if (!parent.id.startsWith('dry:')) {
    const already = await db.navMenuItem.findFirst({ where: { parentId: parent.id, categoryId }, select: { id: true } })
    if (already) {
      console.log(`    = ${label} already linked`)
      return
    }
  }
  const max = parent.id.startsWith('dry:') ? null : await db.navMenuItem.aggregate({ where: { parentId: parent.id }, _max: { position: true } })
  const position = (max?._max.position ?? -1) + 1
  console.log(`    ${dryRun ? '[dry-run] would add' : '+'} ${label} at position ${position}`)
  if (!dryRun) {
    await db.navMenuItem.create({ data: { menuId: parent.menuId, parentId: parent.id, position, label, linkType: 'category', categoryId } })
  }
}

async function main() {
  const lub = await group('Instrumentation, Lubricants & Consumables', 'Wire Rope Lubricants (Ferryl)', 'wire-rope-anticorrosive-greases', 'Instrumentation & Controls')
  await link(lub, 'Wire Rope & Anticorrosive Greases', 'wire-rope-anticorrosive-greases')
  await link(lub, 'Wire Rope Lubricators', 'wire-rope-lubricators')

  const marine = await group('Marine', 'Ship Maintenance Chemicals', 'ship-maintenance-chemicals')
  await link(marine, 'Anticorrosive & Safety Coatings', 'anticorrosive-safety-coatings')
  await link(marine, 'Cleaning, Rust Treatment & Sealants', 'marine-maintenance-chemicals')

  const lifting = await topLevel('Lifting & Rigging')
  const wire = await db.navMenuItem.findFirst({ where: { parentId: lifting.id, label: 'Wire Rope & Fittings' }, select: { id: true, menuId: true } })
  if (!wire) throw new Error('group "Wire Rope & Fittings" not found')
  await link(wire, 'Wire Rope Lubrication', 'wire-rope-anticorrosive-greases')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
