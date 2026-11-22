import 'server-only'
import { opsDb } from '@indus/ops-db'

/** Above this many ops_app connections the pooler budget is at risk (ADR-04). */
export const CONNECTION_ALERT = 12

export type HealthReadings = {
  opsAppConnections: number
  inngestHeartbeatAt: string | null
}

/**
 * What /api/health reports: ops_app backends in pg_stat_activity and the last Inngest
 * heartbeat. Two queries, the data-layer maximum. The raw query is the only way to read
 * pg_stat_activity; it takes no input.
 */
export async function getHealthReadings(): Promise<HealthReadings> {
  const [connections, heartbeat] = await Promise.all([
    opsDb.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT count(*)::bigint AS count FROM pg_stat_activity WHERE usename = 'ops_app'`,
    opsDb.settingsEntry.findUnique({
      where: { key: 'system.inngest_heartbeat' },
      select: { value: true },
    }),
  ])
  return {
    opsAppConnections: Number(connections[0]?.count ?? 0),
    inngestHeartbeatAt: (heartbeat?.value as { at?: string } | null)?.at ?? null,
  }
}
