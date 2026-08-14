'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { auth } from '../../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../../lib/result'

// Brand Tier C — specialist card + stats row + case studies. The
// existing actions.ts handles basic brand fields (name/slug/country/
// description/isPublished/seoTitle/seoDescription); the [id]/edit
// actions.ts handles the SEO override block; this file fills the
// gap on the new Tier C columns.

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))

const optionalInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? Math.trunc(n) : null
  })

function parseJson(
  v: FormDataEntryValue | null,
  fallback: Prisma.InputJsonValue,
): { value: Prisma.InputJsonValue; error: string | null } {
  if (typeof v !== 'string' || v.trim().length === 0) return { value: fallback, error: null }
  try {
    return { value: JSON.parse(v) as Prisma.InputJsonValue, error: null }
  } catch (e) {
    return { value: fallback, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

function invalidate(brandId: string) {
  revalidatePath('/admin/brands')
  revalidatePath(`/admin/brands/${brandId}/edit`)
}

// ── Brand content update ──────────────────────────────────────────────────

const UpdateBrandContentSchema = z.object({
  id: z.string().uuid(),
  position: optionalInt.transform((v) => v ?? 0),
  accountManagerName: optionalString(120),
  accountManagerTitle: optionalString(120),
  accountManagerYearsExp: optionalString(60),
  accountManagerInitials: optionalString(8),
  fastestLeadTime: optionalString(40),
  largestInstallValue: optionalString(60),
  largestInstallContext: optionalString(160),
  partnerSince: optionalInt,
})

export async function updateBrandContent(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateBrandContentSchema.parse({
      id: formData.get('id'),
      position: formData.get('position') ?? '0',
      accountManagerName: formData.get('accountManagerName') ?? '',
      accountManagerTitle: formData.get('accountManagerTitle') ?? '',
      accountManagerYearsExp: formData.get('accountManagerYearsExp') ?? '',
      accountManagerInitials: formData.get('accountManagerInitials') ?? '',
      fastestLeadTime: formData.get('fastestLeadTime') ?? '',
      largestInstallValue: formData.get('largestInstallValue') ?? '',
      largestInstallContext: formData.get('largestInstallContext') ?? '',
      partnerSince: formData.get('partnerSince') ?? '',
    })

    await db.brand.update({
      where: { id: parsed.id },
      data: {
        position: parsed.position,
        accountManagerName: parsed.accountManagerName,
        accountManagerTitle: parsed.accountManagerTitle,
        accountManagerYearsExp: parsed.accountManagerYearsExp,
        accountManagerInitials: parsed.accountManagerInitials,
        fastestLeadTime: parsed.fastestLeadTime,
        largestInstallValue: parsed.largestInstallValue,
        largestInstallContext: parsed.largestInstallContext,
        partnerSince: parsed.partnerSince,
      },
    })

    invalidate(parsed.id)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Case studies CRUD ─────────────────────────────────────────────────────

const CaseStudyBaseSchema = z.object({
  brandId: z.string().uuid(),
  tag: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(2000),
  year: optionalString(40),
  imageId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  position: optionalInt.transform((v) => v ?? 0),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean()),
})

export async function createBrandCaseStudy(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CaseStudyBaseSchema.parse({
      brandId: formData.get('brandId'),
      tag: formData.get('tag'),
      title: formData.get('title'),
      description: formData.get('description'),
      year: formData.get('year') ?? '',
      imageId: formData.get('imageId') ?? '',
      position: formData.get('position') ?? '0',
      isPublished: formData.get('isPublished') ?? 'true',
    })
    const stats = parseJson(formData.get('stats'), [])
    if (stats.error) return fail('VALIDATION', `stats: ${stats.error}`)

    const cs = await db.brandCaseStudy.create({
      data: { ...parsed, stats: stats.value },
      select: { id: true },
    })
    invalidate(parsed.brandId)
    return ok({ id: cs.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateBrandCaseStudySchema = CaseStudyBaseSchema.extend({ id: z.string().uuid() })

export async function updateBrandCaseStudy(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateBrandCaseStudySchema.parse({
      id: formData.get('id'),
      brandId: formData.get('brandId'),
      tag: formData.get('tag'),
      title: formData.get('title'),
      description: formData.get('description'),
      year: formData.get('year') ?? '',
      imageId: formData.get('imageId') ?? '',
      position: formData.get('position') ?? '0',
      isPublished: formData.get('isPublished') ?? 'false',
    })
    const stats = parseJson(formData.get('stats'), [])
    if (stats.error) return fail('VALIDATION', `stats: ${stats.error}`)

    await db.brandCaseStudy.update({
      where: { id: parsed.id },
      data: {
        tag: parsed.tag,
        title: parsed.title,
        description: parsed.description,
        year: parsed.year,
        imageId: parsed.imageId,
        position: parsed.position,
        isPublished: parsed.isPublished,
        stats: stats.value,
      },
    })
    invalidate(parsed.brandId)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteBrandCaseStudy(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = z
      .object({ id: z.string().uuid(), brandId: z.string().uuid() })
      .parse({
        id: formData.get('id'),
        brandId: formData.get('brandId'),
      })
    await db.brandCaseStudy.delete({ where: { id: parsed.id } })
    invalidate(parsed.brandId)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
