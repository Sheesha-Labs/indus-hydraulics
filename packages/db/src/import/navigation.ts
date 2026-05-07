import type { Prisma, PrismaClient } from '@prisma/client'
import type { NavReplaceLeavesConfig } from './types'

type Tx = PrismaClient | Prisma.TransactionClient

export type NavReplaceResult = {
  leavesDeleted: number
  leavesInserted: number
  warnings: string[]
}

/**
 * Replace the leaves under a specific megamenu sub-section with new
 * category-typed NavMenuItem rows.
 *
 * Lookup chain (each step required to succeed):
 *   1. NavMenu where location='primary_megamenu'
 *   2. NavMenuItem under that menu where linkType='category' AND
 *      categoryId resolves to slug = parentColumnCategorySlug AND parentId IS NULL
 *      → that's the COLUMN
 *   3. NavMenuItem under the column matching label = parentSubLabel
 *      → that's the SUB
 *   4. All children of the SUB are deleted, then the new leaves are inserted.
 *
 * If the lookup fails at step 2 or 3, the function returns warnings instead
 * of throwing — the rest of the import shouldn't fail because the megamenu
 * shape changed (admin editors are allowed to rearrange the nav).
 *
 * Cache invalidation: the CALLER is responsible for `updateTag('navigation')`
 * (or whatever Next.js cache-bust is appropriate for the runtime context).
 * This function only manipulates DB rows.
 */
export async function replacePlaceholderLeaves(
  config: NavReplaceLeavesConfig,
  tx: Tx,
): Promise<NavReplaceResult> {
  const warnings: string[] = []

  // Step 1
  const menu = await tx.navMenu.findFirst({
    where: { location: config.menuLocation },
    select: { id: true },
  })
  if (!menu) {
    warnings.push(`No NavMenu found with location='${config.menuLocation}' — skipping nav linking`)
    return { leavesDeleted: 0, leavesInserted: 0, warnings }
  }

  // Step 2 — resolve column by category slug
  const parentCategory = await tx.category.findUnique({
    where: { slug: config.parentColumnCategorySlug },
    select: { id: true },
  })
  if (!parentCategory) {
    warnings.push(
      `Parent column category "${config.parentColumnCategorySlug}" not found — skipping nav linking`,
    )
    return { leavesDeleted: 0, leavesInserted: 0, warnings }
  }
  const column = await tx.navMenuItem.findFirst({
    where: {
      menuId: menu.id,
      parentId: null,
      linkType: 'category',
      categoryId: parentCategory.id,
    },
    select: { id: true },
  })
  if (!column) {
    warnings.push(
      `No top-level megamenu column found with category="${config.parentColumnCategorySlug}" — skipping nav linking`,
    )
    return { leavesDeleted: 0, leavesInserted: 0, warnings }
  }

  // Step 3 — resolve sub-section by label under the column
  const subItem = await tx.navMenuItem.findFirst({
    where: {
      menuId: menu.id,
      parentId: column.id,
      label: config.parentSubLabel,
    },
    select: { id: true },
  })
  if (!subItem) {
    warnings.push(
      `No sub-section labelled "${config.parentSubLabel}" under "${config.parentColumnCategorySlug}" — skipping nav linking`,
    )
    return { leavesDeleted: 0, leavesInserted: 0, warnings }
  }

  // Step 4a — delete existing leaves
  const deleteResult = await tx.navMenuItem.deleteMany({
    where: { menuId: menu.id, parentId: subItem.id },
  })

  // Step 4b — resolve replacement category slugs to ids
  const replacementSlugs = config.replacements.map((r) => r.categorySlug)
  const replacementCategories = await tx.category.findMany({
    where: { slug: { in: replacementSlugs } },
    select: { id: true, slug: true },
  })
  const catIdBySlug = new Map(replacementCategories.map((c) => [c.slug, c.id]))

  // Step 4c — insert new leaves
  let inserted = 0
  for (let idx = 0; idx < config.replacements.length; idx++) {
    const r = config.replacements[idx]!
    const categoryId = catIdBySlug.get(r.categorySlug)
    if (!categoryId) {
      warnings.push(`Replacement target category "${r.categorySlug}" not found — leaf "${r.label}" not inserted`)
      continue
    }
    await tx.navMenuItem.create({
      data: {
        menuId: menu.id,
        parentId: subItem.id,
        position: idx,
        label: r.label,
        linkType: 'category',
        categoryId,
        // Explicit nulls per the schema's optional FK fields (closing review I6)
        brandId: null,
        industryId: null,
        cmsPageId: null,
        productId: null,
        customUrl: null,
        iconName: null,
        badge: null,
        description: null,
        promoImageId: null,
        promoHeading: null,
        promoBody: null,
        promoLinkUrl: null,
        openInNewTab: false,
        isVisible: true,
      },
    })
    inserted += 1
  }

  return {
    leavesDeleted: deleteResult.count,
    leavesInserted: inserted,
    warnings,
  }
}
