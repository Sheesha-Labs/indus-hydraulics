import 'server-only'
import { evaluateMailboxHealth, isDeskHours, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import * as Sentry from '@sentry/nextjs'
import { holidaysFor } from '../mail-send/slot'
import { raiseNotification } from '../notify/raise'
import { resolveNotifications, resolveNotificationsWithPrefix } from '../notify/resolve'
import { getSetting } from '../settings/get'

/**
 * The five-minute mailbox health check (S04-T09, 08-map §1.13). Database only, no Gmail call: one query for the
 * mailboxes with their sync facts and the count of sends held for the cap, then a write per mailbox whose
 * state or lag changed. Behind raises a notification (resolved when it recovers); a lifted limit resolves the
 * day's limit notice. Sentry hears about a failed watch renewal at any hour, and about 30 minutes without a
 * sync only during desk hours (a UAE working day, 08:00–19:00 GST).
 */
export type HealthChange = {
  mailboxId: string
  address: string
  from: MailboxStatusValue
  to: MailboxStatusValue
}

export const behindKey = (mailboxId: string) => `mailbox_behind:${mailboxId}`

type Capture = (message: string, tags: Record<string, string>) => void

const sentryCapture: Capture = (message, tags) =>
  void Sentry.captureMessage(message, { level: 'warning', tags })

export async function runHealthCheck(
  deps: {
    now?: Date
    capture?: Capture
    /** Tests: check only these mailboxes. */ only?: readonly string[]
  } = {}
): Promise<{ checked: number; changes: HealthChange[]; alerts: number }> {
  const now = deps.now ?? new Date()
  const capture = deps.capture ?? sentryCapture
  const rows = await opsDb.mailbox.findMany({
    ...(deps.only ? { where: { id: { in: [...deps.only] } } } : {}),
    select: {
      id: true,
      address: true,
      status: true,
      syncState: {
        select: {
          lastSuccessfulSyncAt: true,
          watchExpiresAt: true,
          watchError: true,
          dlqCount: true,
          backfillState: true,
          lagSeconds: true,
        },
      },
      _count: { select: { outbound: { where: { status: 'held', holdReason: 'cap' } } } },
    },
  })
  const [holidays, weekends] = await Promise.all([
    holidaysFor(['AE'], now, 2),
    getSetting('calendar.country_weekends'),
  ])
  const desk = isDeskHours(now, holidays, weekends)

  const changes: HealthChange[] = []
  let alerts = 0
  for (const m of rows) {
    const s = m.syncState
    const verdict = evaluateMailboxHealth({
      status: m.status,
      lastSuccessfulSyncAt: s?.lastSuccessfulSyncAt ?? null,
      watchExpiresAt: s?.watchExpiresAt ?? null,
      watchError: s?.watchError ?? null,
      dlqCount: s?.dlqCount ?? null,
      heldForCap: m._count.outbound,
      backfillPhase: (s?.backfillState as { phase?: string } | null)?.phase ?? null,
      now,
    })
    const local = `${m.address.split('@')[0]}@`
    if (verdict.next !== m.status) {
      const moved = await opsDb.mailbox.updateMany({
        where: { id: m.id, status: m.status },
        data: {
          status: verdict.next,
          statusReason: verdict.reasons.length ? `health: ${verdict.reasons.join(', ')}` : null,
        },
      })
      if (moved.count)
        changes.push({ mailboxId: m.id, address: m.address, from: m.status, to: verdict.next })
    }
    if (s && s.lagSeconds !== verdict.lagSeconds) {
      await opsDb.mailboxSyncState.update({
        where: { mailboxId: m.id },
        data: { lagSeconds: verdict.lagSeconds },
      })
    }

    const behind = verdict.next === 'behind'
    if (behind) {
      await raiseNotification({
        event: 'sync_error',
        severity: 'warning',
        title: `${local} is behind`,
        body: 'Google is slow to notify Operations about new mail. It is checked every 5 minutes.',
        dedupeKey: behindKey(m.id),
        actionUrl: '/settings/mailboxes',
        subjectType: 'mailbox',
        subjectId: m.id,
        audience: 'all',
      })
    } else if (verdict.next === 'live') {
      await resolveNotifications(behindKey(m.id))
    }
    if (verdict.next !== 'limit_reached' && m._count.outbound === 0) {
      await resolveNotificationsWithPrefix(`send_cap:${m.id}:`)
    }

    if (verdict.reasons.includes('watch_error')) {
      capture('Gmail watch renewal failed', { job: 'gmail.health', mailbox: local })
      alerts += 1
    }
    if (verdict.reasons.includes('no_sync') && desk && verdict.next !== 'limit_reached') {
      capture('No Gmail sync for 30 minutes', { job: 'gmail.health', mailbox: local })
      alerts += 1
    }
  }
  return { checked: rows.length, changes, alerts }
}
