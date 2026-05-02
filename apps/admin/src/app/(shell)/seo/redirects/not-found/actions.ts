'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../../lib/result'
import { withSeoAudit } from '../../../../../lib/seo-audit'

const ResolveSchema = z.object({
  notFoundId: z.string().uuid(),
  toPath: z.string().trim().min(1).max(500),
  statusCode: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => n === 301 || n === 302 || n === 307 || n === 308, 'Status must be 301/302/307/308'),
})

/**
 * One-click "Add redirect" from a 404 row. Reads the NotFoundLog entry,
 * upserts a Redirect row pointing at the chosen target, marks the 404
 * row resolved (so it disappears from the unresolved list).
 */
export async function resolveNotFoundWithRedirect(
  formData: FormData,
): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    const parsed = ResolveSchema.parse({
      notFoundId: formData.get('notFoundId'),
      toPath: formData.get('toPath'),
      statusCode: formData.get('statusCode') ?? 301,
    })

    const nf = await db.notFoundLog.findUnique({ where: { id: parsed.notFoundId } })
    if (!nf) return failFromError(new Error('Not-found row no longer exists'))
    if (!nf.path.startsWith('/')) {
      return failFromError(new Error(`404 path "${nf.path}" is not a relative URL — refusing to redirect`))
    }

    await withSeoAudit(
      {
        entityType: 'redirect',
        entityId: null,
        before: { fromPath: null, toPath: null, statusCode: null },
        after: {
          fromPath: nf.path,
          toPath: parsed.toPath,
          statusCode: parsed.statusCode,
        },
        actorId: session.user.id,
        reason: '404_resolved',
      },
      async (tx) => {
        const r = await tx.redirect.upsert({
          where: { fromPath: nf.path },
          update: {
            toPath: parsed.toPath,
            statusCode: parsed.statusCode,
            isActive: true,
          },
          create: {
            fromPath: nf.path,
            toPath: parsed.toPath,
            statusCode: parsed.statusCode,
            isActive: true,
            createdById: session.user.id,
            notes: `Auto-created from 404 (${nf.hits} hits)`,
          },
        })
        await tx.notFoundLog.update({
          where: { id: nf.id },
          data: { resolvedRedirectId: r.id },
        })
      },
    )

    revalidatePath('/seo/redirects/not-found')
    revalidatePath('/seo/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function ignoreNotFound(notFoundId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)
    z.string().uuid().parse(notFoundId)
    // Soft-ignore: mark with a sentinel resolvedRedirectId so it stays
    // out of the active list but the row remains for analytics.
    await db.notFoundLog.update({
      where: { id: notFoundId },
      data: { resolvedRedirectId: 'ignored' },
    })
    revalidatePath('/seo/redirects/not-found')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
