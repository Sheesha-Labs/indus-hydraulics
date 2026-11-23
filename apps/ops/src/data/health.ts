import 'server-only'
import { opsDb } from '@indus/ops-db'

/** Above this many ops_app connections the pooler budget is at risk (ADR-04). */
export const CONNECTION_ALERT = 12

export type MailboxHealthRow = {
  address: string
  status: string
  lastSuccessfulSyncAt: string | null
  lagSeconds: number
  watchExpiresAt: string | null
}

export type SendQueueCounts = { scheduled: number; held: number; waitingForMailbox: number; unknown: number }

export type HealthReadings = {
  opsAppConnections: number
  inngestHeartbeatAt: string | null
  mailboxes: MailboxHealthRow[]
  sendQueue: SendQueueCounts
}

/**
 * What /api/health reports (S00, extended in S04-T09): ops_app backends in pg_stat_activity, the last Inngest
 * heartbeat, every mailbox's sync health and the send queue's waiting rows. The raw query is the only way to
 * read pg_stat_activity; it takes no input.
 */
export async function getHealthReadings(): Promise<HealthReadings> {
  const [connections, heartbeat, mailboxes, queue] = await Promise.all([
    opsDb.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT count(*)::bigint AS count FROM pg_stat_activity WHERE usename = 'ops_app'`,
    opsDb.settingsEntry.findUnique({
      where: { key: 'system.inngest_heartbeat' },
      select: { value: true },
    }),
    opsDb.mailbox.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        address: true,
        status: true,
        syncState: { select: { lastSuccessfulSyncAt: true, lagSeconds: true, watchExpiresAt: true } },
      },
    }),
    opsDb.outboundEmail.groupBy({
      by: ['status'],
      where: { status: { in: ['scheduled', 'held', 'waiting_for_mailbox', 'unknown'] } },
      _count: { _all: true },
    }),
  ])
  const count = (status: string) => queue.find((q) => q.status === status)?._count._all ?? 0
  return {
    opsAppConnections: Number(connections[0]?.count ?? 0),
    inngestHeartbeatAt: (heartbeat?.value as { at?: string } | null)?.at ?? null,
    mailboxes: mailboxes.map((m) => ({
      address: m.address,
      status: m.status,
      lastSuccessfulSyncAt: m.syncState?.lastSuccessfulSyncAt?.toISOString() ?? null,
      lagSeconds: m.syncState?.lagSeconds ?? 0,
      watchExpiresAt: m.syncState?.watchExpiresAt?.toISOString() ?? null,
    })),
    sendQueue: {
      scheduled: count('scheduled'),
      held: count('held'),
      waitingForMailbox: count('waiting_for_mailbox'),
      unknown: count('unknown'),
    },
  }
}
