'use server'

import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { revalidatePath } from 'next/cache'
import { invalidateStoreSettings } from '../../../../lib/cache-tags'
import { STORAGE_BUCKETS, uploadToStorage } from '../../../../lib/supabase-admin'
import { DEFAULT_LOGO_STYLE, LOGO_STYLES } from '../../../../lib/brand-identity'

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

/**
 * A Media id from the brand picker, or null for "cleared".
 *
 * The picker emits `''` for an empty slot and a uuid otherwise, so the empty
 * string has to survive validation and become null rather than failing the
 * uuid check — clearing a logo is a legitimate save, not a malformed one.
 */
const optionalMediaId = z
  .string()
  .trim()
  .max(64)
  .optional()
  .transform((v) => (v && v.length ? v : null))
  .refine(
    (v) => v === null || /^[0-9a-f-]{36}$/i.test(v),
    'Pick an image from the library rather than typing an id.',
  )

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

  // Bank details (PDF footer)
  bankAccountName: optionalString(120),
  bankAccountNo: optionalString(40),
  bankName: optionalString(120),
  bankBranch: optionalString(120),
  bankIban: optionalString(40),
  bankSwift: optionalString(20),
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

      bankAccountName: formData.get('bankAccountName') ?? '',
      bankAccountNo: formData.get('bankAccountNo') ?? '',
      bankName: formData.get('bankName') ?? '',
      bankBranch: formData.get('bankBranch') ?? '',
      bankIban: formData.get('bankIban') ?? '',
      bankSwift: formData.get('bankSwift') ?? '',
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

    revalidatePath('/admin/settings')
    invalidateStoreSettings()
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

    revalidatePath('/admin/settings')
    invalidateStoreSettings()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ─── Brand & identity ───────────────────────────────────────────────────────

/**
 * The four brand images and the header placement switch.
 *
 * Its own action rather than more fields on `saveStoreSettings`: that form is
 * ~30 text inputs across store/legal/quote/bank concerns, and re-posting all
 * of them to change a logo means any unrelated validation error there blocks
 * a logo change here. Each field is a Media id (or empty string to clear),
 * matching the `logoMediaId` FK the schema has always used — a URL column
 * would leave the media library unable to tell that the file is in use.
 */
const BrandIdentitySchema = z.object({
  logoMediaId: optionalMediaId,
  logoStyle: z.enum(LOGO_STYLES).default(DEFAULT_LOGO_STYLE),
  footerLogoMediaId: optionalMediaId,
  faviconMediaId: optionalMediaId,
  searchLogoMediaId: optionalMediaId,
})

export async function saveBrandIdentity(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.SETTINGS_WRITE)
    const parsed = BrandIdentitySchema.parse({
      logoMediaId: formData.get('logoMediaId') ?? '',
      logoStyle: formData.get('logoStyle') || DEFAULT_LOGO_STYLE,
      footerLogoMediaId: formData.get('footerLogoMediaId') ?? '',
      faviconMediaId: formData.get('faviconMediaId') ?? '',
      searchLogoMediaId: formData.get('searchLogoMediaId') ?? '',
    })

    // A stale id — the operator picked an image and someone deleted it from the
    // library before they saved — would otherwise surface as a raw Prisma
    // foreign-key error. Check first and name the field instead.
    const ids = [
      parsed.logoMediaId,
      parsed.footerLogoMediaId,
      parsed.faviconMediaId,
      parsed.searchLogoMediaId,
    ].filter((v): v is string => v !== null)
    if (ids.length > 0) {
      const found = await db.media.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
      const known = new Set(found.map((m) => m.id))
      const missing = ids.filter((id) => !known.has(id))
      if (missing.length > 0) {
        return fail(
          'NOT_FOUND',
          'One of the selected images is no longer in the media library. Re-pick it and save again.',
        )
      }
    }

    const existing = await db.storeSettings.findFirst({ select: { id: true } })
    if (existing) {
      await db.storeSettings.update({ where: { id: existing.id }, data: parsed })
    } else {
      await db.storeSettings.create({ data: parsed })
    }

    revalidatePath('/admin/settings')
    // Header, footer, favicon links and the Organization JSON-LD all read the
    // cached settings. Without this purge an operator sees no change for up to
    // five minutes and re-uploads, thinking the first attempt failed.
    invalidateStoreSettings()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

/**
 * Uploads a brand image and returns the Media row the picker should select.
 *
 * Separate from the product-image action because brand art lands in its own
 * `brand/` prefix and is deliberately small — these files are drawn at 16–44px
 * and are already trimmed client-side before they get here, so the ceiling is
 * well under the 5 MB a product photo gets.
 */
export async function uploadBrandImage(
  formData: FormData,
): Promise<Result<{ mediaId: string; url: string; filename: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.SETTINGS_WRITE)
    const file = formData.get('file')
    if (!(file instanceof File)) return fail('VALIDATION', 'No file provided')
    if (!file.type.startsWith('image/')) return fail('VALIDATION', 'Only image uploads are allowed')
    // SVG is rejected on purpose: it can carry script, and these files are
    // served from a public bucket straight into <img> and <link rel="icon">.
    if (file.type === 'image/svg+xml')
      return fail('VALIDATION', 'SVG is not accepted — upload a PNG, WebP or AVIF.')
    if (file.size > 2_000_000) return fail('VALIDATION', 'Brand image must be under 2 MB')

    const { storagePath, bytes, mimeType } = await uploadToStorage(
      STORAGE_BUCKETS.images,
      file,
      'brand',
    )
    const media = await db.media.create({
      data: {
        kind: 'image',
        mimeType,
        originalFilename: file.name,
        storagePath,
        bytes,
        uploadedById: session.user.id,
      },
      select: { id: true, storagePath: true, originalFilename: true },
    })
    return ok({ mediaId: media.id, url: media.storagePath, filename: media.originalFilename })
  } catch (err) {
    return failFromError(err)
  }
}
