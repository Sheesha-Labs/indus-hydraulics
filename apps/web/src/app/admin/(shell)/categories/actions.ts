'use server'

import { revalidatePath } from 'next/cache'
import { invalidateCategories } from '../../../../lib/cache-tags'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { withSeoAudit } from '../../../../lib/seo-audit'
import { recordSlugRedirect } from '../../../../lib/slug-redirect'

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
      position: formData.get('position') ?? 0,
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug || parsed.name)
    const cat = await db.category.create({
      data: {
        name: parsed.name,
        slug,
        parentId: parsed.parentId,
        defaultSpecTemplateId: parsed.defaultSpecTemplateId,
        position: parsed.position,
        isPublished: parsed.isPublished,
      },
    })

    revalidatePath(`/admin/categories`)
    invalidateCategories()
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
  position: z.coerce.number().int().min(0).default(0),
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
      position: formData.get('position') ?? 0,
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
      position: parsed.position,
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

    revalidatePath(`/admin/categories`)
    // `invalidateCategories()` purges the shared category/nav tags, but the
    // storefront category page is ISR (revalidate = 3600) and keyed by slug —
    // both paths need purging by hand or the old URL serves a stale 200 from
    // cache for up to an hour instead of the new redirect.
    if (renamed) {
      revalidatePath(oldPath)
      revalidatePath(newPath)
      revalidatePath('/admin/seo/redirects')
    }
    invalidateCategories()
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
    revalidatePath(`/admin/categories`)
    invalidateCategories()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
