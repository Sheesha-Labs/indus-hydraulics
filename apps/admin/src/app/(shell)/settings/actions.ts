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

const optionalEmail = z
  .string()
  .trim()
  .email()
  .or(z.literal(''))
  .transform((v) => (v ? v : null))

const linesToArray = (raw: FormDataEntryValue | null): string[] =>
  ((raw as string | null) ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

const StoreSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required').max(120),
  supportEmail: optionalEmail,
  defaultIncoterm: z.string().trim().max(40).optional().transform((v) => (v && v.length ? v : null)),
  defaultPaymentTerms: z.coerce.number().int().min(0).max(365).default(30),

  // Brand identity (storefront header + footer)
  tagline: optionalString(280),
  certificationLine: optionalString(120),

  // Public contact info
  contactPhone: optionalString(40),
  contactEmail: optionalEmail,
  contactHours: optionalString(120),
  contactLocationLabel: optionalString(80),

  // Legal entity (rendered on every quote PDF + email footer)
  legalName: optionalString(160),
  vatTrn: optionalString(40),
  registeredAddressLines: z.array(z.string().trim().max(200)).max(8).default([]),
  registeredCountryCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(2)
    .optional()
    .transform((v) => (v && v.length === 2 ? v : null)),
  defaultVatRatePct: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? v : null)),

  // Quote signature block
  signatureName: optionalString(120),
  signatureTitle: optionalString(120),
  signaturePhone: optionalString(40),
  signatureEmail: optionalEmail,

  // Outbound email
  quoteFromEmail: optionalEmail,
  quoteFromName: optionalString(120),
  internalAlertEmails: z.array(z.string().trim().email()).max(20).default([]),

  // Quote defaults
  defaultQuoteValidityDays: z.coerce.number().int().min(1).max(365).default(30),
  defaultQuoteNotes: optionalString(2000),
  defaultQuoteTerms: optionalString(4000),
  defaultQuoteDisclaimer: optionalString(2000),
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

      legalName: formData.get('legalName') ?? '',
      vatTrn: formData.get('vatTrn') ?? '',
      registeredAddressLines: linesToArray(formData.get('registeredAddressLines')),
      registeredCountryCode: formData.get('registeredCountryCode') ?? '',
      defaultVatRatePct: formData.get('defaultVatRatePct') ?? '',

      signatureName: formData.get('signatureName') ?? '',
      signatureTitle: formData.get('signatureTitle') ?? '',
      signaturePhone: formData.get('signaturePhone') ?? '',
      signatureEmail: formData.get('signatureEmail') ?? '',

      quoteFromEmail: formData.get('quoteFromEmail') ?? '',
      quoteFromName: formData.get('quoteFromName') ?? '',
      internalAlertEmails: linesToArray(formData.get('internalAlertEmails')),

      defaultQuoteValidityDays: formData.get('defaultQuoteValidityDays') ?? 30,
      defaultQuoteNotes: formData.get('defaultQuoteNotes') ?? '',
      defaultQuoteTerms: formData.get('defaultQuoteTerms') ?? '',
      defaultQuoteDisclaimer: formData.get('defaultQuoteDisclaimer') ?? '',
    })

    // Json columns need raw arrays, not Zod-typed unions. Cast after validation.
    const data: Parameters<typeof db.storeSettings.create>[0]['data'] = {
      ...parsed,
      registeredAddressLines: parsed.registeredAddressLines,
      internalAlertEmails: parsed.internalAlertEmails,
    }

    const existing = await db.storeSettings.findFirst()
    if (existing) {
      await db.storeSettings.update({ where: { id: existing.id }, data })
    } else {
      await db.storeSettings.create({ data })
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
