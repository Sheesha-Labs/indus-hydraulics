'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../../lib/result'

/**
 * SearchBoost rows multiply a product's `ts_rank_cd` score at search
 * time. Values >1 lift, <1 (but >0) bury, 0 effectively hides. Optional
 * `expiresAt` lets admins schedule a temporary lift (e.g. a new
 * product launch) without remembering to clean it up.
 *
 * Today the storefront only joins boosts for `entityType = 'product'`,
 * so the admin form fixes that — the schema does support category /
 * brand boosts and a follow-up commit can extend the join.
 */

const BoostSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  boost: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n >= 0 && n <= 10, 'Boost must be between 0 and 10'),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      if (!v) return null
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? null : d
    }),
})

export async function upsertSearchBoost(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    const parsed = BoostSchema.parse({
      sku: formData.get('sku'),
      boost: formData.get('boost') ?? '1',
      expiresAt: formData.get('expiresAt') ?? '',
    })
    const product = await db.product.findUnique({
      where: { sku: parsed.sku },
      select: { id: true },
    })
    if (!product) {
      return failFromError(new Error(`No active product with SKU "${parsed.sku}"`))
    }
    await db.searchBoost.upsert({
      where: { entityType_entityId: { entityType: 'product', entityId: product.id } },
      update: { boost: parsed.boost, expiresAt: parsed.expiresAt },
      create: {
        entityType: 'product',
        entityId: product.id,
        boost: parsed.boost,
        expiresAt: parsed.expiresAt,
      },
    })
    revalidatePath('/seo/search/boosts')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteSearchBoost(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().uuid().parse(id)
    await db.searchBoost.delete({ where: { id } })
    revalidatePath('/seo/search/boosts')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
