import { db } from '@indus/db'
import { resolveFromEmail, resolveReplyTo } from '@indus/domain'

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

// App-sent mail goes FROM the website domain (isolated sending reputation,
// and the only domain verified in Resend) and REPLIES TO the Workspace domain
// (real, monitored inbox). resolveFromEmail / resolveReplyTo in
// @indus/domain/email-domains enforce both halves against whatever the admin
// console has been set to.
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
    // resolveFromEmail, not `??`: a configured-but-unverified sender is worse
    // than no configured sender, because Resend rejects the send outright.
    fromEmail: resolveFromEmail(settings?.quoteFromEmail),
    fromName: settings?.quoteFromName ?? null,
    // NOT the from address. The sending domain has no MX, so replying to it
    // is a black hole. Replies go to the contact inbox on the Workspace
    // domain, which is where the sales team actually reads mail.
    replyTo: resolveReplyTo(settings?.contactEmail),
    internalAlertEmails: internal,
  }
}
