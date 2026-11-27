/**
 * Megamenu entries for the shelves added on 2026-11-27 (industrial hose, coupling and loading range).
 *
 *   1. "Industrial & Oilfield Hoses › Hoses by Service" gets Railway Hoses and Silicone Hoses.
 *   2. "… › Clamps, Air & Regional Couplings" gets Express Air Couplings, TW Tank-Wagon Couplings,
 *      Steam Hose Couplings and Hose Handling Accessories.
 *   3. "… › Metallic Hoses" gets Metal Expansion Joints.
 *   4. A new group "Tanker & Terminal Loading" (linking the new root) at the end of the section, with
 *      Loading Arms, Tanker Access Stairs & Platforms and Metering, Pigging & Safety Systems.
 *
 * Unpublished shelves are refused. Idempotent. Script writes skip the nav-menu purge — run
 * `vercel cache invalidate --tag nav-menu` afterwards, and reload any open admin navigation editor
 * before saving there, or it writes the old tree back.
 *
 *   tsx src/imports/2026-11-27-hose-coupling-loading-range/megamenu.ts [--dry-run]
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

async function existingGroup(sectionLabel: string, label: string) {
  const section = await topLevel(sectionLabel)
  const g = await db.navMenuItem.findFirst({ where: { parentId: section.id, label }, select: { id: true, menuId: true } })
  if (!g) throw new Error(`group "${label}" not found in "${sectionLabel}"`)
  return g
}

async function main() {
  const S = 'Industrial & Oilfield Hoses'
  const service = await existingGroup(S, 'Hoses by Service')
  await link(service, 'Railway Hoses', 'railway-hoses')
  await link(service, 'Silicone Hoses', 'silicone-hoses')

  const clamps = await existingGroup(S, 'Clamps, Air & Regional Couplings')
  await link(clamps, 'Express Air Couplings', 'express-couplings')
  await link(clamps, 'TW Tank-Wagon Couplings (DIN 28450)', 'tw-tank-wagon-couplings')
  await link(clamps, 'Steam Hose Couplings', 'steam-hose-couplings')
  await link(clamps, 'Hose Handling Accessories', 'hose-handling-accessories')

  const metallic = await existingGroup(S, 'Metallic Hoses')
  await link(metallic, 'Metal Expansion Joints', 'metal-expansion-joints')

  const loading = await group(S, 'Tanker & Terminal Loading', 'tanker-terminal-loading-equipment')
  await link(loading, 'Loading Arms', 'loading-arms')
  await link(loading, 'Tanker Access Stairs & Platforms', 'tanker-access-platforms')
  await link(loading, 'Metering, Pigging & Safety Systems', 'terminal-loading-systems')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
