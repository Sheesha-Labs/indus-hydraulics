/**
 * Megamenu entries for the five Oteco shelves created under Drilling & Workover Systems by the Oteco
 * catalogue (#630, #631): rig floor consumables, rig hardware, mud manifold fittings, mud pump fluid
 * end parts, swivel washpipe and packing.
 *
 * They join the existing "Drilling & Workover" column (Well Services & Surface Equipment), after its
 * current links; positions continue the run. The other Oteco shelves — gate valves, gate valve repair
 * kits, relief valves, float valves, BOP spare parts, pressure gauges — are already in the menu.
 *
 * Run only after the catalogue load, when the shelves are published; an unpublished shelf is refused.
 * Idempotent: a link already pointing at the category is left alone. Script writes skip the nav-menu
 * purge — run `vercel cache invalidate --tag nav-menu` afterwards, and reload any open admin navigation
 * editor before saving there, or it writes the old tree back.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-oteco-brand-page/megamenu.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-19-oteco-brand-page/megamenu.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'

const MENU_SLUG = 'primary-megamenu'
const SECTION_LABEL = 'Well Services & Surface Equipment'
const GROUP_LABEL = 'Drilling & Workover'

const ENTRIES: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'rig-floor-consumables', label: 'Pipe Wipers & Mud Guards' },
  { slug: 'rig-hardware', label: 'Rig Hardware & Wireline Guides' },
  { slug: 'mud-manifold-fittings', label: 'Mud Manifold Fittings' },
  { slug: 'mud-pump-fluid-end-parts', label: 'Mud Pump Fluid End Parts' },
  { slug: 'swivel-washpipe-packing', label: 'Swivel Washpipe & Packing' },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const section = await db.navMenuItem.findFirst({ where: { label: SECTION_LABEL, parentId: null, menu: { slug: MENU_SLUG } }, select: { id: true } })
  if (!section) throw new Error(`section "${SECTION_LABEL}" not found`)
  const group = await db.navMenuItem.findFirst({ where: { label: GROUP_LABEL, parentId: section.id }, select: { id: true, menuId: true } })
  if (!group) throw new Error(`group "${GROUP_LABEL}" not found`)
  const max = await db.navMenuItem.aggregate({ where: { parentId: group.id }, _max: { position: true } })
  let position = (max._max.position ?? -1) + 1

  for (const e of ENTRIES) {
    const category = await db.category.findUnique({ where: { slug: e.slug }, select: { id: true, isPublished: true } })
    if (!category) throw new Error(`category ${e.slug} does not exist — load the Oteco catalogue first`)
    if (!category.isPublished) throw new Error(`category ${e.slug} is unpublished — load the Oteco catalogue with --publish first`)
    const already = await db.navMenuItem.findFirst({ where: { parentId: group.id, categoryId: category.id }, select: { id: true } })
    if (already) {
      console.log(`  = ${e.label} already in the menu`)
      continue
    }
    console.log(`  ${dryRun ? '[dry-run] would add' : '+'} ${e.label} at position ${position}`)
    if (!dryRun) {
      await db.navMenuItem.create({
        data: { menuId: group.menuId, parentId: group.id, position, label: e.label, linkType: 'category', categoryId: category.id },
      })
    }
    position++
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
