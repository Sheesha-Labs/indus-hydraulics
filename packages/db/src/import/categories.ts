import type { Prisma, PrismaClient } from '@prisma/client'
import type { CategoryPayload } from './types'

type Tx = PrismaClient | Prisma.TransactionClient

export type CategoryUpsertResult = {
  id: string
  slug: string
  outcome: 'created' | 'updated'
}

/**
 * Topologically sort categories so parents are upserted before their children.
 * Returns the same items in dependency order. Throws on cycles.
 */
export function topoSortCategories(items: CategoryPayload[]): CategoryPayload[] {
  const bySlug = new Map(items.map((c) => [c.slug, c]))
  const visited = new Set<string>()
  const result: CategoryPayload[] = []
  const visiting = new Set<string>()

  function visit(slug: string) {
    if (visited.has(slug)) return
    if (visiting.has(slug)) {
      throw new Error(`Cycle in categories[].parentSlug at "${slug}"`)
    }
    const node = bySlug.get(slug)
    if (!node) return // parent isn't in this batch — assume it exists in DB
    visiting.add(slug)
    if (node.parentSlug) visit(node.parentSlug)
    visiting.delete(slug)
    visited.add(slug)
    result.push(node)
  }

  for (const item of items) visit(item.slug)
  return result
}

/**
 * Upsert a Category by slug. `parentSlug` (if set) must already exist —
 * either upserted earlier in the same batch or pre-existing in the DB.
 *
 * `defaultSpecTemplateSlug` is wired via a SECOND pass (after spec templates
 * are upserted) — see `wireDefaultSpecTemplates` below.
 */
export async function upsertCategory(
  payload: CategoryPayload,
  tx: Tx,
): Promise<CategoryUpsertResult> {
  let parentId: string | null = null
  if (payload.parentSlug) {
    const parent = await tx.category.findUnique({
      where: { slug: payload.parentSlug },
      select: { id: true },
    })
    if (!parent) {
      throw new Error(
        `Category "${payload.slug}" references unknown parentSlug "${payload.parentSlug}"`,
      )
    }
    parentId = parent.id
  }

  const existing = await tx.category.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  })

  const data = {
    name: payload.name,
    parentId,
    shortDescription: payload.shortDescription ?? null,
    position: payload.position,
    isPublished: payload.isPublished,
    seoTitle: payload.seoTitle ?? null,
    seoDescription: payload.seoDescription ?? null,
  }

  if (existing) {
    const updated = await tx.category.update({
      where: { id: existing.id },
      data,
      select: { id: true, slug: true },
    })
    return { id: updated.id, slug: updated.slug, outcome: 'updated' }
  }

  const created = await tx.category.create({
    data: { slug: payload.slug, ...data },
    select: { id: true, slug: true },
  })
  return { id: created.id, slug: created.slug, outcome: 'created' }
}

/**
 * Second pass — wire each category's `defaultSpecTemplateId` once spec
 * templates are upserted. Called from the CLI orchestrator after both
 * categories[] and specTemplates[] are processed.
 */
export async function wireDefaultSpecTemplates(
  payloads: CategoryPayload[],
  tx: Tx,
): Promise<void> {
  for (const cat of payloads) {
    if (!cat.defaultSpecTemplateSlug) continue
    const tpl = await tx.specTemplate.findUnique({
      where: { slug: cat.defaultSpecTemplateSlug },
      select: { id: true },
    })
    if (!tpl) {
      throw new Error(
        `Category "${cat.slug}" references unknown defaultSpecTemplateSlug "${cat.defaultSpecTemplateSlug}"`,
      )
    }
    await tx.category.update({
      where: { slug: cat.slug },
      data: { defaultSpecTemplateId: tpl.id },
    })
  }
}
