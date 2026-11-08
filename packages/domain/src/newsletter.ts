/**
 * Newsletter rules shared by the signup form (client), the signup action and
 * the admin — pure, no crypto, no database, so a client component can import
 * them.
 *
 * docs/newsletter-plan.md is the design; this file is what the form shows and
 * what the server records, kept in one place so the two cannot drift.
 */

/**
 * What a subscriber agrees to, exactly as the signup form shows it.
 *
 * The text is stored on the subscriber row with its version at signup (plan
 * §2, Bazar bug 7: no consent record). Change the wording → bump the version,
 * so every row says which sentence its owner saw. Never edit a published
 * version's text in place.
 */
export const NEWSLETTER_CONSENT = {
  version: '2026-11-08',
  text: 'By subscribing you agree to receive the Indus Hydraulics newsletter and to our privacy policy. Unsubscribe in one click.',
} as const

/** How long a confirmation link works. Past it the visitor signs up again. */
export const NEWSLETTER_CONFIRMATION_TTL_MS = 14 * 24 * 60 * 60 * 1000

/**
 * A repeat signup for a still-pending address inside this window is answered
 * normally but sends nothing. Stops the form being used to mail-bomb a third
 * party's inbox with confirmation emails.
 */
export const NEWSLETTER_RESEND_COOLDOWN_MS = 10 * 60 * 1000

/** Per-IP ceilings on confirmation sends, counted from the subscriber table. */
export const NEWSLETTER_IP_LIMITS = [
  { windowMs: 60 * 60 * 1000, max: 5 },
  { windowMs: 24 * 60 * 60 * 1000, max: 20 },
] as const

/** The signup sources the site actually renders. Anything else is recorded as `other`. */
export const NEWSLETTER_SOURCES = ['homepage_footer', 'blog_index', 'other'] as const
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number]

export function newsletterSource(raw: unknown): NewsletterSource {
  if (typeof raw !== 'string' || raw.trim() === '') return 'homepage_footer'
  const value = raw.trim()
  return (NEWSLETTER_SOURCES as readonly string[]).includes(value) ? (value as NewsletterSource) : 'other'
}

/** Lower-cased and trimmed — the form every row and every hash uses. */
export function normaliseNewsletterEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * The dotted-Gmail pattern list-bombing scripts use: Gmail ignores dots, so
 * `j.o.h.n.smith@gmail.com` reaches the same inbox as `johnsmith@gmail.com`
 * and slips past a unique index. Four or more dot-separated pieces with at
 * least one single character is never how a person writes their own address.
 * Ported from Bazar (lib/forms/spam.ts).
 */
export function isDotPaddedGmail(email: string): boolean {
  const at = email.lastIndexOf('@')
  if (at < 0) return false
  const domain = email.slice(at + 1).trim().toLowerCase()
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') return false
  const pieces = (email.slice(0, at).split('+')[0] ?? '').split('.')
  return pieces.length >= 4 && pieces.some((p) => p.length === 1)
}

/** 48 lower-case hex characters: the shape of both newsletter tokens. */
const TOKEN_SHAPE = /^[0-9a-f]{48}$/

export function isNewsletterToken(token: unknown): token is string {
  return typeof token === 'string' && TOKEN_SHAPE.test(token)
}

/** `a…@example.com` — enough for a person to recognise their address on a public page. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at <= 0) return email
  return `${email[0]}…${email.slice(at)}`
}
