import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Resend's delivery events, as its webhook reports them: verifying the
 * signature, and reducing the payload to what the webhook route acts on.
 *
 * Ported from Bazar (lib/newsletter/events.ts, origin/main #718). Kept free of
 * `server-only` and of the database so the tests drive both halves directly;
 * the route does the I/O.
 */

/**
 * How far a signed timestamp may sit from our clock. Resend signs with Svix,
 * whose own libraries allow five minutes either way; past that, a captured
 * request replayed later is refused.
 */
export const SIGNATURE_TOLERANCE_S = 5 * 60

export type SignatureHeaders = {
  id: string | null
  timestamp: string | null
  signature: string | null
}

/**
 * Check a Svix signature: HMAC-SHA256 over `${id}.${timestamp}.${body}`,
 * keyed by the base64 part of the `whsec_…` secret, compared against each
 * `v1,<base64>` entry in the signature header (there are several while a
 * secret is being rotated). Written out rather than pulled from `svix`: a
 * dozen lines of crypto are easier to read than a dependency to pin.
 */
export function verifyResendSignature(
  body: string,
  headers: SignatureHeaders,
  secret: string,
  now: Date = new Date(),
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature || !secret) return false

  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt)) return false
  if (Math.abs(now.getTime() / 1000 - sentAt) > SIGNATURE_TOLERANCE_S) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  if (key.length === 0) return false
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest()

  return signature.split(' ').some((entry) => {
    const [version, value] = entry.split(',', 2)
    if (version !== 'v1' || !value) return false
    const given = Buffer.from(value, 'base64')
    return given.length === expected.length && timingSafeEqual(given, expected)
  })
}

export type EmailEvent = {
  type: 'delivered' | 'bounced' | 'complained'
  /** The id Resend returned when the message was sent (`sent_emails.providerId`). */
  emailId: string
  recipients: string[]
  /** Bounces only: Resend's `bounce.type` was "Permanent". */
  permanent: boolean
  at: Date
  /**
   * Domain of the From address, lower-cased; null if the payload has none.
   * Resend webhooks are per ACCOUNT, not per domain, and this account also
   * sends for other sites — their events arrive here too.
   */
  senderDomain: string | null
}

/**
 * Whether an event is about mail this site sent: the website domain or any
 * subdomain of it (the newsletter's `news.`). An event with no From is
 * treated as ours — losing a hard bounce costs more than acting on one.
 */
export function isOwnSender(senderDomain: string | null, websiteDomain: string): boolean {
  if (senderDomain === null) return true
  const site = websiteDomain.toLowerCase()
  return senderDomain === site || senderDomain.endsWith(`.${site}`)
}

function domainOf(from: unknown): string | null {
  if (typeof from !== 'string') return null
  const angle = from.match(/<([^<>]+)>/)
  const address = (angle?.[1] ?? from).trim()
  const at = address.lastIndexOf('@')
  return at > 0 ? address.slice(at + 1).toLowerCase() : null
}

const HANDLED = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
} as const

/**
 * The event, or null for anything not acted on — another event type (the
 * webhook may be subscribed to more than these three), or a payload missing
 * the message id. Null is answered 200: retrying it would not help.
 */
export function parseEmailEvent(payload: unknown): EmailEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const { type, created_at, data } = payload as {
    type?: unknown
    created_at?: unknown
    data?: { email_id?: unknown; to?: unknown; from?: unknown; bounce?: { type?: unknown } }
  }
  if (typeof type !== 'string' || !(type in HANDLED)) return null
  if (!data || typeof data.email_id !== 'string' || !data.email_id) return null

  const recipients = Array.isArray(data.to) ? data.to.filter((r): r is string => typeof r === 'string') : []
  const stamp = typeof created_at === 'string' ? Date.parse(created_at) : Number.NaN

  return {
    type: HANDLED[type as keyof typeof HANDLED],
    emailId: data.email_id,
    recipients,
    permanent: typeof data.bounce?.type === 'string' && data.bounce.type.toLowerCase() === 'permanent',
    at: Number.isNaN(stamp) ? new Date() : new Date(stamp),
    senderDomain: domainOf(data.from),
  }
}
