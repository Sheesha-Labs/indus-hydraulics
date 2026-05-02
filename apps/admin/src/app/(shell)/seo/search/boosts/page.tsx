import type { Metadata } from 'next'
import { db } from '@indus/db'
import BoostsClient from './BoostsClient'

export const metadata: Metadata = { title: 'Search boosts — Indus Admin' }

export default async function BoostsPage() {
  const boosts = await db.searchBoost.findMany({
    where: { entityType: 'product' },
    orderBy: { boost: 'desc' },
  })

  // Resolve the entity ids to product SKUs / titles for display. We don't
  // declare a Prisma relation between SearchBoost and Product (entity is
  // polymorphic by entityType), so a separate lookup is the cleanest way.
  const productIds = boosts.map((b) => b.entityId)
  const products = productIds.length
    ? await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sku: true, title: true },
      })
    : []
  const productById = new Map(products.map((p) => [p.id, p]))

  return (
    <BoostsClient
      rows={boosts.map((b) => ({
        id: b.id,
        sku: productById.get(b.entityId)?.sku ?? '(deleted)',
        title: productById.get(b.entityId)?.title ?? '(deleted)',
        boost: b.boost,
        expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
      }))}
    />
  )
}
