'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'

import { auth } from '../../../../lib/admin-auth'
import { invalidateMediaConsumers } from '../../../../lib/cache-tags'
import { ok, failFromError, type Result } from '../../../../lib/result'
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
