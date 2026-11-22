import { CONNECTION_ALERT, getHealthReadings } from '../../../data/health'
import { AccessError, requireOpsUser } from '../../../lib/access'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      return Response.json({ error: 'Sign in required' }, { status: 401 })
    throw error
  }
  const { opsAppConnections, inngestHeartbeatAt } = await getHealthReadings()
  return Response.json({
    db: { opsAppConnections, alert: opsAppConnections > CONNECTION_ALERT },
    inngestHeartbeatAt,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local',
  })
}
