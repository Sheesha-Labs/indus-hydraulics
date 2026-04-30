'use server'

import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../lib/result'
import { revalidatePath } from 'next/cache'

const SeoSettingsSchema = z.object({
  defaultMetaTitleTemplate: z.string().trim().max(180).optional().transform((v) => v ?? null),
  defaultMetaDescription: z.string().trim().max(320).optional().transform((v) => v ?? null),
  robotsTxt: z.string().trim().max(8000).optional().transform((v) => v ?? null),
})

export async function saveSeoSettings(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = SeoSettingsSchema.parse({
      defaultMetaTitleTemplate: formData.get('defaultMetaTitleTemplate') ?? '',
      defaultMetaDescription: formData.get('defaultMetaDescription') ?? '',
      robotsTxt: formData.get('robotsTxt') ?? '',
    })

    const existing = await db.seoSetting.findFirst()
    if (existing) {
      await db.seoSetting.update({ where: { id: existing.id }, data: parsed })
    } else {
      await db.seoSetting.create({ data: parsed })
    }

    revalidatePath('/seo')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const RedirectSchema = z.object({
  fromPath: z.string().trim().min(1, 'From path is required').max(500).regex(/^\//, 'From path must start with "/"'),
  toPath: z.string().trim().min(1, 'To path is required').max(500),
  statusCode: z.coerce.number().int().refine((n) => n === 301 || n === 302 || n === 307 || n === 308, {
    message: 'Status must be 301, 302, 307, or 308',
  }).default(301),
})

export async function addRedirect(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = RedirectSchema.parse({
      fromPath: formData.get('fromPath'),
      toPath: formData.get('toPath'),
      statusCode: formData.get('statusCode') ?? 301,
    })

    await db.redirect.upsert({
      where: { fromPath: parsed.fromPath },
      update: { toPath: parsed.toPath, statusCode: parsed.statusCode },
      create: parsed,
    })

    revalidatePath('/seo')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteRedirect(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)
    await db.redirect.delete({ where: { id } })
    revalidatePath('/seo')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
