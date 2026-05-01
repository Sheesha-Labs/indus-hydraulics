'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { STORAGE_BUCKETS, deleteFromStorage, uploadToStorage } from '../../../../lib/supabase'

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
const Currency = z.enum(['USD', 'INR', 'EUR', 'AED', 'SAR'])
const UnitOfMeasure = z.enum(['each', 'metre', 'kit', 'set'])
const DocumentKind = z.enum(['datasheet', 'step', 'iges', 'service_manual', 'installation_guide'])
const Locale = z.string().min(1).default('en')

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
  locale: Locale,
})

export async function createProduct(formData: FormData): Promise<Result<{ id: string; locale: string }>> {
  let locale = 'en'
  let createdId: string | null = null
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const parsed = CreateProductSchema.parse({
      sku: formData.get('sku'),
      title: formData.get('title'),
      brandId: formData.get('brandId') ?? '',
      categoryId: formData.get('categoryId') ?? '',
      status: formData.get('status') ?? 'draft',
      locale: formData.get('locale') ?? 'en',
    })
    locale = parsed.locale

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

    revalidatePath(`/${locale}/products`)
  } catch (err) {
    return failFromError(err)
  }

  if (createdId) {
    redirect(`/${locale}/products/${createdId}/edit`)
  }
  return ok({ id: createdId!, locale })
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
  locale: Locale,
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
      locale: formData.get('locale') ?? 'en',
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

    revalidatePath(`/${parsed.locale}/products/${parsed.id}/edit`)
    revalidatePath(`/${parsed.locale}/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductDescription (long description, separate tab) ────────────────

const UpdateDescriptionSchema = z.object({
  id: z.string().uuid(),
  descriptionLong: z.string().trim().max(20000).optional().transform((v) => (v && v.length ? v : null)),
  locale: Locale,
})

export async function updateProductDescription(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateDescriptionSchema.parse({
      id: formData.get('id'),
      descriptionLong: formData.get('descriptionLong') ?? '',
      locale: formData.get('locale') ?? 'en',
    })
    await db.product.update({
      where: { id: parsed.id },
      data: { descriptionLong: parsed.descriptionLong },
    })
    revalidatePath(`/${parsed.locale}/products/${parsed.id}/edit`)
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

const UpdateCommerceSchema = z.object({
  id: z.string().uuid(),
  listPrice: optionalDecimal,
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
  locale: Locale,
})

export async function updateProductCommerce(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateCommerceSchema.parse({
      id: formData.get('id'),
      listPrice: formData.get('listPrice') ?? '',
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
      locale: formData.get('locale') ?? 'en',
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

    revalidatePath(`/${parsed.locale}/products/${parsed.id}/edit`)
    revalidatePath(`/${parsed.locale}/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductSeo (separate so SEO tab can't clobber Core) ──────────────

const UpdateProductSeoSchema = z.object({
  id: z.string().uuid(),
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
  locale: Locale,
})

export async function updateProductSeo(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = UpdateProductSeoSchema.parse({
      id: formData.get('id'),
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      locale: formData.get('locale') ?? 'en',
    })
    await db.product.update({
      where: { id: parsed.id },
      data: { seoTitle: parsed.seoTitle, seoDescription: parsed.seoDescription },
    })
    revalidatePath(`/${parsed.locale}/products/${parsed.id}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── deleteProduct ───────────────────────────────────────────────────────────

export async function deleteProduct(id: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    z.string().uuid().parse(id)
    await db.product.delete({ where: { id } })
    revalidatePath(`/${locale}/products`)
  } catch (err) {
    return failFromError(err)
  }
  redirect(`/${locale}/products`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
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

    revalidatePath(`/${locale}/products/${productId}/edit`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
    const body = SpecBodySchema.parse({
      group: (formData.get('group') as string | null) || 'General',
      label: formData.get('label'),
      value: formData.get('value'),
      unit: formData.get('unit') ?? '',
      isFilterable: formData.get('isFilterable') === 'on',
    })

    await db.productSpec.update({ where: { id }, data: body })
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductSpec(specId: string, productId: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(specId)
    z.string().uuid().parse(productId)
    await db.productSpec.delete({ where: { id: specId } })
    revalidatePath(`/${locale}/products/${productId}/edit`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
    const body = CrossRefBodySchema.parse({
      competitorBrand: formData.get('competitorBrand'),
      competitorMpn: formData.get('competitorMpn'),
      compatibility: formData.get('compatibility') ?? 'direct',
    })

    await db.productCrossReference.create({ data: { productId, ...body } })
    revalidatePath(`/${locale}/products/${productId}/edit`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
    const body = CrossRefBodySchema.parse({
      competitorBrand: formData.get('competitorBrand'),
      competitorMpn: formData.get('competitorMpn'),
      compatibility: formData.get('compatibility') ?? 'direct',
    })

    await db.productCrossReference.update({ where: { id }, data: body })
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductCrossReference(crId: string, productId: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(crId)
    z.string().uuid().parse(productId)
    await db.productCrossReference.delete({ where: { id: crId } })
    revalidatePath(`/${locale}/products/${productId}/edit`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
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

    revalidatePath(`/${locale}/products/${productId}/edit`)
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
  locale: Locale,
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
      locale: formData.get('locale') ?? 'en',
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

    revalidatePath(`/${parsed.locale}/products/${parsed.productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductImage(imageId: string, productId: string, locale: string): Promise<Result<void>> {
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
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function reorderProductImage(
  imageId: string,
  direction: 'up' | 'down',
  productId: string,
  locale: string,
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
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product documents — file upload via Supabase Storage ───────────────────

export async function uploadProductDocument(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const session = await auth()
    const productId = z.string().uuid().parse(formData.get('productId'))
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
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

    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.documents,
      file,
      `products/${productId}`,
    )

    const max = await db.productDocument.aggregate({
      where: { productId },
      _max: { position: true },
    })

    await db.$transaction(async (tx) => {
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
          position: (max._max.position ?? -1) + 1,
        },
      })
    })

    revalidatePath(`/${locale}/products/${productId}/edit`)
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
    const locale = z.string().min(1).parse(formData.get('locale') ?? 'en')
    const body = DocumentBodySchema.parse({
      kind: formData.get('kind') ?? 'datasheet',
      title: formData.get('title'),
      language: (formData.get('language') as string | null) || 'en',
      url: formData.get('url'),
      isGated: formData.get('isGated') === 'on',
    })

    const max = await db.productDocument.aggregate({
      where: { productId },
      _max: { position: true },
    })

    await db.$transaction(async (tx) => {
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
          position: (max._max.position ?? -1) + 1,
        },
      })
    })

    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductDocument(docId: string, productId: string, locale: string): Promise<Result<void>> {
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
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Product Q&A (admin moderation) ──────────────────────────────────────────

const AnswerQuestionSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  answer: z.string().trim().min(1, 'Answer is required').max(4000),
  publish: z.boolean().default(true),
  locale: Locale,
})

export async function answerProductQuestion(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = AnswerQuestionSchema.parse({
      id: formData.get('id'),
      productId: formData.get('productId'),
      answer: formData.get('answer'),
      publish: formData.get('publish') === 'on',
      locale: formData.get('locale') ?? 'en',
    })

    await db.productQuestion.update({
      where: { id: parsed.id },
      data: {
        answer: parsed.answer,
        answeredAt: new Date(),
        isPublished: parsed.publish,
      },
    })

    revalidatePath(`/${parsed.locale}/products/${parsed.productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function setQuestionPublished(
  id: string,
  productId: string,
  isPublished: boolean,
  locale: string,
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(id)
    z.string().uuid().parse(productId)
    await db.productQuestion.update({ where: { id }, data: { isPublished } })
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteProductQuestion(id: string, productId: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(id)
    z.string().uuid().parse(productId)
    await db.productQuestion.delete({ where: { id } })
    revalidatePath(`/${locale}/products/${productId}/edit`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
