import { NextResponse, type NextRequest } from 'next/server'
import { parseEmailEvent, verifyResendSignature } from '../../../../lib/newsletter/events'
import { recordEmailEvent } from '../../../../lib/newsletter/service'

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

  try {
    const outcome = await recordEmailEvent(event)
    return NextResponse.json({ ok: true, ...outcome })
  } catch (err) {
    // The message id and type only — never the recipients.
    console.error('[webhooks.resend] write failed', { type: event.type, emailId: event.emailId, err })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
