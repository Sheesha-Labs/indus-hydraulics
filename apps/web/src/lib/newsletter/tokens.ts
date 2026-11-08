import { createHash, randomBytes } from 'node:crypto'

/**
 * Newsletter tokens and hashes. Pure, so the tests drive them directly.
 *
 * Two tokens per subscriber, both 48 lower-case hex characters:
 *
 * - the CONFIRMATION token is one-time. Only its SHA-256 is stored
 *   (`confirmationTokenHash`), so a database read cannot confirm anyone, and
 *   it is cleared once used.
 * - the UNSUBSCRIBE token is permanent and stored in clear, because every
 *   email to the subscriber — including every future campaign — has to
 *   carry it. It grants one thing: leaving the list.
 */

/** 24 random bytes as hex: the shape `isNewsletterToken` accepts. */
export function generateNewsletterToken(): string {
  return randomBytes(24).toString('hex')
}

/** What `confirmationTokenHash` holds for a token. */
export function hashNewsletterToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * The suppression key for an address. MUST match the SQL
 * `newsletter_email_hash()` (202611081838): sha256 of lower(trim(email)),
 * hex — the trigger writes rows with that function and the app reads them
 * with this one.
 */
export function newsletterEmailHash(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

/**
 * The bare address from a recipient as Resend reports it — usually already
 * bare, but `Name <a@b.c>` is accepted too. Lower-cased; null if there is no
 * address in it.
 */
export function recipientAddress(raw: string): string | null {
  const angle = raw.match(/<([^<>\s]+@[^<>\s]+)>/)
  const value = (angle?.[1] ?? raw).trim().toLowerCase()
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : null
}
