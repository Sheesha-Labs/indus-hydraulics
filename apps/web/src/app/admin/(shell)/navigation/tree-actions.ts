'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { invalidateFooter, invalidateNavigation } from '../../../../lib/cache-tags'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../lib/result'
import { applyMenuTree, SaveMenuTreeSchema, type SaveMenuTreeInput } from './nav-tree-save'

export async function saveMenuTree(input: SaveMenuTreeInput): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = SaveMenuTreeSchema.parse(input)
    const result = await applyMenuTree(db, parsed.menuId, parsed.items)
    if (!result.success) return result

    revalidatePath('/admin/navigation')
    revalidatePath(`/admin/navigation/${result.data.slug}`)
    invalidateNavigation()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

/** Publish state, unchanged in behaviour — re-exported here so the unified editor has one import. */
export async function setMenuPublished(menuId: string, isPublished: boolean): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(menuId)
    const updated = await db.navMenu.update({
      where: { id: menuId },
      data: { isPublished, publishedAt: isPublished ? new Date() : undefined },
      select: { slug: true, location: true },
    })
    revalidatePath('/admin/navigation')
    revalidatePath(`/admin/navigation/${updated.slug}`)
    invalidateNavigation()
    if (updated.location === 'footer_main' || updated.location === 'footer_legal') {
      invalidateFooter()
    }
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
