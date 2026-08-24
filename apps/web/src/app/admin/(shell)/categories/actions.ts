'use server'

import { revalidatePath } from 'next/cache'
import { invalidateCategories } from '../../../../lib/cache-tags'
import { z } from 'zod'
import { db, recordSlugRedirect } from '@indus/db'
import {
  MAX_CATEGORY_DEPTH,
  ancestorPath,
  buildMoveOrdering,
  descendantIds,
  subtreeHeight,
  type CategoryTreeNode,
} from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { withSeoAudit } from '../../../../lib/seo-audit'

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `category-${Date.now()}`
  )
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base)
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await db.category.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

const OptionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : null))

const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : '')),
  parentId: OptionalUuid,
  defaultSpecTemplateId: OptionalUuid,
  position: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
})

export async function createCategory(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CreateCategorySchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug') ?? '',
      parentId: formData.get('parentId') ?? '',
      defaultSpecTemplateId: formData.get('defaultSpecTemplateId') ?? '',
      position: formData.get('position'),
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug || parsed.name)

    // Append, rather than honouring a `position` from the form.
    //
    // The form no longer has a position box — order is a drag now — and
    // defaulting to 0 put every new category at the top of its sibling set,
    // tied with whatever was already there. A tie makes display order fall back
    // to the name tiebreak, which is exactly the ambiguity dense renumbering
    // exists to remove. `position` is still accepted for callers outside the
    // editor; absent one, land at the end where a new thing belongs.
    const position =
      parsed.position > 0
        ? parsed.position
        : await db.category.count({ where: { parentId: parsed.parentId } })

    const cat = await db.category.create({
      data: {
        name: parsed.name,
        slug,
        parentId: parsed.parentId,
        defaultSpecTemplateId: parsed.defaultSpecTemplateId,
        position,
        isPublished: parsed.isPublished,
      },
    })

    invalidateCategoryTree()
    return ok({ id: cat.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  parentId: OptionalUuid,
  defaultSpecTemplateId: OptionalUuid,
  /**
   * Absent means "leave the position alone", NOT "move it to the top".
   *
   * The edit form has no position box any more — order is a drag. With the old
   * `.default(0)` a plain rename would have posted no `position` field, parsed
   * as 0, and quietly dragged that category to the front of its sibling set as
   * a side effect of fixing a typo. Nothing in the form would have hinted at
   * it, and the row that got displaced is not the row being edited.
   */
  position: z.coerce.number().int().min(0).nullable(),
  isPublished: z.boolean().default(false),
})

export async function updateCategory(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateCategorySchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      parentId: formData.get('parentId') ?? '',
      defaultSpecTemplateId: formData.get('defaultSpecTemplateId') ?? '',
      position: formData.get('position'),
      isPublished: formData.get('isPublished') === 'on',
    })

    if (parsed.parentId === parsed.id) {
      return fail('VALIDATION', 'A category cannot be its own parent', { parentId: ['Cannot self-reference'] })
    }

    // Walk parent chain to detect cycles.
    if (parsed.parentId) {
      let cursor: string | null = parsed.parentId
      const seen = new Set<string>()
      while (cursor) {
        if (cursor === parsed.id) {
          return fail('VALIDATION', 'Cannot create a circular parent chain', {
            parentId: ['Would create a cycle'],
          })
        }
        if (seen.has(cursor)) break
        seen.add(cursor)
        const nextRow: { parentId: string | null } | null = await db.category.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        })
        cursor = nextRow?.parentId ?? null
      }
    }

    const current = await db.category.findUnique({
      where: { id: parsed.id },
      select: { slug: true },
    })
    if (!current) return fail('NOT_FOUND', 'Category not found')

    // Deliberately NOT `uniqueSlug` here. On create, silently appending `-2`
    // is fine — the editor is naming something new. On update the slug is
    // usually being set for SEO reasons, and quietly landing on
    // `bsp-hose-fittings-uae-2` produces a URL nobody asked for and a redirect
    // pointing at it. Report the clash instead.
    const slug = slugify(parsed.slug)
    const clash = await db.category.findUnique({ where: { slug }, select: { id: true, name: true } })
    if (clash && clash.id !== parsed.id) {
      return fail('VALIDATION', `The slug "${slug}" is already used by "${clash.name}"`, {
        slug: ['Already in use by another category'],
      })
    }

    const renamed = slug !== current.slug
    const oldPath = `/c/${current.slug}`
    const newPath = `/c/${slug}`

    const data = {
      name: parsed.name,
      slug,
      parentId: parsed.parentId,
      defaultSpecTemplateId: parsed.defaultSpecTemplateId,
      ...(parsed.position === null ? {} : { position: parsed.position }),
      isPublished: parsed.isPublished,
    }

    if (renamed) {
      // Rename and redirect land in one transaction, so the old URL can never
      // be left 404ing because a second write failed.
      await withSeoAudit(
        {
          entityType: 'redirect',
          entityId: null,
          before: { fromPath: null, toPath: null, statusCode: null },
          after: { fromPath: oldPath, toPath: newPath, statusCode: 301 },
          actorId: session.user.id,
          reason: 'category slug renamed',
        },
        async (tx) => {
          await tx.category.update({ where: { id: parsed.id }, data })
          await recordSlugRedirect(tx, {
            fromPath: oldPath,
            toPath: newPath,
            notes: `Auto-created when category "${parsed.name}" was renamed`,
          })
        },
      )
    } else {
      await db.category.update({ where: { id: parsed.id }, data })
    }

    // The old and new slugs both need purging by hand. `invalidateCategoryTree()`
    // covers the shared tags and `/c`, but a renamed category's own page is
    // keyed by slug, and without this the old URL serves a stale 200 from cache
    // for up to an hour instead of the new redirect.
    if (renamed) {
      revalidatePath(oldPath)
      revalidatePath(newPath)
      revalidatePath('/admin/seo/redirects')
    }
    invalidateCategoryTree()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteCategory(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)

    const [childCount, productCount] = await Promise.all([
      db.category.count({ where: { parentId: id } }),
      db.product.count({ where: { categoryId: id } }),
    ])

    if (childCount > 0) {
      return fail('PRECONDITION_FAILED', 'Cannot delete: category has child categories', {
        _: ['Move or delete child categories first'],
      })
    }
    if (productCount > 0) {
      return fail('PRECONDITION_FAILED', 'Cannot delete: category has products attached', {
        _: ['Reassign or delete attached products first'],
      })
    }

    await db.category.delete({ where: { id } })
    invalidateCategoryTree()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ─── tree moves ─────────────────────────────────────────────────────────────

/**
 * Every category, in the shape the tree maths wants.
 *
 * The whole table, deliberately. A move rewrites two sibling sets and has to
 * validate against ancestors and descendants that the client may have had
 * collapsed and never sent, so there is no useful subset — and at 192 rows of
 * four scalar columns the read is not worth optimising into something that can
 * be wrong.
 */
async function loadTree(): Promise<CategoryTreeNode[]> {
  return db.category.findMany({
    select: { id: true, parentId: true, position: true, name: true },
  })
}

/**
 * Purge everything a tree change is visible on.
 *
 * `invalidateCategories()` covers the tag-cached reads — the homepage grid, the
 * megamenu, and `loadClusters` behind all 126 market pages. It does NOT cover
 * `/c`, which is a statically rendered route on a one-hour `revalidate` rather
 * than an `unstable_cache` entry, so a reorder of the root categories would sit
 * behind that timer with the tag purge reporting success. `/c/[slug]` is
 * already dynamic (it reads searchParams) and needs no help.
 */
function invalidateCategoryTree(): void {
  revalidatePath('/admin/categories')
  revalidatePath('/c')
  invalidateCategories()
}

const MoveCategorySchema = z.object({
  id: z.string().uuid(),
  newParentId: z.string().uuid().nullable(),
  newIndex: z.coerce.number().int().min(0),
})

/**
 * Re-home and/or re-order one category, and densely renumber every sibling it
 * left behind or joined.
 *
 * The client computes the same landing before it animates, but this recomputes
 * from the DB rather than trusting the payload. Two editors dragging at once
 * see different `position` values, and the loser of that race would otherwise
 * write an ordering derived from a tree that no longer exists.
 */
export async function moveCategory(
  input: z.input<typeof MoveCategorySchema>,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { id, newParentId, newIndex } = MoveCategorySchema.parse(input)

    const nodes = await loadTree()
    const moving = nodes.find((n) => n.id === id)
    if (!moving) return fail('NOT_FOUND', 'Category not found')

    if (newParentId) {
      const parent = nodes.find((n) => n.id === newParentId)
      if (!parent) return fail('NOT_FOUND', 'The destination category no longer exists')
      if (newParentId === id) {
        return fail('VALIDATION', 'A category cannot be its own parent')
      }
      // Dropping a branch inside itself. The client already excludes the
      // dragged subtree from its drop targets, so reaching this means the tree
      // changed underneath the drag — or the call did not come from the editor.
      if (descendantIds(nodes, id).includes(newParentId)) {
        return fail('VALIDATION', `Cannot move "${moving.name}" inside its own sub-tree`)
      }
    }

    const parentDepth = newParentId ? ancestorPath(nodes, newParentId).length : 0
    const landingDepth = parentDepth
    const height = subtreeHeight(nodes, id)
    if (landingDepth + height > MAX_CATEGORY_DEPTH) {
      return fail(
        'VALIDATION',
        height === 0
          ? `Categories can only nest ${MAX_CATEGORY_DEPTH + 1} levels deep`
          : `"${moving.name}" has sub-categories of its own — moving it there would nest them too deep`,
      )
    }

    const ordering = buildMoveOrdering({ nodes, activeId: id, newParentId, newIndex })
    if (ordering.length === 0) return ok(undefined)

    await db.$transaction(
      ordering.map((row) =>
        db.category.update({
          where: { id: row.id },
          data: { parentId: row.parentId, position: row.position },
        }),
      ),
    )

    // Reparenting deliberately does NOT touch slugs or write a redirect.
    // Category URLs are flat (`/c/<slug>`), not path-shaped, so moving a
    // category between branches changes no public URL and breaks no inbound
    // link. Only a rename does, and `updateCategory` handles that.
    invalidateCategoryTree()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const BulkPublishSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
  isPublished: z.boolean(),
})

/**
 * Publish or unpublish a selection.
 *
 * Unpublishing hides the category from `/c`, from the sub-category chips on its
 * parent, and from the product rollup — but it does NOT remove any megamenu
 * entry pointing at it. `getNavMenu` filters on the item's own `isVisible`, not
 * on the target's published state, so an unpublished category stays in the
 * megamenu and links to a 404. The editor surfaces that as a warning on the row
 * rather than silently rewriting a curated menu here.
 */
export async function bulkSetPublished(
  input: z.input<typeof BulkPublishSchema>,
): Promise<Result<{ count: number }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { ids, isPublished } = BulkPublishSchema.parse(input)

    const result = await db.category.updateMany({
      where: { id: { in: ids } },
      data: { isPublished },
    })

    invalidateCategoryTree()
    return ok({ count: result.count })
  } catch (err) {
    return failFromError(err)
  }
}

const BulkMoveSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  newParentId: z.string().uuid().nullable(),
})

/**
 * Re-home a selection under one new parent, appended in their current order.
 *
 * Validated per row and applied as one transaction: a selection that contains
 * both a branch and something inside that branch is rejected whole rather than
 * half-applied, because the half that succeeds is not a state anyone asked for
 * and the editor has already drawn the move as done.
 */
export async function bulkMoveCategories(
  input: z.input<typeof BulkMoveSchema>,
): Promise<Result<{ count: number }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { ids, newParentId } = BulkMoveSchema.parse(input)

    const nodes = await loadTree()
    const byId = new Map(nodes.map((n) => [n.id, n]))

    const missing = ids.filter((id) => !byId.has(id))
    if (missing.length > 0) return fail('NOT_FOUND', 'Some categories no longer exist')

    if (newParentId) {
      if (!byId.has(newParentId)) {
        return fail('NOT_FOUND', 'The destination category no longer exists')
      }
      if (ids.includes(newParentId)) {
        return fail('VALIDATION', 'A category cannot be moved inside itself')
      }
      for (const id of ids) {
        if (descendantIds(nodes, id).includes(newParentId)) {
          return fail(
            'VALIDATION',
            `Cannot move "${byId.get(id)!.name}" inside its own sub-tree`,
          )
        }
      }
    }

    const parentDepth = newParentId ? ancestorPath(nodes, newParentId).length : 0
    for (const id of ids) {
      if (parentDepth + subtreeHeight(nodes, id) > MAX_CATEGORY_DEPTH) {
        return fail(
          'VALIDATION',
          `"${byId.get(id)!.name}" has sub-categories that would nest too deep there`,
        )
      }
    }

    // Skipping rows already under the target keeps their position, so moving a
    // mixed selection does not shuffle the ones that were already home.
    const incoming = ids.filter((id) => (byId.get(id)!.parentId ?? null) !== newParentId)
    if (incoming.length === 0) return ok({ count: 0 })

    const existing = nodes
      .filter((n) => (n.parentId ?? null) === newParentId && !incoming.includes(n.id))
      .sort((a, b) => a.position - b.position)

    const appended = incoming
      .map((id) => byId.get(id)!)
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))

    const writes = [...existing, ...appended].map((n, position) => ({
      id: n.id,
      parentId: newParentId,
      position,
    }))

    // Every source sibling set the selection is leaving also needs closing up,
    // or the gaps become ties the next drag has to guess about.
    const touchedParents = new Set(appended.map((n) => n.parentId ?? null))
    for (const sourceParent of touchedParents) {
      if (sourceParent === newParentId) continue
      nodes
        .filter((n) => (n.parentId ?? null) === sourceParent && !incoming.includes(n.id))
        .sort((a, b) => a.position - b.position)
        .forEach((n, position) => writes.push({ id: n.id, parentId: sourceParent, position }))
    }

    await db.$transaction(
      writes.map((row) =>
        db.category.update({
          where: { id: row.id },
          data: { parentId: row.parentId, position: row.position },
        }),
      ),
    )

    invalidateCategoryTree()
    return ok({ count: incoming.length })
  } catch (err) {
    return failFromError(err)
  }
}
