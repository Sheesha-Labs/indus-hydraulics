import 'server-only'
import { db } from '@indus/db'
import {
  NEWSLETTER_CONFIRMATION_TTL_MS,
  NEWSLETTER_CONSENT,
  NEWSLETTER_FROM_EMAIL,
  NEWSLETTER_FROM_NAME,
  NEWSLETTER_IP_LIMITS,
  NEWSLETTER_RESEND_COOLDOWN_MS,
  assertMarketingSender,
  isNewsletterToken,
  maskEmail,
  type NewsletterSource,
} from '@indus/domain'
import { renderNewsletterConfirmation, renderNewsletterWelcome, sendEmail } from '@indus/email'
import { loadEmailBranding } from '../email-branding'
import { BASE_URL } from '../seo'
import type { EmailEvent } from './events'
import { listUnsubscribeHeaders, newsletterConfirmUrl, newsletterUnsubscribePageUrl } from './links'
import { generateNewsletterToken, hashNewsletterToken, newsletterEmailHash, recipientAddress } from './tokens'

/**
 * Everything the newsletter's public flow does to the database and the
 * mailer — signup, confirm, unsubscribe, delivery events. The server actions
 * and route handlers are thin wrappers over these, so each rule lives once.
 *
 * Never throws for an expected outcome; returns a tagged result. Unexpected
 * database errors propagate to the caller, which logs and answers generically.
 */

/** Suppression reasons that block even a fresh signup from being mailed. */
const HARD_SUPPRESSIONS = new Set(['bounced', 'complained'])

export async function newsletterBranding() {
  const branding = await loadEmailBranding()
  return {
    branding: { legalName: branding.legalName, registeredAddressLines: branding.registeredAddressLines },
    replyTo: branding.replyTo ?? undefined,
  }
}

export function newsletterSender() {
  // Refuses anything but the newsletter subdomain, so a later edit cannot
  // point newsletter volume at the domain quotes depend on.
  assertMarketingSender(NEWSLETTER_FROM_EMAIL)
  return { fromEmail: NEWSLETTER_FROM_EMAIL, fromName: NEWSLETTER_FROM_NAME }
}

// ── Signup ─────────────────────────────────────────────────────────────

export type SignupInput = {
  email: string
  source: NewsletterSource
  ipHash: string | null
  userAgent: string | null
  now?: Date
}

/**
 * - `sent` — a confirmation email went out (or was due and failed to send;
 *   the row exists and the visitor can try again).
 * - `already_confirmed` — nothing to do.
 * - `silent` — deliberately nothing sent, answered exactly like `sent`: a
 *   hard-suppressed address, or a repeat inside the cooldown.
 * - `rate_limited` — too many confirmation sends from this network.
 */
export type SignupOutcome = 'sent' | 'already_confirmed' | 'silent' | 'rate_limited'

export async function requestSubscription(input: SignupInput): Promise<SignupOutcome> {
  const now = input.now ?? new Date()
  const { email } = input

  // An address that hard-bounced or reported us as spam is not mailed again
  // from a web form. They can still reach sales; the form gives nothing away.
  const suppression = await db.newsletterSuppression.findUnique({
    where: { emailHash: newsletterEmailHash(email) },
    select: { reason: true },
  })
  if (suppression && HARD_SUPPRESSIONS.has(suppression.reason)) return 'silent'

  if (input.ipHash) {
    for (const limit of NEWSLETTER_IP_LIMITS) {
      const recent = await db.newsletterSubscriber.count({
        where: { ipHash: input.ipHash, confirmationSentAt: { gte: new Date(now.getTime() - limit.windowMs) } },
      })
      if (recent >= limit.max) return 'rate_limited'
    }
  }

  const existing = await db.newsletterSubscriber.findUnique({
    where: { email },
    select: { status: true, confirmationSentAt: true },
  })
  if (existing?.status === 'confirmed') return 'already_confirmed'
  if (
    existing?.status === 'pending' &&
    existing.confirmationSentAt &&
    now.getTime() - existing.confirmationSentAt.getTime() < NEWSLETTER_RESEND_COOLDOWN_MS
  ) {
    return 'silent'
  }

  const token = generateNewsletterToken()
  const pending = {
    status: 'pending' as const,
    source: input.source,
    ipHash: input.ipHash,
    userAgent: input.userAgent,
    confirmationTokenHash: hashNewsletterToken(token),
    confirmationSentAt: now,
    confirmedAt: null,
    consentText: NEWSLETTER_CONSENT.text,
    consentVersion: NEWSLETTER_CONSENT.version,
  }
  // An unsubscribed or bounced row comes back as pending. Its suppression
  // stays until the new confirmation is clicked (the trigger lifts it then).
  await db.newsletterSubscriber.upsert({
    where: { email },
    create: { email, ...pending },
    update: { ...pending, unsubscribedAt: null },
  })

  const { branding, replyTo } = await newsletterBranding()
  const content = renderNewsletterConfirmation({
    confirmUrl: newsletterConfirmUrl(BASE_URL, token),
    validityWindow: '14 days',
    branding,
  })
  const sent = await sendEmail({
    kind: 'newsletter_confirmation',
    to: [email],
    ...newsletterSender(),
    ...(replyTo ? { replyTo } : {}),
    ...content,
  })
  if (!sent.ok) console.error('[newsletter] confirmation send failed', sent.error)
  return 'sent'
}

// ── Confirm ────────────────────────────────────────────────────────────

export type ConfirmLookup =
  | { status: 'ready'; maskedEmail: string }
  | { status: 'expired' }
  | { status: 'not_found' }

function isExpired(sentAt: Date | null, now: Date): boolean {
  return !sentAt || now.getTime() - sentAt.getTime() > NEWSLETTER_CONFIRMATION_TTL_MS
}

/** Read-only, for the confirm page. Confirms nothing. */
export async function lookupConfirmation(token: string, now = new Date()): Promise<ConfirmLookup> {
  if (!isNewsletterToken(token)) return { status: 'not_found' }
  const row = await db.newsletterSubscriber.findUnique({
    where: { confirmationTokenHash: hashNewsletterToken(token) },
    select: { email: true, status: true, confirmationSentAt: true },
  })
  if (!row || row.status !== 'pending') return { status: 'not_found' }
  if (isExpired(row.confirmationSentAt, now)) return { status: 'expired' }
  return { status: 'ready', maskedEmail: maskEmail(row.email) }
}

export type ConfirmOutcome = { status: 'confirmed'; maskedEmail: string } | { status: 'expired' } | { status: 'not_found' }

/**
 * Confirm a subscription and send the welcome email. Only ever called from
 * the confirm page's button (a POST), never on page load.
 *
 * The update is conditional on the token hash still being on the row, so two
 * clicks racing cannot both send a welcome.
 */
export async function confirmSubscription(token: string, now = new Date()): Promise<ConfirmOutcome> {
  if (!isNewsletterToken(token)) return { status: 'not_found' }
  const tokenHash = hashNewsletterToken(token)
  const row = await db.newsletterSubscriber.findUnique({
    where: { confirmationTokenHash: tokenHash },
    select: { id: true, email: true, status: true, confirmationSentAt: true, unsubscribeToken: true },
  })
  if (!row || row.status !== 'pending') return { status: 'not_found' }
  if (isExpired(row.confirmationSentAt, now)) return { status: 'expired' }

  const claimed = await db.newsletterSubscriber.updateMany({
    where: { id: row.id, confirmationTokenHash: tokenHash, status: 'pending' },
    data: { status: 'confirmed', confirmedAt: now, confirmationTokenHash: null },
  })
  if (claimed.count === 0) return { status: 'not_found' }

  const { branding, replyTo } = await newsletterBranding()
  const content = renderNewsletterWelcome({
    // The PERMANENT token — confirming just cleared the other one.
    unsubscribeUrl: newsletterUnsubscribePageUrl(BASE_URL, row.unsubscribeToken),
    siteUrl: BASE_URL,
    branding,
  })
  const sent = await sendEmail({
    kind: 'newsletter_welcome',
    to: [row.email],
    ...newsletterSender(),
    ...(replyTo ? { replyTo } : {}),
    headers: listUnsubscribeHeaders(BASE_URL, row.unsubscribeToken),
    ...content,
  })
  if (!sent.ok) console.error('[newsletter] welcome send failed', sent.error)

  return { status: 'confirmed', maskedEmail: maskEmail(row.email) }
}

// ── Unsubscribe ────────────────────────────────────────────────────────

export type UnsubscribeLookup =
  | { status: 'subscribed'; maskedEmail: string }
  | { status: 'unsubscribed'; maskedEmail: string }
  | { status: 'not_found' }

/** Read-only, for the unsubscribe page. */
export async function lookupUnsubscribe(token: string): Promise<UnsubscribeLookup> {
  if (!isNewsletterToken(token)) return { status: 'not_found' }
  const row = await db.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
    select: { email: true, status: true },
  })
  if (!row) return { status: 'not_found' }
  const maskedEmail = maskEmail(row.email)
  return row.status === 'pending' || row.status === 'confirmed'
    ? { status: 'subscribed', maskedEmail }
    : { status: 'unsubscribed', maskedEmail }
}

/**
 * Leave the list. Idempotent: an already-unsubscribed (or bounced) row is
 * left as it is and reported as done. The status change fires the
 * suppression trigger.
 *
 * `not_found` is for the page's wording only — the one-click endpoint answers
 * 200 either way, so it cannot be used to test which tokens exist.
 */
export async function unsubscribeByToken(token: string, now = new Date()): Promise<'unsubscribed' | 'not_found'> {
  if (!isNewsletterToken(token)) return 'not_found'
  const row = await db.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token }, select: { id: true } })
  if (!row) return 'not_found'
  await db.newsletterSubscriber.updateMany({
    where: { id: row.id, status: { in: ['pending', 'confirmed'] } },
    data: { status: 'unsubscribed', unsubscribedAt: now, confirmationTokenHash: null },
  })
  return 'unsubscribed'
}

// ── Delivery events (Resend webhook) ───────────────────────────────────

export type EventOutcome = { email: boolean; subscribers: number; contacts: number; suppressed: number }

/**
 * Apply one Resend event. Resend retries until it gets a 2xx, so every write
 * is safe to repeat: timestamps are only set while still null, suppressions
 * skip duplicates, and status changes only touch subscribers still on the
 * list.
 *
 * - delivered → `sent_emails.deliveredAt`.
 * - bounced, PERMANENT → `bouncedAt`; every recipient is suppressed and a
 *   subscribed one becomes `bounced`. Any email counts — a hard-bouncing RFQ
 *   confirmation proves the address is dead just as well. Transient bounces
 *   (full mailbox, greylisting) change nothing.
 * - complained → `complainedAt`; every recipient is suppressed as
 *   `complained` (written before the status change, so the trigger's own
 *   `unsubscribed` row does not replace it) and unsubscribed. Someone who
 *   pressed "Report spam" on any of our email is not someone to send a
 *   newsletter to.
 */
export async function recordEmailEvent(event: EmailEvent): Promise<EventOutcome> {
  const recipients = [...new Set(event.recipients.map(recipientAddress).filter((r): r is string => r !== null))]
  const stamp =
    event.type === 'delivered' ? 'deliveredAt' : event.type === 'complained' ? 'complainedAt' : event.permanent ? 'bouncedAt' : null

  return db.$transaction(async (tx) => {
    const email = stamp
      ? (
          await tx.sentEmail.updateMany({
            where: { providerId: event.emailId, [stamp]: null },
            data: { [stamp]: event.at },
          })
        ).count > 0
      : false

    const reason = event.type === 'complained' ? 'complained' : event.type === 'bounced' && event.permanent ? 'bounced' : null
    if (!reason || recipients.length === 0) return { email, subscribers: 0, contacts: 0, suppressed: 0 }

    const suppressed = await tx.newsletterSuppression.createMany({
      data: recipients.map((r) => ({ emailHash: newsletterEmailHash(r), reason })),
      skipDuplicates: true,
    })
    const subscribers = await tx.newsletterSubscriber.updateMany({
      where: { email: { in: recipients }, status: { in: ['pending', 'confirmed'] } },
      data:
        reason === 'bounced'
          ? { status: 'bounced', bouncedAt: event.at, confirmationTokenHash: null }
          : { status: 'unsubscribed', unsubscribedAt: event.at, confirmationTokenHash: null },
    })
    // The same address on a list (Phase 2). The contact trigger would do
    // this from the subscriber side too, but an address can be on a list
    // without ever having subscribed.
    const contacts = await tx.newsletterListContact.updateMany({
      where: { email: { in: recipients }, status: 'active' },
      data: { status: reason === 'bounced' ? 'bounced' : 'unsubscribed', unsubscribedAt: event.at },
    })
    return { email, subscribers: subscribers.count, contacts: contacts.count, suppressed: suppressed.count }
  })
}
