import { NextResponse, type NextRequest } from 'next/server'
import { MARKETING_DOMAIN, WEBSITE_DOMAIN } from '@indus/domain'
import { isOwnSender, parseEmailEvent, verifyResendSignature } from '../../../../lib/newsletter/events'
import { recordEmailEvent } from '../../../../lib/newsletter/service'

/** How long after the event an unmatched newsletter event is retried. */
const RETRY_UNMATCHED_MS = 15 * 60 * 1000

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Resend's delivery events — delivered, bounced and complained — for every
 * email the site sends, transactional and newsletter alike. See
 * `recordEmailEvent` for what each one changes.
 *
 * The Svix signature is the only authorisation: without
 * `RESEND_WEBHOOK_SECRET` nothing is trusted and the route answers 503, which
 * Resend retries — so events sent before the secret is set are not lost.
 * Answers are 2xx for anything that should not be retried (including event
 * types this ignores) and 5xx only when the write failed. Every write is safe
 * to run twice.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ ok: false, reason: 'not configured' }, { status: 503 })

  const body = await req.text()
  const signed = verifyResendSignature(
    body,
    {
      id: req.headers.get('svix-id'),
      timestamp: req.headers.get('svix-timestamp'),
      signature: req.headers.get('svix-signature'),
    },
    secret,
  )
  if (!signed) return NextResponse.json({ ok: false }, { status: 401 })

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad json' }, { status: 400 })
  }

  const event = parseEmailEvent(payload)
  if (!event) return NextResponse.json({ ok: true, matched: 'ignored' })
  // The Resend account also sends for other sites, and webhooks are
  // account-wide: a bounce on another site's mail must not suppress anyone here.
  if (!isOwnSender(event.senderDomain, WEBSITE_DOMAIN)) {
    return NextResponse.json({ ok: true, matched: 'other sender' })
  }

  try {
    const outcome = await recordEmailEvent(event)
    // Newsletter mail records Resend's id only after the batch call returns,
    // so a fast `delivered` can arrive first and match nothing. Ask Resend to
    // retry a recent one rather than lose the stamp. (Suppression is keyed
    // on the address and has already happened either way.)
    if (!outcome.email && event.senderDomain === MARKETING_DOMAIN && Date.now() - event.at.getTime() < RETRY_UNMATCHED_MS) {
      return NextResponse.json({ ok: false, reason: 'no matching email yet' }, { status: 503 })
    }
    return NextResponse.json({ ok: true, ...outcome })
  } catch (err) {
    // The message id and type only — never the recipients.
    console.error('[webhooks.resend] write failed', { type: event.type, emailId: event.emailId, err })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
