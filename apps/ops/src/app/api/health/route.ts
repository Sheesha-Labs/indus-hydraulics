import * as Sentry from '@sentry/nextjs'
import { CONNECTION_ALERT, getHealthReadings } from '../../../data/health'
import { AccessError, requireOpsUser } from '../../../lib/access'

export const dynamic = 'force-dynamic'

/**
 * Signed-in health (S00; S04-T09 adds the mailboxes and the send queue). Above 12 ops_app connections the
 * shared pooler budget is at risk (ADR-04): the response says so and Sentry hears about it.
 */
export async function GET() {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      return Response.json({ error: 'Sign in required' }, { status: 401 })
    throw error
  }
  const { opsAppConnections, inngestHeartbeatAt, mailboxes, sendQueue } = await getHealthReadings()
  const alert = opsAppConnections > CONNECTION_ALERT
  if (alert) {
    Sentry.captureMessage('ops_app connections above the alert line', {
      level: 'warning',
      tags: { job: 'health' },
      extra: { opsAppConnections },
    })
  }
  return Response.json({
    db: { opsAppConnections, alert },
    inngestHeartbeatAt,
    mailboxes,
    sendQueue,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local',
  })
}
