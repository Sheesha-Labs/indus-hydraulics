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
      .slice(0, 80) || `industry-${Date.now()}`
  )
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base)
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await db.industry.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

const CreateIndustrySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : '')),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
  isPublished: z.boolean().default(false),
})

export async function createIndustry(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CreateIndustrySchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug') ?? '',
      description: formData.get('description') ?? '',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug || parsed.name)
    const ind = await db.industry.create({
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        isPublished: parsed.isPublished,
      },
    })

    revalidatePath(`/admin/industries`)
    return ok({ id: ind.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateIndustrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().transform((v) => (v && v.length ? v : null)),
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
  isPublished: z.boolean().default(false),
})

export async function updateIndustry(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateIndustrySchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') ?? '',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      isPublished: formData.get('isPublished') === 'on',
    })

    const slug = await uniqueSlug(parsed.slug, parsed.id)

    await db.industry.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        isPublished: parsed.isPublished,
      },
    })

    revalidatePath(`/admin/industries`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteIndustry(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)

    const accountCount = await db.account.count({ where: { industryId: id } })
    if (accountCount > 0) {
      return fail(
        'PRECONDITION_FAILED',
        `Cannot delete: ${accountCount} account${accountCount === 1 ? '' : 's'} reference this industry`,
        { _: ['Reassign or detach the accounts first'] }
      )
    }

    await db.industry.delete({ where: { id } })
    revalidatePath(`/admin/industries`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
