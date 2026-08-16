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

/**
 * What every email this app sends is FROM.
 *
 * On the website domain, deliberately. All app-originated mail — quotes, RFQ
 * confirmations, password resets, expiry reminders, and any future campaign —
 * shares one sending reputation here, isolated from the Google Workspace
 * mailboxes the sales team uses by hand. Nothing this app does can affect
 * whether a human-sent email from sales@indushydraulics.me lands.
 *
 * This address cannot RECEIVE — the website domain has no MX. That is what
 * DEFAULT_REPLY_TO is for, and why it is not optional.
 */
export const DEFAULT_FROM_EMAIL = `sales@${WEBSITE_DOMAIN}`

/**
 * Where replies go: the real, monitored inbox.
 *
 * Every send MUST set Reply-To. Without it a customer hitting "reply" on a
 * quote writes to a domain with no MX and the message is silently lost — the
 * worst possible failure for the quote-out flow, because both sides think it
 * worked.
 */
export const DEFAULT_REPLY_TO = `sales@${MAIL_DOMAIN}`

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

/**
 * The domain Resend is actually configured to send from.
 *
 * Same value as WEBSITE_DOMAIN, named separately because it answers a
 * different question: not "what is the site called" but "which domain has
 * DKIM and a verified sender in Resend". Only `indushydraulics.com` carries
 * those records — `indushydraulics.me` is a Google Workspace mail domain with
 * no Resend verification, so Resend rejects any send from it outright:
 *
 *   The indushydraulics.me domain is not verified.
 *
 * Verifying a second domain later is a DNS change plus a change here.
 */
export const SENDING_DOMAIN = WEBSITE_DOMAIN

/** True for an address Resend will accept as a From. */
export function isSendableAddress(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${SENDING_DOMAIN}`)
}

/**
 * The From address to actually use, given whatever StoreSettings holds.
 *
 * StoreSettings.quoteFromEmail is editable in the admin console, and pointing
 * it at an unverified domain does not fail on save — it fails silently at
 * send time, per email, with the message above. That is what happened: the
 * field held `sales@indushydraulics.me` and EVERY transactional send (quotes,
 * acknowledgements, expiry reminders, staff password resets) was rejected
 * while the console showed the address as configured.
 *
 * So a configured sender is honoured only if Resend can send from it.
 * Anything else falls back to the address we know is verified — a mail that
 * arrives from a slightly different From beats one that never leaves.
 */
export function resolveFromEmail(configured: string | null | undefined): string {
  const value = configured?.trim()
  if (value && isSendableAddress(value)) return value
  return DEFAULT_FROM_EMAIL
}

/**
 * The Reply-To to actually use.
 *
 * Mirror image of the From rule: replies must land in a mailbox that exists,
 * so a configured address is honoured only if it is on the domain that has
 * MX records. An address on the sending domain would send every customer
 * reply into a black hole.
 */
export function resolveReplyTo(configured: string | null | undefined): string {
  const value = configured?.trim()
  if (value && isDeliverableAddress(value)) return value
  return DEFAULT_REPLY_TO
}
