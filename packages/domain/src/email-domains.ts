/**
 * The two email domains, and which is for what.
 *
 * ── Why there are two ───────────────────────────────────────────────────────
 *
 * `indushydraulics.com` is the WEBSITE. It has no MX records, so nothing sent
 * to an address on it can be delivered — every `…@indushydraulics.com` bounces.
 *
 * `indushydraulics.me` is where the company's mailboxes actually live (Google
 * Workspace). Anything a customer might reply to has to be on this domain.
 *
 * ── The split ───────────────────────────────────────────────────────────────
 *
 * TRANSACTIONAL (quotes, RFQ confirmations, password resets, expiry
 * reminders) and every address DISPLAYED on the site send from and point at
 * `.me`, because customers reply to them and those replies must land in a real
 * inbox.
 *
 * MARKETING / PROMOTIONAL / SEQUENCED campaigns send from `.com`, deliberately
 * kept apart. Bulk sending is what damages a domain's sending reputation, and
 * a damaged reputation on `.me` would start pushing quotes and password resets
 * into spam. Separating them means a bad campaign can only cost you campaign
 * deliverability, never the ability to quote a customer.
 *
 * Both domains must be verified in Resend independently — verifying one does
 * nothing for the other.
 */

/** The public website. Correct for URLs, never for email addresses. */
export const WEBSITE_DOMAIN = 'indushydraulics.com'

/** Where the company's mailboxes live. All human-reachable addresses use this. */
export const MAIL_DOMAIN = 'indushydraulics.me'

/**
 * Sending domain for bulk/marketing email, kept separate from MAIL_DOMAIN so
 * campaign volume cannot damage transactional deliverability.
 *
 * Nothing sends from here yet — no marketing or sequence code exists. This is
 * the declared home for it when it is built.
 */
export const MARKETING_DOMAIN = 'indushydraulics.com'

/** Fallback transactional sender when StoreSettings.quoteFromEmail is unset. */
export const DEFAULT_FROM_EMAIL = `sales@${MAIL_DOMAIN}`

/**
 * Guard for any future marketing/sequence sender.
 *
 * Call this before sending bulk mail. It refuses a transactional-domain
 * sender, so a campaign cannot be pointed at `.me` by accident — which is the
 * one mistake that would put quotes in spam.
 */
export function assertMarketingSender(fromEmail: string): void {
  const domain = fromEmail.split('@')[1]?.toLowerCase()
  if (domain !== MARKETING_DOMAIN) {
    throw new Error(
      `Marketing email must send from @${MARKETING_DOMAIN}, got "${fromEmail}". ` +
        `Bulk sending from @${MAIL_DOMAIN} risks the transactional reputation that ` +
        `quotes and password resets depend on.`,
    )
  }
}

/** True for an address that can actually receive mail today. */
export function isDeliverableAddress(email: string): boolean {
  return email.toLowerCase().endsWith(`@${MAIL_DOMAIN}`)
}
