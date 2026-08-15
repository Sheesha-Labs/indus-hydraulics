import { db } from '@indus/db'
import { DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO } from '@indus/domain'

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

// App-sent mail goes FROM the website domain (isolated sending reputation)
// and REPLIES TO the Workspace domain (real, monitored inbox). See
// @indus/domain/email-domains for why the two are split.
const FALLBACK_FROM_EMAIL = DEFAULT_FROM_EMAIL
const FALLBACK_REPLY_TO = DEFAULT_REPLY_TO
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
    // NOT the from address. The sending domain has no MX, so replying to it
    // is a black hole. Replies go to the contact inbox on the Workspace
    // domain, which is where the sales team actually reads mail.
    replyTo: settings?.contactEmail ?? FALLBACK_REPLY_TO,
    internalAlertEmails: internal,
  }
}
