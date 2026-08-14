'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { projectSeoFields } from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { STORAGE_BUCKETS, deleteFromStorage, uploadToStorage } from '../../../../lib/supabase-admin'
import { withSeoAudit } from '../../../../lib/seo-audit'
import { recomputeContentScore } from '../../../../lib/recompute-content-score'

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `product-${Date.now()}`
  )
}

const ProductStatus = z.enum(['draft', 'active', 'discontinued'])
const Compatibility = z.enum(['direct', 'compatible', 'superseded_by_us'])
const Currency = z.enum(['USD', 'EUR', 'AED', 'SAR'])
const UnitOfMeasure = z.enum(['each', 'metre', 'kit', 'set'])
const DocumentKind = z.enum(['datasheet', 'step', 'iges', 'service_manual', 'installation_guide'])

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base)
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await db.product.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

// ── createProduct ───────────────────────────────────────────────────────────

const CreateProductSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  title: z.string().trim().min(1, 'Title is required').max(255),
  brandId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  categoryId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  status: ProductStatus.default('draft'),
})

export async function createProduct(formData: FormData): Promise<Result<{ id: string }>> {
  let createdId: string | null = null
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const parsed = CreateProductSchema.parse({
      sku: formData.get('sku'),
      title: formData.get('title'),
      brandId: formData.get('brandId') ?? '',
      categoryId: formData.get('categoryId') ?? '',
      status: formData.get('status') ?? 'draft',
    })

    const existingSku = await db.product.findUnique({ where: { sku: parsed.sku } })
    if (existingSku) {
      return fail('CONFLICT', `SKU "${parsed.sku}" is already in use`, { sku: ['SKU must be unique'] })
    }

    const slug = await uniqueSlug(parsed.title)

    // If the chosen category has a default spec template, auto-attach it.
    // Reduces clicks for the common case ("hose product → hose template").
    let inferredTemplateId: string | null = null
    if (parsed.categoryId) {
      const cat = await db.category.findUnique({
        where: { id: parsed.categoryId },
        select: { defaultSpecTemplateId: true },
      })
      inferredTemplateId = cat?.defaultSpecTemplateId ?? null
    }

    const product = await db.product.create({
      data: {
        sku: parsed.sku,
        title: parsed.title,
        slug,
        brandId: parsed.brandId,
        categoryId: parsed.categoryId,
        specTemplateId: inferredTemplateId,
        status: parsed.status,
      },
    })
    createdId = product.id
    await recomputeContentScore(product.id)

    revalidatePath(`/admin/products`)
  } catch (err) {
    return failFromError(err)
  }

  if (createdId) {
    redirect(`/admin/products/${createdId}/edit`)
  }
  return ok({ id: createdId! })
}

// ── updateProductCore (taxonomy + descriptions only) ─────────────────────────

const UpdateProductCoreSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().trim().min(1).max(64),
  mpn: z.string().trim().max(128).optional().transform((v) => (v && v.length ? v : null)),
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().max(120).optional().transform((v) => (v && v.length ? v : '')),
  descriptionShort: z.string().trim().max(500).optional().transform((v) => (v && v.length ? v : null)),
  brandId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  categoryId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  status: ProductStatus,
})

export async function updateProductCore(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const parsed = UpdateProductCoreSchema.parse({
      id: formData.get('id'),
      sku: formData.get('sku'),
      mpn: formData.get('mpn') ?? '',
      title: formData.get('title'),
      slug: formData.get('slug') ?? '',
      descriptionShort: formData.get('descriptionShort') ?? '',
      brandId: formData.get('brandId') ?? '',
      categoryId: formData.get('categoryId') ?? '',
      status: formData.get('status') ?? 'draft',
    })

    const skuOwner = await db.product.findUnique({ where: { sku: parsed.sku } })
    if (skuOwner && skuOwner.id !== parsed.id) {
      return fail('CONFLICT', `SKU "${parsed.sku}" is already used by another product`, {
        sku: ['SKU must be unique'],
      })
    }

    const finalSlug = await uniqueSlug(parsed.slug || parsed.title, parsed.id)

    await db.product.update({
      where: { id: parsed.id },
      data: {
        sku: parsed.sku,
        mpn: parsed.mpn,
        title: parsed.title,
        slug: finalSlug,
        descriptionShort: parsed.descriptionShort,
        brandId: parsed.brandId,
        categoryId: parsed.categoryId,
        status: parsed.status,
      },
    })
    await recomputeContentScore(parsed.id)

    revalidatePath(`/admin/products/${parsed.id}/edit`)
    revalidatePath(`/admin/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductDescription (long description, separate tab) ────────────────

const UpdateDescriptionSchema = z.object({
  id: z.string().uuid(),
  descriptionLong: z.string().trim().max(20000).optional().transform((v) => (v && v.length ? v : null)),
})

export async function updateProductDescription(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateDescriptionSchema.parse({
      id: formData.get('id'),
      descriptionLong: formData.get('descriptionLong') ?? '',
    })
    await db.product.update({
      where: { id: parsed.id },
      data: { descriptionLong: parsed.descriptionLong },
    })
    await recomputeContentScore(parsed.id)
    revalidatePath(`/admin/products/${parsed.id}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductCommerce (pricing, weight, dims, lead time, warranty) ──────

const optionalDecimal = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? Number(v) : null))
  .refine((v) => v === null || (!Number.isNaN(v) && v >= 0), { message: 'Must be a non-negative number' })

const optionalInt = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? Number(v) : null))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0), { message: 'Must be a non-negative integer' })

const UpdateCommerceSchema = z
  .object({
    id: z.string().uuid(),
    listPrice: optionalDecimal,
    compareAtPrice: optionalDecimal,
    listPriceCurrency: Currency.default('USD'),
    unitOfMeasure: UnitOfMeasure.default('each'),
    weightKg: optionalDecimal,
    dimensionLengthMm: optionalInt,
    dimensionWidthMm: optionalInt,
    dimensionHeightMm: optionalInt,
    leadTimeDays: optionalInt,
    warrantyMonths: optionalInt,
    stockQty: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() ? Number(v) : 0))
      .refine((v) => Number.isInteger(v) && v >= 0, { message: 'Stock must be a non-negative integer' }),
    stockWarehouse: z.string().trim().max(120).optional().transform((v) => (v && v.length ? v : null)),
    countryOfOrigin: z.string().trim().max(80).optional().transform((v) => (v && v.length ? v : null)),
    hsCode: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  })
  .refine(
    (v) =>
      v.compareAtPrice === null ||
      v.listPrice === null ||
      v.compareAtPrice > v.listPrice,
    { message: 'Compare-at price must be greater than List price', path: ['compareAtPrice'] },
  )

export async function updateProductCommerce(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateCommerceSchema.parse({
      id: formData.get('id'),
      listPrice: formData.get('listPrice') ?? '',
      compareAtPrice: formData.get('compareAtPrice') ?? '',
      listPriceCurrency: formData.get('listPriceCurrency') ?? 'USD',
      unitOfMeasure: formData.get('unitOfMeasure') ?? 'each',
      weightKg: formData.get('weightKg') ?? '',
      dimensionLengthMm: formData.get('dimensionLengthMm') ?? '',
      dimensionWidthMm: formData.get('dimensionWidthMm') ?? '',
      dimensionHeightMm: formData.get('dimensionHeightMm') ?? '',
      leadTimeDays: formData.get('leadTimeDays') ?? '',
      warrantyMonths: formData.get('warrantyMonths') ?? '',
      stockQty: formData.get('stockQty') ?? '0',
      stockWarehouse: formData.get('stockWarehouse') ?? '',
      countryOfOrigin: formData.get('countryOfOrigin') ?? '',
      hsCode: formData.get('hsCode') ?? '',
    })

    const dims =
      parsed.dimensionLengthMm !== null ||
      parsed.dimensionWidthMm !== null ||
      parsed.dimensionHeightMm !== null
        ? {
            l: parsed.dimensionLengthMm,
            w: parsed.dimensionWidthMm,
            h: parsed.dimensionHeightMm,
          }
        : null

    await db.product.update({
      where: { id: parsed.id },
      data: {
        listPrice: parsed.listPrice,
        compareAtPrice: parsed.compareAtPrice,
        listPriceCurrency: parsed.listPriceCurrency,
        unitOfMeasure: parsed.unitOfMeasure,
        weightKg: parsed.weightKg,
        dimensionsMm: dims === null ? Prisma.JsonNull : dims,
        leadTimeDays: parsed.leadTimeDays,
        warrantyMonths: parsed.warrantyMonths,
        stockQty: parsed.stockQty,
        stockWarehouse: parsed.stockWarehouse,
        countryOfOrigin: parsed.countryOfOrigin,
        hsCode: parsed.hsCode,
      },
    })
    await recomputeContentScore(parsed.id)

    revalidatePath(`/admin/products/${parsed.id}/edit`)
    revalidatePath(`/admin/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductSeo (separate so SEO tab can't clobber Core) ──────────────

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))

const ChangeFreqSchema = z.enum([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

const UpdateProductSeoSchema = z.object({
  id: z.string().uuid(),
  seoTitle: optionalString(180),
  seoDescription: optionalString(320),
  canonicalUrl: optionalString(2048).refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    'Canonical must be a full https:// URL or empty',
  ),
  focusKeyword: optionalString(120),
  robotsIndex: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  robotsFollow: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  ogImageMediaId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  sitemapPriority: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === '' || v === null) return null
      const n = Number(v)
      return Number.isNaN(n) ? null : Math.max(0, Math.min(1, n))
    }),
  sitemapChangeFreq: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? v : null))
    .pipe(ChangeFreqSchema.nullable()),
  excludeFromSitemap: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  jsonLdOverride: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length ? v : null)),
})

export async function updateProductSeo(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateProductSeoSchema.parse({
      id: formData.get('id'),
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      canonicalUrl: formData.get('canonicalUrl') ?? '',
      focusKeyword: formData.get('focusKeyword') ?? '',
      robotsIndex: formData.get('robotsIndex') ?? 'true',
      robotsFollow: formData.get('robotsFollow') ?? 'true',
      ogImageMediaId: formData.get('ogImageMediaId') ?? '',
      sitemapPriority: formData.get('sitemapPriority') ?? '',
      sitemapChangeFreq: formData.get('sitemapChangeFreq') ?? '',
      excludeFromSitemap: formData.get('excludeFromSitemap') ?? 'false',
      jsonLdOverride: formData.get('jsonLdOverride') ?? '',
    })

    let parsedOverride: Prisma.InputJsonValue | null = null
    if (parsed.jsonLdOverride !== null) {
      try {
        parsedOverride = JSON.parse(parsed.jsonLdOverride) as Prisma.InputJsonValue
      } catch {
        return fail('VALIDATION', 'jsonLdOverride must be valid JSON', {
          jsonLdOverride: ['Invalid JSON'],
        })
      }
    }

    // Validate ogImageMediaId actually exists. Cheap; avoids dangling FKs
    // since we don't declare the relation on the schema.
    if (parsed.ogImageMediaId) {
      const media = await db.media.findUnique({
        where: { id: parsed.ogImageMediaId },
        select: { id: true },
      })
      if (!media) {
        return fail('VALIDATION', 'Selected OG image no longer exists', {
          ogImageMediaId: ['Media row not found'],
        })
      }
    }

    const before = await db.product.findUnique({
      where: { id: parsed.id },
      select: {
        seoTitle: true,
        seoDescription: true,
        canonicalUrl: true,
        focusKeyword: true,
        robotsIndex: true,
        robotsFollow: true,
        ogImageMediaId: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
        excludeFromSitemap: true,
        jsonLdOverride: true,
      },
    })
    if (!before) return fail('NOT_FOUND', 'Product not found')

    const after = {
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      canonicalUrl: parsed.canonicalUrl,
      focusKeyword: parsed.focusKeyword,
      robotsIndex: parsed.robotsIndex,
      robotsFollow: parsed.robotsFollow,
      ogImageMediaId: parsed.ogImageMediaId,
      sitemapPriority: parsed.sitemapPriority,
      sitemapChangeFreq: parsed.sitemapChangeFreq,
      excludeFromSitemap: parsed.excludeFromSitemap,
      jsonLdOverride: parsedOverride,
    }

    await withSeoAudit(
      {
        entityType: 'product',
        entityId: parsed.id,
        before: projectSeoFields(before as Record<string, unknown>),
        after: projectSeoFields(after as Record<string, unknown>),
        actorId: session.user.id,
      },
      async (tx) => {
        await tx.product.update({
          where: { id: parsed.id },
          data: {
            seoTitle: after.seoTitle,
            seoDescription: after.seoDescription,
            canonicalUrl: after.canonicalUrl,
            focusKeyword: after.focusKeyword,
            robotsIndex: after.robotsIndex,
            robotsFollow: after.robotsFollow,
            ogImageMediaId: after.ogImageMediaId,
            sitemapPriority:
              after.sitemapPriority !== null
                ? new Prisma.Decimal(after.sitemapPriority)
                : null,
            sitemapChangeFreq: after.sitemapChangeFreq,
            excludeFromSitemap: after.excludeFromSitemap,
            jsonLdOverride: after.jsonLdOverride ?? Prisma.DbNull,
            seoUpdatedAt: new Date(),
            seoUpdatedById: session.user.id,
          },
        })
      },
    )
    await recomputeContentScore(parsed.id)

    revalidatePath(`/admin/products/${parsed.id}/edit`)
    revalidatePath('/admin/seo/inspector')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── uploadProductOgImage — used by the SEO drawer's OG picker ──────────────

export async function uploadProductOgImage(
  formData: FormData,
): Promise<
  Result<{ mediaId: string; storagePath: string; alt: string | null; originalFilename: string }>
> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const altRaw = (formData.get('alt') as string | null) ?? ''
    const alt = altRaw.trim() ? altRaw.trim().slice(0, 200) : null
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return fail('VALIDATION', 'Pick an image file to upload', {
        file: ['File is required'],
      })
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail('VALIDATION', `Image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB`)
    }
    if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return fail('VALIDATION', `Unsupported image type: ${file.type}`)
    }
    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.images,
      file,
      `seo/og`,
    )
    const media = await db.media.create({
      data: {
        kind: 'image',
        mimeType,
        originalFilename: file.name.slice(0, 200),
        storagePath,
        bytes,
        alt,
        uploadedById: session?.user?.id ?? null,
      },
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    })
    return ok({
      mediaId: media.id,
      storagePath: media.storagePath,
      alt: media.alt,
      originalFilename: media.originalFilename,
    })
  } catch (err) {
    return failFromError(err)
  }
}

// ── deleteProduct ───────────────────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)
    await db.product.delete({ where: { id } })
    revalidatePath(`/admin/products`)
  } catch (err) {
    return failFromError(err)
  }
  redirect(`/admin/products`)
}

// ── Product specs ───────────────────────────────────────────────────────────

const SpecBodySchema = z.object({
  group: z.string().trim().max(80).default('General'),
  label: z.string().trim().min(1, 'Label is required').max(120),
  value: z.string().trim().min(1, 'Value is required').max(500),
  unit: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  isFilterable: z.boolean().default(false),
})

export async function addProductSpec(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = SpecBodySchema.parse({
      group: (formData.get('group') as string | null) || 'General',
      label: formData.get('label'),
      value: formData.get('value'),
      unit: formData.get('unit') ?? '',
      isFilterable: formData.get('isFilterable') === 'on',
    })

    const max = await db.productSpec.aggregate({
      where: { productId },
      _max: { position: true },
    })

    await db.productSpec.create({
      data: {
        productId,
        ...body,
        position: (max._max.position ?? 0) + 1,
      },
    })

    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function updateProductSpec(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const id = z.string().uuid().parse(formData.get('id'))
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = SpecBodySchema.parse({
      group: (formData.get('group') as string | null) || 'General',
      label: formData.get('label'),
      value: formData.get('value'),
      unit: formData.get('unit') ?? '',
      isFilterable: formData.get('isFilterable') === 'on',
    })

    await db.productSpec.update({ where: { id }, data: body })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductSpec(specId: string, productId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(specId)
    z.string().uuid().parse(productId)
    await db.productSpec.delete({ where: { id: specId } })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product cross-references ────────────────────────────────────────────────

const CrossRefBodySchema = z.object({
  competitorBrand: z.string().trim().min(1).max(120),
  competitorMpn: z.string().trim().min(1).max(120),
  compatibility: Compatibility.default('direct'),
})

export async function addProductCrossReference(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = CrossRefBodySchema.parse({
      competitorBrand: formData.get('competitorBrand'),
      competitorMpn: formData.get('competitorMpn'),
      compatibility: formData.get('compatibility') ?? 'direct',
    })

    await db.productCrossReference.create({ data: { productId, ...body } })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function updateProductCrossReference(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const id = z.string().uuid().parse(formData.get('id'))
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = CrossRefBodySchema.parse({
      competitorBrand: formData.get('competitorBrand'),
      competitorMpn: formData.get('competitorMpn'),
      compatibility: formData.get('compatibility') ?? 'direct',
    })

    await db.productCrossReference.update({ where: { id }, data: body })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductCrossReference(crId: string, productId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(crId)
    z.string().uuid().parse(productId)
    await db.productCrossReference.delete({ where: { id: crId } })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product images — file upload via Supabase Storage ──────────────────────

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024 // 50 MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function uploadProductImage(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const productId = z.string().uuid().parse(formData.get('productId'))
    const altRaw = (formData.get('alt') as string | null) ?? ''
    const alt = altRaw.trim() ? altRaw.trim().slice(0, 200) : null

    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return fail('VALIDATION', 'Pick an image file to upload', { file: ['File is required'] })
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail('VALIDATION', `Image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB`)
    }
    if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return fail('VALIDATION', `Unsupported image type: ${file.type}`)
    }

    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.images,
      file,
      `products/${productId}`,
    )

    const max = await db.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    })

    await db.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          kind: 'image',
          mimeType,
          originalFilename: file.name.slice(0, 200),
          storagePath,
          bytes,
          alt,
          uploadedById: session?.user?.id ?? null,
        },
      })
      await tx.productImage.create({
        data: {
          productId,
          mediaId: media.id,
          alt,
          position: (max._max.position ?? -1) + 1,
        },
      })
    })

    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// Legacy URL-based add path — kept for cases where the source is already hosted elsewhere.

const AddImageSchema = z.object({
  productId: z.string().uuid(),
  url: z.string().url('Must be a valid URL').max(2048),
  alt: z.string().trim().max(200).optional().transform((v) => (v && v.length ? v : null)),
})

function inferMime(url: string): string {
  const lower = url.toLowerCase()
  if (lower.includes('.png')) return 'image/png'
  if (lower.includes('.webp')) return 'image/webp'
  if (lower.includes('.gif')) return 'image/gif'
  if (lower.includes('.svg')) return 'image/svg+xml'
  return 'image/jpeg'
}

export async function addProductImage(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const parsed = AddImageSchema.parse({
      productId: formData.get('productId'),
      url: formData.get('url'),
      alt: formData.get('alt') ?? '',
    })

    // Create Media row + ProductImage row in one transaction.
    const max = await db.productImage.aggregate({
      where: { productId: parsed.productId },
      _max: { position: true },
    })

    await db.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          kind: 'image',
          mimeType: inferMime(parsed.url),
          originalFilename: parsed.url.split('/').pop()?.slice(0, 200) ?? 'image',
          storagePath: parsed.url,
          bytes: 0,
          alt: parsed.alt,
          uploadedById: session?.user?.id ?? null,
        },
      })
      await tx.productImage.create({
        data: {
          productId: parsed.productId,
          mediaId: media.id,
          alt: parsed.alt,
          position: (max._max.position ?? -1) + 1,
        },
      })
    })

    revalidatePath(`/admin/products/${parsed.productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(imageId)
    z.string().uuid().parse(productId)
    const img = await db.productImage.findUnique({
      where: { id: imageId },
      include: { media: { select: { id: true, storagePath: true } } },
    })
    if (!img) return fail('NOT_FOUND', 'Image not found')
    await db.$transaction([
      db.productImage.delete({ where: { id: imageId } }),
      db.media.delete({ where: { id: img.mediaId } }),
    ])
    // Best-effort storage cleanup — don't fail the whole action if it fails.
    await deleteFromStorage(img.media.storagePath)
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function reorderProductImage(
  imageId: string,
  direction: 'up' | 'down',
  productId: string,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(imageId)
    z.string().uuid().parse(productId)
    const images = await db.productImage.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    })
    const idx = images.findIndex((i) => i.id === imageId)
    if (idx === -1) return fail('NOT_FOUND', 'Image not found')
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= images.length) return ok(undefined) // no-op at boundaries

    const a = images[idx]!
    const b = images[swapIdx]!
    await db.$transaction([
      db.productImage.update({ where: { id: a.id }, data: { position: b.position } }),
      db.productImage.update({ where: { id: b.id }, data: { position: a.position } }),
    ])
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product documents — file upload via Supabase Storage ───────────────────

const DATASHEET_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
])

const DATASHEET_URL_EXTENSIONS = /\.(pdf|png|jpe?g)(\?|#|$)/i

/**
 * Inside a Prisma transaction, remove any existing datasheet rows for the
 * given product and return their storage paths so the caller can clean
 * them up best-effort *after* the tx commits.
 *
 * The single-datasheet rule is also backed by a partial unique index
 * (`product_documents_one_datasheet_per_product`); that index prevents
 * concurrent inserts from racing past this check. `findMany` + `deleteMany`
 * tolerates the rare case where multiple stragglers exist.
 */
async function replaceExistingDatasheet(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<{ storagePaths: string[]; preservedPosition: number | null }> {
  const existing = await tx.productDocument.findMany({
    where: { productId, kind: 'datasheet' },
    include: { media: { select: { id: true, storagePath: true } } },
    orderBy: { position: 'asc' },
  })
  if (existing.length === 0) {
    return { storagePaths: [], preservedPosition: null }
  }
  const docIds = existing.map((d) => d.id)
  const mediaIds = existing.map((d) => d.mediaId)
  await tx.productDocument.deleteMany({ where: { id: { in: docIds } } })
  await tx.media.deleteMany({ where: { id: { in: mediaIds } } })
  return {
    storagePaths: existing.map((d) => d.media.storagePath),
    preservedPosition: existing[0]?.position ?? null,
  }
}

async function bestEffortDeleteFromStorage(paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      await deleteFromStorage(path)
    } catch {
      /* swallow — orphaned file in storage but DB is correct */
    }
  }
}

export async function uploadProductDocument(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const productId = z.string().uuid().parse(formData.get('productId'))
    const kind = DocumentKind.parse(formData.get('kind') ?? 'datasheet')
    const title = z.string().trim().min(1).max(200).parse(formData.get('title'))
    const language = z.string().trim().min(2).max(8).parse(formData.get('language') ?? 'en')
    const isGated = formData.get('isGated') === 'on'

    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return fail('VALIDATION', 'Pick a file to upload', { file: ['File is required'] })
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      return fail('VALIDATION', `Document must be under ${MAX_DOCUMENT_BYTES / 1024 / 1024}MB`)
    }
    if (kind === 'datasheet' && !DATASHEET_MIME_TYPES.has(file.type)) {
      return fail(
        'VALIDATION',
        'Datasheet must be a PDF, PNG, or JPEG file',
        { file: ['Invalid file type'] },
      )
    }

    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.documents,
      file,
      `products/${productId}`,
    )

    let staleStoragePaths: string[] = []
    try {
      await db.$transaction(async (tx) => {
        let preservedPosition: number | null = null
        if (kind === 'datasheet') {
          const replaced = await replaceExistingDatasheet(tx, productId)
          staleStoragePaths = replaced.storagePaths
          preservedPosition = replaced.preservedPosition
        }
        const max =
          preservedPosition !== null
            ? null
            : await tx.productDocument.aggregate({
                where: { productId },
                _max: { position: true },
              })
        const media = await tx.media.create({
          data: {
            kind: 'document',
            mimeType,
            originalFilename: file.name.slice(0, 200),
            storagePath,
            bytes,
            uploadedById: session?.user?.id ?? null,
          },
        })
        await tx.productDocument.create({
          data: {
            productId,
            kind,
            title,
            language,
            isGated,
            mediaId: media.id,
            position: preservedPosition ?? (max?._max.position ?? -1) + 1,
          },
        })
      })
    } catch (err) {
      // Roll back the just-uploaded file so we don't leak it to storage.
      await bestEffortDeleteFromStorage([storagePath])
      throw err
    }

    await bestEffortDeleteFromStorage(staleStoragePaths)

    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// Legacy URL-based document add — kept for externally-hosted PDFs.

const DocumentBodySchema = z.object({
  kind: DocumentKind,
  title: z.string().trim().min(1).max(200),
  language: z.string().trim().min(2).max(8).default('en'),
  url: z.string().url('Must be a valid URL').max(2048),
  isGated: z.boolean().default(false),
})

export async function addProductDocument(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = DocumentBodySchema.parse({
      kind: formData.get('kind') ?? 'datasheet',
      title: formData.get('title'),
      language: (formData.get('language') as string | null) || 'en',
      url: formData.get('url'),
      isGated: formData.get('isGated') === 'on',
    })

    if (body.kind === 'datasheet' && !DATASHEET_URL_EXTENSIONS.test(body.url)) {
      return fail(
        'VALIDATION',
        'Datasheet URL must point to a PDF, PNG, or JPEG file',
        { url: ['Invalid file type — must end in .pdf, .png, .jpg, or .jpeg'] },
      )
    }

    let staleStoragePaths: string[] = []
    await db.$transaction(async (tx) => {
      let preservedPosition: number | null = null
      if (body.kind === 'datasheet') {
        const replaced = await replaceExistingDatasheet(tx, productId)
        staleStoragePaths = replaced.storagePaths
        preservedPosition = replaced.preservedPosition
      }
      const max =
        preservedPosition !== null
          ? null
          : await tx.productDocument.aggregate({
              where: { productId },
              _max: { position: true },
            })
      const media = await tx.media.create({
        data: {
          kind: 'document',
          mimeType: 'application/pdf',
          originalFilename: body.url.split('/').pop()?.slice(0, 200) ?? body.title,
          storagePath: body.url,
          bytes: 0,
          uploadedById: session?.user?.id ?? null,
        },
      })
      await tx.productDocument.create({
        data: {
          productId,
          kind: body.kind,
          title: body.title,
          language: body.language,
          isGated: body.isGated,
          mediaId: media.id,
          position: preservedPosition ?? (max?._max.position ?? -1) + 1,
        },
      })
    })

    // Externally-hosted URLs that we replaced may still live in our storage
    // bucket if they were previously uploaded; clean those up best-effort.
    await bestEffortDeleteFromStorage(
      staleStoragePaths.filter((p) => !p.startsWith('http')),
    )

    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductDocument(docId: string, productId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(docId)
    z.string().uuid().parse(productId)
    const doc = await db.productDocument.findUnique({
      where: { id: docId },
      include: { media: { select: { id: true, storagePath: true } } },
    })
    if (!doc) return fail('NOT_FOUND', 'Document not found')
    await db.$transaction([
      db.productDocument.delete({ where: { id: docId } }),
      db.media.delete({ where: { id: doc.mediaId } }),
    ])
    await deleteFromStorage(doc.media.storagePath)
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product FAQs (admin-curated) ────────────────────────────────────────────

const FaqBodySchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(2000),
  answer: z.string().trim().min(1, 'Answer is required').max(4000),
})

export async function addProductFaq(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = FaqBodySchema.parse({
      question: formData.get('question'),
      answer: formData.get('answer'),
    })

    const max = await db.productFaq.aggregate({
      where: { productId },
      _max: { position: true },
    })

    await db.productFaq.create({
      data: {
        productId,
        ...body,
        position: (max._max.position ?? -1) + 1,
      },
    })

    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function updateProductFaq(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const id = z.string().uuid().parse(formData.get('id'))
    const productId = z.string().uuid().parse(formData.get('productId'))
    const body = FaqBodySchema.parse({
      question: formData.get('question'),
      answer: formData.get('answer'),
    })

    await db.productFaq.update({ where: { id }, data: body })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductFaq(id: string, productId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(id)
    z.string().uuid().parse(productId)
    await db.productFaq.delete({ where: { id } })
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function reorderProductFaq(
  id: string,
  direction: 'up' | 'down',
  productId: string,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(id)
    z.string().uuid().parse(productId)
    const faqs = await db.productFaq.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    })
    const idx = faqs.findIndex((f) => f.id === id)
    if (idx === -1) return fail('NOT_FOUND', 'FAQ not found')
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= faqs.length) return ok(undefined) // no-op at boundaries

    const a = faqs[idx]!
    const b = faqs[swapIdx]!
    await db.$transaction([
      db.productFaq.update({ where: { id: a.id }, data: { position: b.position } }),
      db.productFaq.update({ where: { id: b.id }, data: { position: a.position } }),
    ])
    revalidatePath(`/admin/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
