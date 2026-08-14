'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { auth } from '../../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../../lib/result'

// Tier C content fields — tagline / headline / breadcrumb / gradient,
// position, the four JSON columns (chips, stats, deliveryAreas,
// supportBlock), and the two SKU/slug arrays. Plus full CRUD for the
// IndustryCaseStudy model. The existing actions.ts handles the basic
// industry fields (name, slug, description, isPublished) and the SEO
// overrides; this file covers everything else added in Tier C.

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))

function csv(v: FormDataEntryValue | null): string[] {
  if (typeof v !== 'string') return []
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

type PrismaJsonInput = Prisma.InputJsonValue | typeof Prisma.JsonNull

function parseJson(
  v: FormDataEntryValue | null,
  fallback: PrismaJsonInput,
): { value: PrismaJsonInput; error: string | null } {
  if (typeof v !== 'string' || v.trim().length === 0) return { value: fallback, error: null }
  try {
    return { value: JSON.parse(v) as Prisma.InputJsonValue, error: null }
  } catch (e) {
    return { value: fallback, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

function invalidate(industryId: string) {
  updateTag('industries')
  revalidatePath('/admin/industries')
  revalidatePath(`/admin/industries/${industryId}/edit`)
}

// ── Industry content update ───────────────────────────────────────────────

const UpdateContentBaseSchema = z.object({
  id: z.string().uuid(),
  tagline: optionalString(200),
  headline: optionalString(300),
  breadcrumb: optionalString(120),
  gradient: optionalString(400),
  position: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length ? Number(v) : 0),
    z.number().int(),
  ),
})

export async function updateIndustryContent(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateContentBaseSchema.parse({
      id: formData.get('id'),
      tagline: formData.get('tagline') ?? '',
      headline: formData.get('headline') ?? '',
      breadcrumb: formData.get('breadcrumb') ?? '',
      gradient: formData.get('gradient') ?? '',
      position: formData.get('position') ?? '0',
    })

    const chips = parseJson(formData.get('chips'), [])
    if (chips.error) return fail('VALIDATION', `chips: ${chips.error}`)
    const stats = parseJson(formData.get('stats'), [])
    if (stats.error) return fail('VALIDATION', `stats: ${stats.error}`)
    const deliveryAreas = parseJson(formData.get('deliveryAreas'), [])
    if (deliveryAreas.error) return fail('VALIDATION', `deliveryAreas: ${deliveryAreas.error}`)
    const supportBlock = parseJson(formData.get('supportBlock'), Prisma.JsonNull)
    if (supportBlock.error) return fail('VALIDATION', `supportBlock: ${supportBlock.error}`)

    await db.industry.update({
      where: { id: parsed.id },
      data: {
        tagline: parsed.tagline,
        headline: parsed.headline,
        breadcrumb: parsed.breadcrumb,
        gradient: parsed.gradient,
        position: parsed.position,
        chips: chips.value,
        stats: stats.value,
        deliveryAreas: deliveryAreas.value,
        supportBlock: supportBlock.value,
        featuredProductSkus: csv(formData.get('featuredProductSkus')),
        featuredCategorySlugs: csv(formData.get('featuredCategorySlugs')),
        heroId: (() => {
          const raw = formData.get('heroId')
          if (typeof raw !== 'string') return undefined
          const trimmed = raw.trim()
          return trimmed.length === 0 ? null : trimmed
        })(),
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
  industryId: z.string().uuid(),
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
  position: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length ? Number(v) : 0),
    z.number().int(),
  ),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean()),
})

export async function createCaseStudy(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = CaseStudyBaseSchema.parse({
      industryId: formData.get('industryId'),
      tag: formData.get('tag'),
      title: formData.get('title'),
      description: formData.get('description'),
      year: formData.get('year') ?? '',
      imageId: formData.get('imageId') ?? '',
      position: formData.get('position') ?? '0',
      isPublished: formData.get('isPublished') ?? 'true',
    })
    const cs = await db.industryCaseStudy.create({
      data: parsed,
      select: { id: true },
    })
    invalidate(parsed.industryId)
    return ok({ id: cs.id })
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateCaseStudySchema = CaseStudyBaseSchema.extend({ id: z.string().uuid() })

export async function updateCaseStudy(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateCaseStudySchema.parse({
      id: formData.get('id'),
      industryId: formData.get('industryId'),
      tag: formData.get('tag'),
      title: formData.get('title'),
      description: formData.get('description'),
      year: formData.get('year') ?? '',
      imageId: formData.get('imageId') ?? '',
      position: formData.get('position') ?? '0',
      isPublished: formData.get('isPublished') ?? 'false',
    })
    await db.industryCaseStudy.update({
      where: { id: parsed.id },
      data: {
        tag: parsed.tag,
        title: parsed.title,
        description: parsed.description,
        year: parsed.year,
        imageId: parsed.imageId,
        position: parsed.position,
        isPublished: parsed.isPublished,
      },
    })
    invalidate(parsed.industryId)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteCaseStudy(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = z
      .object({ id: z.string().uuid(), industryId: z.string().uuid() })
      .parse({
        id: formData.get('id'),
        industryId: formData.get('industryId'),
      })
    await db.industryCaseStudy.delete({ where: { id: parsed.id } })
    invalidate(parsed.industryId)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
