'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../../lib/result'

/**
 * Synonyms are organised into named groups. Every term in a group is
 * bidirectionally interchangeable when expanding a query — see
 * `expandSynonyms` in `packages/domain/src/seo/search-query.ts`.
 *
 * The CRUD surface is intentionally group-level: admins type a list of
 * terms separated by newlines or commas; we replace the whole group's
 * member rows on save.
 */

const GroupSchema = z.object({
  group: z
    .string()
    .trim()
    .min(1, 'Group name is required')
    .max(80, 'Group name is too long')
    .regex(/^[a-z0-9_-]+$/i, 'Group name must be alphanumeric / dash / underscore'),
  terms: z.string().trim().max(2000),
})

/**
 * Upsert a synonym group. The `terms` field is split on commas + newlines,
 * trimmed, deduped, lowercased. Existing rows for the group are replaced
 * with the new set in one transaction so the storefront never sees a
 * partial state.
 */
export async function upsertSynonymGroup(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    const parsed = GroupSchema.parse({
      group: formData.get('group'),
      terms: formData.get('terms') ?? '',
    })
    const terms = Array.from(
      new Set(
        parsed.terms
          .split(/[,\n]/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= 80),
      ),
    )
    if (terms.length === 0) {
      return failFromError(new Error('At least one term is required'))
    }

    await db.$transaction(async (tx) => {
      await tx.searchSynonym.deleteMany({ where: { group: parsed.group } })
      await tx.searchSynonym.createMany({
        data: terms.map((term) => ({ group: parsed.group, term, isActive: true })),
        skipDuplicates: true,
      })
    })

    revalidatePath('/seo/search/synonyms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteSynonymGroup(group: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().min(1).max(80).parse(group)
    await db.searchSynonym.deleteMany({ where: { group } })
    revalidatePath('/seo/search/synonyms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function toggleSynonymGroup(group: string, isActive: boolean): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().min(1).max(80).parse(group)
    z.boolean().parse(isActive)
    await db.searchSynonym.updateMany({
      where: { group },
      data: { isActive },
    })
    revalidatePath('/seo/search/synonyms')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
