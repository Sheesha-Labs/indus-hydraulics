'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

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
    const product = await db.product.create({
      data: {
        sku: parsed.sku,
        title: parsed.title,
        slug,
        brandId: parsed.brandId,
        categoryId: parsed.categoryId,
        status: parsed.status,
      },
    })
    createdId = product.id

    revalidatePath(`/${locale}/products`)
  } catch (err) {
    return failFromError(err)
  }

  // `redirect()` throws — must run outside the try/catch above.
  if (createdId) {
    redirect(`/${locale}/products/${createdId}/edit`)
  }
  return ok({ id: createdId!, locale })
}

// ── updateProductCore ───────────────────────────────────────────────────────

const UpdateProductCoreSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().trim().min(1).max(64),
  mpn: z.string().trim().max(128).optional().transform((v) => (v && v.length ? v : null)),
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().max(120).optional().transform((v) => (v && v.length ? v : '')),
  descriptionShort: z.string().trim().max(500).optional().transform((v) => (v && v.length ? v : null)),
  descriptionLong: z.string().trim().max(20000).optional().transform((v) => (v && v.length ? v : null)),
  brandId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  categoryId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  status: ProductStatus,
  seoTitle: z.string().trim().max(180).optional().transform((v) => (v && v.length ? v : null)),
  seoDescription: z.string().trim().max(320).optional().transform((v) => (v && v.length ? v : null)),
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
      descriptionLong: formData.get('descriptionLong') ?? '',
      brandId: formData.get('brandId') ?? '',
      categoryId: formData.get('categoryId') ?? '',
      status: formData.get('status') ?? 'draft',
      seoTitle: formData.get('seoTitle') ?? '',
      seoDescription: formData.get('seoDescription') ?? '',
      locale: formData.get('locale') ?? 'en',
    })

    // SKU collision (other product with same SKU).
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
        descriptionLong: parsed.descriptionLong,
        brandId: parsed.brandId,
        categoryId: parsed.categoryId,
        status: parsed.status,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
      },
    })

    revalidatePath(`/${parsed.locale}/products/${parsed.id}/edit`)
    revalidatePath(`/${parsed.locale}/products`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── updateProductSeo (P1-3 — separate action so the SEO tab can't clobber Core) ─

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
      data: {
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
      },
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

const AddProductSpecSchema = z.object({
  productId: z.string().uuid(),
  group: z.string().trim().max(80).default('General'),
  label: z.string().trim().min(1, 'Label is required').max(120),
  value: z.string().trim().min(1, 'Value is required').max(500),
  unit: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  isFilterable: z.boolean().default(false),
  locale: Locale,
})

export async function addProductSpec(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const parsed = AddProductSpecSchema.parse({
      productId: formData.get('productId'),
      group: (formData.get('group') as string | null) || 'General',
      label: formData.get('label'),
      value: formData.get('value'),
      unit: formData.get('unit') ?? '',
      isFilterable: formData.get('isFilterable') === 'on',
      locale: formData.get('locale') ?? 'en',
    })

    const max = await db.productSpec.aggregate({
      where: { productId: parsed.productId },
      _max: { position: true },
    })

    await db.productSpec.create({
      data: {
        productId: parsed.productId,
        group: parsed.group,
        label: parsed.label,
        value: parsed.value,
        unit: parsed.unit,
        isFilterable: parsed.isFilterable,
        position: (max._max.position ?? 0) + 1,
      },
    })

    revalidatePath(`/${parsed.locale}/products/${parsed.productId}/edit`)
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

const AddCrossRefSchema = z.object({
  productId: z.string().uuid(),
  competitorBrand: z.string().trim().min(1).max(120),
  competitorMpn: z.string().trim().min(1).max(120),
  compatibility: Compatibility.default('direct'),
  locale: Locale,
})

export async function addProductCrossReference(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const parsed = AddCrossRefSchema.parse({
      productId: formData.get('productId'),
      competitorBrand: formData.get('competitorBrand'),
      competitorMpn: formData.get('competitorMpn'),
      compatibility: formData.get('compatibility') ?? 'direct',
      locale: formData.get('locale') ?? 'en',
    })

    await db.productCrossReference.create({
      data: {
        productId: parsed.productId,
        competitorBrand: parsed.competitorBrand,
        competitorMpn: parsed.competitorMpn,
        compatibility: parsed.compatibility,
      },
    })

    revalidatePath(`/${parsed.locale}/products/${parsed.productId}/edit`)
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
