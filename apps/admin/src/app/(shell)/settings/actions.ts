'use server'

import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../lib/auth'
import { ROLES, requireRole } from '../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../lib/result'
import { revalidatePath } from 'next/cache'

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length ? v : null))

const StoreSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required').max(120),
  supportEmail: z.string().trim().email().or(z.literal('')).transform((v) => (v ? v : null)),
  defaultIncoterm: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  defaultPaymentTerms: z.coerce.number().int().min(0).max(365).default(30),

  // Brand identity (storefront header + footer)
  tagline: optionalString(280),
  certificationLine: optionalString(120),

  // Public contact info
  contactPhone: optionalString(40),
  contactEmail: z
    .string()
    .trim()
    .email()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  contactHours: optionalString(120),
  contactLocationLabel: optionalString(80),
})

export async function saveStoreSettings(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SETTINGS_WRITE)
    const parsed = StoreSettingsSchema.parse({
      name: formData.get('name'),
      supportEmail: formData.get('supportEmail') ?? '',
      defaultIncoterm: formData.get('defaultIncoterm') ?? '',
      defaultPaymentTerms: formData.get('defaultPaymentTerms') ?? 30,
      tagline: formData.get('tagline') ?? '',
      certificationLine: formData.get('certificationLine') ?? '',
      contactPhone: formData.get('contactPhone') ?? '',
      contactEmail: formData.get('contactEmail') ?? '',
      contactHours: formData.get('contactHours') ?? '',
      contactLocationLabel: formData.get('contactLocationLabel') ?? '',
    })

    const existing = await db.storeSettings.findFirst()
    if (existing) {
      await db.storeSettings.update({ where: { id: existing.id }, data: parsed })
    } else {
      await db.storeSettings.create({ data: parsed })
    }

    revalidatePath('/settings')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const EmailTemplateSchema = z.object({
  kind: z.string().trim().min(1).max(64),
  subject: z.string().trim().min(1, 'Subject is required').max(240),
  bodyHtml: z.string().trim().min(1, 'Body is required').max(50000),
})

export async function saveEmailTemplate(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SETTINGS_WRITE)
    const parsed = EmailTemplateSchema.parse({
      kind: formData.get('kind'),
      subject: formData.get('subject'),
      bodyHtml: formData.get('bodyHtml'),
    })

    await db.emailTemplate.upsert({
      where: { kind: parsed.kind },
      update: { subject: parsed.subject, bodyHtml: parsed.bodyHtml },
      create: parsed,
    })

    revalidatePath('/settings')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
