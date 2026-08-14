import { db } from '@indus/db'
import { DEFAULT_FROM_EMAIL } from '@indus/domain'

export type EmailBranding = {
  legalName: string
  vatTrn: string | null
  registeredAddressLines: string[]
  signatureName: string | null
  signatureTitle: string | null
  signaturePhone: string | null
  signatureEmail: string | null
  fromEmail: string
  fromName: string | null
  replyTo: string | null
  internalAlertEmails: string[]
}

// Transactional mail must be replyable, so it sends from the domain that
// actually has mailboxes. See @indus/domain/email-domains.
const FALLBACK_FROM_EMAIL = DEFAULT_FROM_EMAIL
const FALLBACK_LEGAL_NAME = 'Indus Hydraulic Power Trading LLC'

/**
 * Load branding/sender data from StoreSettings for transactional email.
 * Falls back to documented production values if settings haven't been
 * filled in yet — this keeps emails sending in dev/staging.
 */
export async function loadEmailBranding(): Promise<EmailBranding> {
  const settings = await db.storeSettings.findFirst()

  const addr = (settings?.registeredAddressLines as string[] | null) ?? []
  const internal = (settings?.internalAlertEmails as string[] | null) ?? []

  return {
    legalName: settings?.legalName ?? FALLBACK_LEGAL_NAME,
    vatTrn: settings?.vatTrn ?? null,
    registeredAddressLines: addr,
    signatureName: settings?.signatureName ?? null,
    signatureTitle: settings?.signatureTitle ?? null,
    signaturePhone: settings?.signaturePhone ?? null,
    signatureEmail: settings?.signatureEmail ?? null,
    fromEmail: settings?.quoteFromEmail ?? FALLBACK_FROM_EMAIL,
    fromName: settings?.quoteFromName ?? null,
    replyTo: settings?.quoteFromEmail ?? FALLBACK_FROM_EMAIL,
    internalAlertEmails: internal,
  }
}
