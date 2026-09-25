/**
 * Add the Lifting & Rigging section to the storefront megamenu.
 *
 * One section (level 1) linked to the vertical's root category, so its
 * "Browse all" goes somewhere real; one group (level 2) per child category;
 * one link (level 3) per leaf. Everything links by category id — not by a
 * `?sub=` URL, which the category page ignores. Groups and links follow the
 * categories' own `position`, so the menu reads in the same order as the shelf.
 *
 * Run it at launch, after the categories are published: the menu is live the
 * moment the rows exist, and a link to an unpublished category leads nowhere.
 * The root and the groups must be published; an unpublished leaf (one whose
 * only families are held back) is left out of the menu. Re-run with
 * `--rewrite` once it is published.
 * A script write does not clear the `nav-menu` cache tag, so the section shows
 * within the hour, or at once if anyone saves the menu in the admin.
 *
 * Idempotent: an existing section pointing at the root category is left alone
 * unless `--rewrite`, which rebuilds its groups and links.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/add-lifting-megamenu.ts [--dry-run] [--rewrite]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const MENU_SLUG = 'primary-megamenu'
const ROOT_SLUG = 'lifting-rigging-equipment-uae'
const SECTION_LABEL = 'Lifting & Rigging'

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const rewrite = argv.includes('--rewrite')

  const menu = await db.navMenu.findUnique({ where: { slug: MENU_SLUG }, select: { id: true } })
  if (!menu) throw new Error(`menu ${MENU_SLUG} not found`)
  const root = await db.category.findUnique({
    where: { slug: ROOT_SLUG },
    select: {
      id: true,
      isPublished: true,
      children: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          isPublished: true,
          children: { orderBy: { position: 'asc' }, select: { id: true, name: true, isPublished: true } },
        },
      },
    },
  })
  if (!root) throw new Error(`category ${ROOT_SLUG} not found`)
  const unpublished = [root, ...root.children].filter((c) => !c.isPublished).length
  if (unpublished > 0 && !dryRun) {
    throw new Error(`${unpublished} of ${ROOT_SLUG} and its groups are unpublished — publish them before adding the menu`)
  }
  const skipped = root.children.flatMap((g) => g.children.filter((c) => !c.isPublished).map((c) => c.name))
  const groups = root.children.map((g) => ({ ...g, children: g.children.filter((c) => c.isPublished) }))

  const existing = await db.navMenuItem.findFirst({
    where: { menuId: menu.id, parentId: null, categoryId: root.id },
    select: { id: true },
  })
  if (existing && !rewrite) {
    console.log(`= "${SECTION_LABEL}" is already in the menu — pass --rewrite to rebuild it`)
    return
  }
  const max = await db.navMenuItem.aggregate({
    where: { menuId: menu.id, parentId: null },
    _max: { position: true },
  })
  const position = existing ? undefined : (max._max.position ?? -1) + 1

  const links = groups.reduce((n, g) => n + g.children.length, 0)
  if (dryRun) {
    console.log(`[dry-run] ${existing ? 'rebuild' : `add at position ${position}`} "${SECTION_LABEL}": ` +
      `${groups.length} groups, ${links} links (${unpublished} of root and groups still unpublished)`)
    if (skipped.length) console.log(`  left out, unpublished: ${skipped.join(', ')}`)
    for (const g of groups) console.log(`  ${g.name}: ${g.children.map((c) => c.name).join(', ')}`)
    return
  }

  await db.$transaction(async (tx) => {
    let sectionId: string
    if (existing) {
      sectionId = existing.id
      await tx.navMenuItem.deleteMany({ where: { parentId: sectionId } })
    } else {
      const section = await tx.navMenuItem.create({
        data: { menuId: menu.id, label: SECTION_LABEL, linkType: 'category', categoryId: root.id, position: position! },
        select: { id: true },
      })
      sectionId = section.id
    }
    for (const [gi, g] of groups.entries()) {
      const group = await tx.navMenuItem.create({
        data: { menuId: menu.id, parentId: sectionId, label: g.name, linkType: 'category', categoryId: g.id, position: gi },
        select: { id: true },
      })
      await tx.navMenuItem.createMany({
        data: g.children.map((c, ci) => ({
          menuId: menu.id,
          parentId: group.id,
          label: c.name,
          linkType: 'category' as const,
          categoryId: c.id,
          position: ci,
        })),
      })
    }
  })
  console.log(`[megamenu] ${existing ? 'rebuilt' : 'added'} "${SECTION_LABEL}": ${groups.length} groups, ${links} links` +
    (skipped.length ? ` (left out, unpublished: ${skipped.join(', ')})` : ''))
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
