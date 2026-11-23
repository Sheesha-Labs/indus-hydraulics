import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'

/**
 * Raise an in-app notification (S04-T06 for the send queue; S04-T08 adds resolve and the locked events).
 *
 * One OPEN notification per (user, dedupeKey): the partial unique index `notification_open_dedupe_key` makes a
 * repeat a no-op until the first is resolved. Recipients default to every active Owner; `audience: 'all'` adds
 * active Helpers. Never throws: a notification that cannot be written is logged, and the work that raised it
 * carries on.
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
  audience?: 'owners' | 'all'
}

export async function raiseNotification(input: RaiseInput): Promise<{ created: number }> {
  try {
    const users = await opsDb.user.findMany({
      where: {
        status: 'active',
        ...(input.audience === 'all' ? {} : { role: 'owner' as const }),
      },
      select: { id: true },
    })
    let created = 0
    for (const u of users) {
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

/** Resolve every open notification with this key (the thing it reported has been dealt with). */
export async function resolveNotifications(dedupeKey: string): Promise<number> {
  const { count } = await opsDb.notification.updateMany({
    where: { dedupeKey, resolvedAt: null },
    data: { resolvedAt: new Date() },
  })
  return count
}
