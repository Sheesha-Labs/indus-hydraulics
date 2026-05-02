'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../../lib/result'

/**
 * SearchRedirect lets admins map a normalised query string to a target
 * URL — e.g. searching "hose fitting" sends the user straight to
 * /c/hose-fittings instead of the noisy results page. The storefront's
 * `runSearch` short-circuits with a 302 when a match is found.
 */

const RedirectSchema = z.object({
  query: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Query is required')
    .max(200, 'Query is too long'),
  targetUrl: z.string().trim().min(1, 'Target URL is required').max(2048),
})

export async function upsertSearchRedirect(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    const parsed = RedirectSchema.parse({
      query: formData.get('query'),
      targetUrl: formData.get('targetUrl'),
    })
    await db.searchRedirect.upsert({
      where: { query: parsed.query },
      update: { targetUrl: parsed.targetUrl, isActive: true },
      create: { query: parsed.query, targetUrl: parsed.targetUrl, isActive: true },
    })
    revalidatePath('/seo/search/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteSearchRedirect(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().uuid().parse(id)
    await db.searchRedirect.delete({ where: { id } })
    revalidatePath('/seo/search/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function toggleSearchRedirect(id: string, isActive: boolean): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().uuid().parse(id)
    z.boolean().parse(isActive)
    await db.searchRedirect.update({ where: { id }, data: { isActive } })
    revalidatePath('/seo/search/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
