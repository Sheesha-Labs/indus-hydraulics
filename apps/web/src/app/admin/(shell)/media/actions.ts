'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { canRemoveStorageObject, canTrash, deriveMediaState } from '@indus/domain'

import { auth } from '../../../../lib/admin-auth'
import { invalidateMediaConsumers } from '../../../../lib/cache-tags'
import { buildMediaUsageIndexFromDb } from '../../../../lib/queries/media-usage'
import { removeFromStorageStrict } from '../../../../lib/supabase-admin'
import { fail, ok, failFromError, type Result } from '../../../../lib/result'
import { ROLES, requireRole } from '../../../../lib/rbac'

/**
 * Media library mutations.
 *
 * Only metadata for now — trashing, restoring and permanent delete land in
 * phase 7, where they need the usage re-check that makes them safe.
 *
 * Note the file carries a top-level `'use server'`, so every export must be an
 * async function. A constant exported alongside these would typecheck, pass
 * lint, pass CI, and then 500 on first invocation; `use-server-exports.test.ts`
 * guards it. The Zod schema below is therefore module-private.
 */

const MetaSchema = z.object({
  id: z.string().uuid(),
  /**
   * Alt text is a live accessibility and SEO signal, not a label — an empty
   * string is meaningfully different from "decorative", so blank normalises to
   * null rather than to `''`. 300 chars is well past the ~125 screen readers
   * comfortably announce, and exists only to bound the column.
   */
  alt: z
    .string()
    .trim()
    .max(300, 'Keep alt text under 300 characters.')
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  caption: z
    .string()
    .trim()
    .max(500, 'Keep the caption under 500 characters.')
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export async function updateMediaMeta(
  input: z.input<typeof MetaSchema>
): Promise<Result<{ alt: string | null; caption: string | null }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const parsed = MetaSchema.parse(input)

    // `update` throws P2025 when the row is gone, which failFromError maps to
    // NOT_FOUND — the right answer if someone deleted the file in another tab.
    const updated = await db.media.update({
      where: { id: parsed.id },
      data: { alt: parsed.alt, caption: parsed.caption },
      select: { alt: true, caption: true },
    })

    revalidatePath('/admin/media')
    // Alt text renders on the public site wherever this file is used, so the
    // storefront caches holding it have to go too.
    invalidateMediaConsumers()

    return ok(updated)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Deletion ────────────────────────────────────────────────────────────────

/**
 * Re-checks that a file is safe to delete, server-side, immediately before
 * acting on it.
 *
 * The disabled button in the UI is a hint, not a guarantee. The page that
 * rendered it may be minutes old, and in that time someone else can have
 * attached the file to a product. Every destructive path re-resolves usage
 * from scratch rather than trusting what the client believed.
 *
 * Returns an operator-facing reason, or null when the file may be deleted.
 */
async function refuseIfInUse(assetId: string, storagePath: string): Promise<string | null> {
  const index = await buildMediaUsageIndexFromDb([{ id: assetId, storagePath }])
  if (index.partial) {
    return `Couldn't verify where this file is used (${index.failedSources.join(', ')} unavailable). Nothing was deleted.`
  }
  const usages = index.byAsset.get(assetId) ?? []
  const decision = canTrash({
    state: deriveMediaState(usages),
    indexPartial: index.partial,
    usages,
  })
  return decision.allowed ? null : decision.reason
}

const IdSchema = z.object({ id: z.string().uuid() })

/**
 * Soft delete. The storage object is left alone, so restoring costs nothing.
 */
export async function trashMedia(input: z.input<typeof IdSchema>): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { id } = IdSchema.parse(input)

    const asset = await db.media.findUnique({
      where: { id },
      select: { id: true, storagePath: true, deletedAt: true, originalFilename: true },
    })
    if (!asset) return fail('NOT_FOUND', 'That file no longer exists.')
    if (asset.deletedAt) return ok(undefined) // already trashed — idempotent

    const refusal = await refuseIfInUse(asset.id, asset.storagePath)
    if (refusal) return fail('PRECONDITION_FAILED', refusal)

    // The `deletedAt: null` guard makes this a no-op if another request trashed
    // it first, rather than silently moving the timestamp.
    await db.media.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date() } })

    revalidatePath('/admin/media')
    invalidateMediaConsumers()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

/** Restore from trash. No usage check — putting a file back breaks nothing. */
export async function restoreMedia(input: z.input<typeof IdSchema>): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { id } = IdSchema.parse(input)

    const updated = await db.media.updateMany({
      where: { id, deletedAt: { not: null } },
      data: { deletedAt: null },
    })
    if (updated.count === 0) return fail('NOT_FOUND', 'That file is not in the trash.')

    revalidatePath('/admin/media')
    invalidateMediaConsumers()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

/**
 * Permanent delete. Strictest tier, and the only irreversible action here.
 *
 * Three gates before anything is removed: the caller holds CATALOGUE_DELETE,
 * the file is already in the trash, and a fresh usage check says nothing
 * references it.
 *
 * Then the ordering that matters. `media.storagePath` is NOT unique — 227 of
 * 665 rows currently share one with another row — so the storage object is
 * only removed when no OTHER row still points at it. Deleting it regardless
 * would 404 every sibling row, including ones on live products. Bazar, which
 * this feature is modelled on, has storage_key UNIQUE and so never had to make
 * this check.
 */
export async function deleteMediaPermanently(
  input: z.input<typeof IdSchema>
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    const { id } = IdSchema.parse(input)

    const asset = await db.media.findUnique({
      where: { id },
      select: { id: true, storagePath: true, deletedAt: true, originalFilename: true },
    })
    if (!asset) return fail('NOT_FOUND', 'That file no longer exists.')
    if (!asset.deletedAt) {
      return fail('PRECONDITION_FAILED', 'Move it to the trash first.')
    }

    const refusal = await refuseIfInUse(asset.id, asset.storagePath)
    if (refusal) return fail('PRECONDITION_FAILED', refusal)

    const siblings = await db.media.count({
      where: { storagePath: asset.storagePath, id: { not: asset.id } },
    })

    if (canRemoveStorageObject({ otherRowsSharingPath: siblings })) {
      // Object first: a failure here aborts before the row is touched, so we
      // never end up with an object nothing references.
      const removal = await removeFromStorageStrict(asset.storagePath)
      if (!removal.ok) {
        return fail('INTERNAL', `The file could not be removed from storage: ${removal.message}`)
      }
    }

    try {
      await db.media.delete({ where: { id } })
    } catch (err) {
      // Four relations are required rather than optional (product images and
      // documents, RFQ attachments, homepage slides), so the database refuses
      // the delete even if the usage check somehow passed. That is the backstop
      // working, and it deserves a readable message rather than a Prisma code.
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2003') {
        return fail(
          'PRECONDITION_FAILED',
          'Something still references this file. Detach it and try again.'
        )
      }
      throw err
    }

    revalidatePath('/admin/media')
    invalidateMediaConsumers()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const BulkSchema = z.object({
  // Bounded so one request cannot walk the whole library. The UI selects a
  // page at a time, which is 48.
  ids: z.array(z.string().uuid()).min(1).max(200),
})

/**
 * Trash many files at once — the reason this exists is that the Unused filter
 * turns up 225 orphaned rows, and Bazar's answer to that pile is to click 225
 * times.
 *
 * Each file is still checked individually. A bulk action is a convenience for
 * the operator, never a shortcut past the guard, so anything that has become
 * used since the page rendered is skipped and reported rather than deleted.
 */
export async function bulkTrashMedia(
  input: z.input<typeof BulkSchema>
): Promise<Result<{ trashed: number; skipped: { filename: string; reason: string }[] }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    const { ids } = BulkSchema.parse(input)

    const assets = await db.media.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, storagePath: true, originalFilename: true },
    })

    // One index for the whole batch rather than one per file: resolving usage
    // is ~30 queries, and doing that 48 times would be 1,440.
    const index = await buildMediaUsageIndexFromDb(
      assets.map((a) => ({ id: a.id, storagePath: a.storagePath }))
    )
    if (index.partial) {
      return fail(
        'PRECONDITION_FAILED',
        `Couldn't verify where these files are used (${index.failedSources.join(', ')} unavailable). Nothing was deleted.`
      )
    }

    const safe: string[] = []
    const skipped: { filename: string; reason: string }[] = []
    for (const asset of assets) {
      const usages = index.byAsset.get(asset.id) ?? []
      const decision = canTrash({ state: deriveMediaState(usages), indexPartial: false, usages })
      if (decision.allowed) safe.push(asset.id)
      else skipped.push({ filename: asset.originalFilename, reason: decision.reason ?? 'In use' })
    }

    if (safe.length > 0) {
      await db.media.updateMany({
        where: { id: { in: safe }, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      revalidatePath('/admin/media')
      invalidateMediaConsumers()
    }

    return ok({ trashed: safe.length, skipped })
  } catch (err) {
    return failFromError(err)
  }
}
