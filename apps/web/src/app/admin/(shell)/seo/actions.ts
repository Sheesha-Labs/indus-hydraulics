'use server'

import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../lib/result'
import { withSeoAudit } from '../../../../lib/seo-audit'
import { revalidatePath } from 'next/cache'

const SeoSettingsSchema = z.object({
  defaultMetaTitleTemplate: z.string().trim().max(180).optional().transform((v) => v ?? null),
  defaultMetaDescription: z.string().trim().max(320).optional().transform((v) => v ?? null),
  robotsTxt: z.string().trim().max(8000).optional().transform((v) => v ?? null),
})

export async function saveSeoSettings(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = SeoSettingsSchema.parse({
      defaultMetaTitleTemplate: formData.get('defaultMetaTitleTemplate') ?? '',
      defaultMetaDescription: formData.get('defaultMetaDescription') ?? '',
      robotsTxt: formData.get('robotsTxt') ?? '',
    })

    const existing = await db.seoSetting.findFirst()
    const before = existing
      ? {
          defaultMetaTitleTemplate: existing.defaultMetaTitleTemplate,
          defaultMetaDescription: existing.defaultMetaDescription,
          robotsTxt: existing.robotsTxt,
        }
      : { defaultMetaTitleTemplate: null, defaultMetaDescription: null, robotsTxt: null }

    // robots.txt edits are an infrastructure-grade change — record the
    // entity type accordingly so the audit log distinguishes them.
    const entityType =
      before.robotsTxt !== parsed.robotsTxt ? 'global:robots' : 'global:seo_setting'

    await withSeoAudit(
      {
        entityType,
        entityId: existing?.id ?? null,
        before,
        after: parsed,
        actorId: session.user.id,
      },
      async (tx) => {
        if (existing) {
          await tx.seoSetting.update({ where: { id: existing.id }, data: parsed })
        } else {
          await tx.seoSetting.create({ data: parsed })
        }
      },
    )

    revalidatePath('/admin/seo')
    revalidatePath('/admin/seo/settings')
    revalidatePath('/admin/seo/robots')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const RedirectSchema = z.object({
  fromPath: z
    .string()
    .trim()
    .min(1, 'From path is required')
    .max(500)
    .regex(/^\//, 'From path must start with "/"'),
  toPath: z.string().trim().min(1, 'To path is required').max(500),
  statusCode: z
    .coerce.number()
    .int()
    .refine((n) => n === 301 || n === 302 || n === 307 || n === 308, {
      message: 'Status must be 301, 302, 307, or 308',
    })
    .default(301),
})

export async function addRedirect(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = RedirectSchema.parse({
      fromPath: formData.get('fromPath'),
      toPath: formData.get('toPath'),
      statusCode: formData.get('statusCode') ?? 301,
    })

    const existing = await db.redirect.findUnique({ where: { fromPath: parsed.fromPath } })
    const before = existing
      ? {
          fromPath: existing.fromPath,
          toPath: existing.toPath,
          statusCode: existing.statusCode,
        }
      : { fromPath: null, toPath: null, statusCode: null }
    const after = {
      fromPath: parsed.fromPath,
      toPath: parsed.toPath,
      statusCode: parsed.statusCode,
    }

    await withSeoAudit(
      {
        entityType: 'redirect',
        entityId: existing?.id ?? null,
        before,
        after,
        actorId: session.user.id,
      },
      async (tx) => {
        await tx.redirect.upsert({
          where: { fromPath: parsed.fromPath },
          update: { toPath: parsed.toPath, statusCode: parsed.statusCode },
          create: parsed,
        })
      },
    )

    revalidatePath('/admin/seo')
    revalidatePath('/admin/seo/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteRedirect(id: string): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)

    const existing = await db.redirect.findUnique({ where: { id } })
    if (!existing) {
      // Idempotent: no row, no audit, no error.
      return ok(undefined)
    }

    await withSeoAudit(
      {
        entityType: 'redirect',
        entityId: id,
        before: {
          fromPath: existing.fromPath,
          toPath: existing.toPath,
          statusCode: existing.statusCode,
        },
        after: { fromPath: null, toPath: null, statusCode: null },
        actorId: session.user.id,
        reason: 'deleted',
      },
      async (tx) => {
        await tx.redirect.delete({ where: { id } })
      },
    )

    revalidatePath('/admin/seo')
    revalidatePath('/admin/seo/redirects')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
