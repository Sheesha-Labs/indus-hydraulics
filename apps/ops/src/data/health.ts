import 'server-only'
import { monthKey } from '@indus/ops-ai'
import { opsDb } from '@indus/ops-db'
import { readLatency } from '../server/assistant/latency'
import { isMailPipelineEnabled } from '../server/assistant/pipeline-switch'
import { assistantPauseState } from '../server/assistant/pause'

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

export type AssistantHealth = {
  paused: boolean
  pipelineEnabled: boolean
  monthSpendUsd: string
  budgetUsd: string | null
  lastActionAt: string | null
}

export type HealthReadings = {
  opsAppConnections: number
  inngestHeartbeatAt: string | null
  mailboxes: MailboxHealthRow[]
  sendQueue: SendQueueCounts
  /** S05-T09. */
  assistant: AssistantHealth
  aiCallsLastHour: number
  mailLatency: { p50: number | null; p95: number | null; count: number }
}

/**
 * What /api/health reports (S00, extended in S04-T09): ops_app backends in pg_stat_activity, the last Inngest
 * heartbeat, every mailbox's sync health and the send queue's waiting rows. The raw query is the only way to
 * read pg_stat_activity; it takes no input.
 */
export async function getHealthReadings(now = new Date()): Promise<HealthReadings> {
  const [connections, heartbeat, mailboxes, queue, assistant, aiCallsLastHour, mailLatency] = await Promise.all([
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
    assistantHealth(now),
    opsDb.aiCall.count({ where: { at: { gte: new Date(now.getTime() - 3_600_000) } } }),
    readLatency(),
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
    assistant,
    aiCallsLastHour,
    mailLatency,
  }
}

/** S05-T09: the Assistant's switches and spend, for /api/health. */
async function assistantHealth(now: Date): Promise<AssistantHealth> {
  const [pause, enabled, budget, last] = await Promise.all([
    assistantPauseState(),
    isMailPipelineEnabled(),
    opsDb.aiBudget.findUnique({
      where: { month: new Date(`${monthKey(now)}T00:00:00Z`) },
      select: { limitUsd: true, spentUsd: true },
    }),
    opsDb.assistantAction.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
  ])
  return {
    paused: pause !== null,
    pipelineEnabled: enabled,
    monthSpendUsd: budget ? budget.spentUsd.toFixed(2) : '0.00',
    budgetUsd: budget ? budget.limitUsd.toFixed(2) : null,
    lastActionAt: last?.createdAt.toISOString() ?? null,
  }
}
