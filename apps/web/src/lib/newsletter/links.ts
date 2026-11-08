/**
 * Every URL and header the newsletter puts in an email, built in one place.
 * Pure — the base URL is passed in — so Phase 4's campaign sender and the
 * tests use the same builders as the signup flow.
 */

const trim = (base: string) => base.replace(/\/+$/, '')

/** The confirm PAGE. It renders a button; nothing is confirmed on GET. */
export function newsletterConfirmUrl(base: string, token: string): string {
  return `${trim(base)}/newsletter/confirm/${token}`
}

/** The unsubscribe PAGE — read-only until its button is pressed. */
export function newsletterUnsubscribePageUrl(base: string, token: string): string {
  return `${trim(base)}/newsletter/unsubscribe/${token}`
}

/** Where a mail client's own Unsubscribe button POSTs (RFC 8058). */
export function newsletterOneClickUrl(base: string, token: string): string {
  return `${trim(base)}/api/newsletter/unsubscribe?token=${token}`
}

/**
 * `List-Unsubscribe` + `List-Unsubscribe-Post` for any email sent to a
 * subscriber. Gmail and Yahoo require both on bulk mail (Feb 2024 sender
 * rules); with them the inbox shows its own Unsubscribe button, which POSTs
 * to the one-click endpoint. The https URL only — the sending subdomain has
 * no mailbox for a `mailto:`.
 */
export function listUnsubscribeHeaders(base: string, token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${newsletterOneClickUrl(base, token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}
