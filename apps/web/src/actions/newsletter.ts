'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { z } from 'zod'
import { isDotPaddedGmail, newsletterSource, normaliseNewsletterEmail } from '@indus/domain'
import { rejectAsBot } from '../lib/designed-enquiry'
import { clientIp } from '../lib/request-origin'
import { confirmSubscription, requestSubscription, unsubscribeByToken } from '../lib/newsletter/service'

/**
 * The newsletter's public server actions: sign up, confirm, unsubscribe.
 * The rules live in lib/newsletter/service.ts; these validate input, read
 * request metadata and turn outcomes into what the visitor is told.
 */

export type SubscribeResult = { success: true; message: string } | { success: false; error: string }

/** What every signup is told — a bot's, a suppressed address's and a cooldown repeat's included. */
const CHECK_INBOX = 'Check your inbox to confirm your subscription.'

const EmailSchema = z.string().trim().toLowerCase().email('Enter a valid email').max(254)

export async function subscribeToNewsletter(formData: FormData): Promise<SubscribeResult> {
  // Honeypot and timing first, and answered as a success: a bot learns
  // nothing, and above all no confirmation email goes to an address that is
  // usually a stranger's. The shared helper's own messages are for forms that
  // show a reference number; here silence is the right answer.
  if (rejectAsBot(formData) !== null) return { success: true, message: CHECK_INBOX }

  const parsed = EmailSchema.safeParse(formData.get('email'))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Enter a valid email' }
  const email = normaliseNewsletterEmail(parsed.data)
  if (isDotPaddedGmail(email)) return { success: true, message: CHECK_INBOX }

  // Best-effort metadata. Never the raw IP. `clientIp`, not the first XFF hop,
  // which is whatever the caller sent and would give a fresh hash per request
  // — useless for the per-IP limit.
  let ipHash: string | null = null
  let userAgent: string | null = null
  try {
    const h = await headers()
    const ip = clientIp(h)
    if (ip !== 'unknown') ipHash = createHash('sha256').update(ip).digest('hex')
    userAgent = h.get('user-agent')?.slice(0, 500) ?? null
  } catch {
    // Metadata is non-critical.
  }

  try {
    const outcome = await requestSubscription({
      email,
      source: newsletterSource(formData.get('source')),
      ipHash,
      userAgent,
    })
    switch (outcome) {
      case 'already_confirmed':
        return { success: true, message: "You're already subscribed — thank you." }
      case 'rate_limited':
        return { success: false, error: 'Too many sign-ups from your network. Try again in an hour.' }
      default:
        return { success: true, message: CHECK_INBOX }
    }
  } catch (err) {
    console.error('[subscribeToNewsletter] failed', err)
    return { success: false, error: 'Could not save your subscription. Try again in a moment.' }
  }
}

export type NewsletterTokenState =
  | { status: 'idle' }
  | { status: 'done'; maskedEmail?: string }
  | { status: 'expired' }
  | { status: 'not_found' }
  | { status: 'error' }

/** The confirm page's button. A POST — mail scanners only ever GET the page. */
export async function confirmNewsletterAction(
  _prev: NewsletterTokenState,
  formData: FormData,
): Promise<NewsletterTokenState> {
  const token = formData.get('token')
  if (typeof token !== 'string') return { status: 'not_found' }
  try {
    const outcome = await confirmSubscription(token)
    return outcome.status === 'confirmed' ? { status: 'done', maskedEmail: outcome.maskedEmail } : outcome
  } catch (err) {
    console.error('[confirmNewsletterAction] failed', err)
    return { status: 'error' }
  }
}

/** The unsubscribe page's button. */
export async function unsubscribeNewsletterAction(
  _prev: NewsletterTokenState,
  formData: FormData,
): Promise<NewsletterTokenState> {
  const token = formData.get('token')
  if (typeof token !== 'string') return { status: 'not_found' }
  try {
    // A token that stopped matching between render and click was removed some
    // other way; either way the address is off the list.
    await unsubscribeByToken(token)
    return { status: 'done' }
  } catch (err) {
    console.error('[unsubscribeNewsletterAction] failed', err)
    return { status: 'error' }
  }
}
