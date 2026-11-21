import { opsDb } from '@indus/ops-db'
import { AccessError, requireOpsUser } from '../../../lib/access'

export const dynamic = 'force-dynamic'

/** Above this many ops_app connections the pooler budget is at risk (ADR-04). */
const CONNECTION_ALERT = 12

export async function GET() {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      return Response.json({ error: 'Sign in required' }, { status: 401 })
    throw error
  }
  const [connections, heartbeat] = await Promise.all([
    opsDb.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT count(*)::bigint AS count FROM pg_stat_activity WHERE usename = 'ops_app'`,
    opsDb.settingsEntry.findUnique({
      where: { key: 'system.inngest_heartbeat' },
      select: { value: true },
    }),
  ])
  const opsAppConnections = Number(connections[0]?.count ?? 0)
  return Response.json({
    db: { opsAppConnections, alert: opsAppConnections > CONNECTION_ALERT },
    inngestHeartbeatAt: (heartbeat?.value as { at?: string } | null)?.at ?? null,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local',
  })
}
