import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { isLockedEvent } from './locked-events'

/**
 * Raise an in-app notification (S04-T06 for the send queue; S04-T08 adds resolve and the locked events).
 *
 * One OPEN notification per (user, dedupeKey): the partial unique index `notification_open_dedupe_key` makes a
 * repeat a no-op until the first is resolved. Recipients: every active Owner (default), everyone active
 * (`'all'`), or the listed user ids (inactive ones skipped). A person who switched the event off gets nothing,
 * except for the locked events (locked-events.ts). Never throws: a notification that cannot be written is
 * logged, and the work that raised it carries on. S30 adds channels, quiet hours and push.
 */
export type RaiseInput = {
  event: $Enums.NotificationEvent
  severity?: $Enums.NotificationSeverity
  title: string
  body?: string
  dedupeKey: string
  actionUrl?: string
  subjectType?: $Enums.RecordType
  subjectId?: string
  enquiryId?: string
  audience?: 'owners' | 'all' | readonly string[]
}

export async function raiseNotification(input: RaiseInput): Promise<{ created: number }> {
  try {
    const audience = input.audience ?? 'owners'
    const users = await opsDb.user.findMany({
      where: {
        status: 'active',
        ...(audience === 'all'
          ? {}
          : audience === 'owners'
            ? { role: 'owner' as const }
            : { id: { in: [...audience] } }),
      },
      select: { id: true },
    })
    const muted = isLockedEvent(input.event)
      ? new Set<string>()
      : new Set(
          (
            await opsDb.notificationPreference.findMany({
              where: { event: input.event, channel: 'off', userId: { in: users.map((u) => u.id) } },
              select: { userId: true },
            })
          ).map((p) => p.userId)
        )
    let created = 0
    for (const u of users) {
      if (muted.has(u.id)) continue
      const open = await opsDb.notification.findFirst({
        where: { userId: u.id, dedupeKey: input.dedupeKey, resolvedAt: null },
        select: { id: true },
      })
      if (open) continue
      try {
        await opsDb.notification.create({
          data: {
            userId: u.id,
            event: input.event,
            severity: input.severity ?? 'warning',
            title: input.title,
            body: input.body ?? null,
            dedupeKey: input.dedupeKey,
            actionUrl: input.actionUrl ?? null,
            subjectType: input.subjectType ?? null,
            subjectId: input.subjectId ?? null,
            enquiryId: input.enquiryId ?? null,
            channels: ['in_app'],
          },
        })
        created += 1
      } catch (error) {
        // P2002: a concurrent raise won the partial unique index (one open notification is the point).
        // P2003: the user was removed between the read and the write. Either way, the next user still gets it.
        if (!(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2002' || error.code === 'P2003')
        ))
          throw error
      }
    }
    return { created }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { area: 'notify' },
      extra: { dedupeKey: input.dedupeKey },
    })
    return { created: 0 }
  }
}
