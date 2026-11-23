import * as Sentry from '@sentry/nextjs'
import { OAuth2Client } from 'google-auth-library'
import { env } from '../../../../lib/env'
import { emitEvent } from '../../../../inngest/emit'
import { parsePushBody, PUSH_ISSUERS } from './push-core'

/**
 * Gmail → Pub/Sub → here (S04-T04, 08-map-integrations §1.4, ADR-04). Verifies Google's OIDC token (audience,
 * issuer, the invoker service account, email_verified), decodes { emailAddress, historyId } and hands it to
 * Inngest as `ops/gmail.notified` with the Pub/Sub message id as the event id (redelivery deduplicates).
 *
 * NO DATABASE: nothing this route imports touches @indus/ops-db (push.graph.test.ts), so a burst of
 * notifications costs the shared pooler nothing. The mailbox is looked up inside the sync function.
 *
 * A malformed body is acknowledged (204) and dropped, so Pub/Sub does not redeliver garbage for a week.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const verifier = new OAuth2Client()

export async function POST(request: Request): Promise<Response> {
  const e = env()
  if (!e.GMAIL_PUSH_AUDIENCE || !e.GMAIL_PUSH_SA_EMAIL) return new Response(null, { status: 503 })

  const auth = request.headers.get('authorization') ?? ''
  const idToken = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!idToken) return new Response(null, { status: 401 })
  try {
    const ticket = await verifier.verifyIdToken({ idToken, audience: e.GMAIL_PUSH_AUDIENCE })
    const claims = ticket.getPayload()
    if (
      !claims ||
      !PUSH_ISSUERS.includes(claims.iss) ||
      claims.email !== e.GMAIL_PUSH_SA_EMAIL ||
      claims.email_verified !== true
    ) {
      return new Response(null, { status: 401 })
    }
  } catch {
    return new Response(null, { status: 401 })
  }

  const parsed = parsePushBody(await request.text())
  if (!parsed) {
    Sentry.captureMessage('gmail push: malformed body acknowledged and dropped', 'warning')
    return new Response(null, { status: 204 })
  }
  const sent = await emitEvent({
    name: 'ops/gmail.notified',
    id: `gmail-push:${parsed.messageId}`,
    data: { emailAddress: parsed.emailAddress, historyId: parsed.historyId },
  })
  // Not queued: let Pub/Sub redeliver (the event id deduplicates the retry).
  return new Response(null, { status: sent ? 204 : 503 })
}
