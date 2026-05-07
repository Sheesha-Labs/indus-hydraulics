import type { Prisma, PrismaClient } from '@prisma/client'
import type { BrandPayload } from './types'

type Tx = PrismaClient | Prisma.TransactionClient

export type BrandUpsertResult = {
  id: string
  slug: string
  outcome: 'created' | 'updated'
}

/**
 * Upsert a Brand by slug. Idempotent: re-runs update fields without inserting
 * a duplicate.
 *
 * Note: leaves logo/hero media untouched. Image upload is a separate, user-
 * driven step (`/admin/brands/[id]/edit` SEO tab + the list-page modal for
 * core fields). The PR body documents this for editors.
 */
export async function upsertBrand(
  payload: BrandPayload,
  tx: Tx,
): Promise<BrandUpsertResult> {
  const existing = await tx.brand.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  })

  const data = {
    name: payload.name,
    country: payload.country ?? null,
    description: payload.description ?? null,
    isAuthorizedDistributor: payload.isAuthorizedDistributor,
    isPublished: payload.isPublished,
    seoTitle: payload.seoTitle ?? null,
    seoDescription: payload.seoDescription ?? null,
  }

  if (existing) {
    const updated = await tx.brand.update({
      where: { id: existing.id },
      data,
      select: { id: true, slug: true },
    })
    return { id: updated.id, slug: updated.slug, outcome: 'updated' }
  }

  const created = await tx.brand.create({
    data: { slug: payload.slug, ...data },
    select: { id: true, slug: true },
  })
  return { id: created.id, slug: created.slug, outcome: 'created' }
}
