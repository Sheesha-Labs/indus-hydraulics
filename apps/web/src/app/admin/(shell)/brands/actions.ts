'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `brand-${Date.now()}`
  )
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base)
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await db.brand.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

const CreateBrandSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : '')),
  country: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : null)),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
  isAuthorizedDistributor: z.boolean().default(false),
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
  isPublished: z.boolean().default(false),
})

export async function createBrand(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CreateBrandSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug') ?? '',
      country: formData.get('country') ?? '',
      description: formData.get('description') ?? '',
      isAuthorizedDistributor: formData.get('isAuthorizedDistributor') === 'on',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug || parsed.name)
    const brand = await db.brand.create({
      data: {
        name: parsed.name,
        slug,
        country: parsed.country,
        description: parsed.description,
        isAuthorizedDistributor: parsed.isAuthorizedDistributor,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        isPublished: parsed.isPublished,
      },
    })

    revalidatePath(`/admin/brands`)
    return ok({ id: brand.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateBrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  country: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : null)),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
  isAuthorizedDistributor: z.boolean().default(false),
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
  isPublished: z.boolean().default(false),
})

export async function updateBrand(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateBrandSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      country: formData.get('country') ?? '',
      description: formData.get('description') ?? '',
      isAuthorizedDistributor: formData.get('isAuthorizedDistributor') === 'on',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug, parsed.id)

    await db.brand.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        slug,
        country: parsed.country,
        description: parsed.description,
        isAuthorizedDistributor: parsed.isAuthorizedDistributor,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        isPublished: parsed.isPublished,
      },
    })

    revalidatePath(`/admin/brands`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteBrand(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)

    const productCount = await db.product.count({ where: { brandId: id } })
    if (productCount > 0) {
      return fail(
        'PRECONDITION_FAILED',
        `Cannot delete: ${productCount} product${productCount === 1 ? '' : 's'} reference this brand`,
        { _: ['Reassign or delete the products first'] },
      )
    }

    await db.brand.delete({ where: { id } })
    revalidatePath(`/admin/brands`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
