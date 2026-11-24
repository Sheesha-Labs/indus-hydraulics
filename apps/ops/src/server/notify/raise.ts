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
    // Set-based (S05-T08): one read of who already has it open, one insert for the rest. ON CONFLICT DO
    // NOTHING (skipDuplicates) covers a concurrent raise winning the partial unique index.
    const targets = users.map((u) => u.id).filter((id) => !muted.has(id))
    if (targets.length === 0) return { created: 0 }
    const open = new Set(
      (
        await opsDb.notification.findMany({
          where: { userId: { in: targets }, dedupeKey: input.dedupeKey, resolvedAt: null },
          select: { userId: true },
        })
      ).map((n) => n.userId)
    )
    const rows = targets
      .filter((id) => !open.has(id))
      .map((userId) => ({
        userId,
        event: input.event,
        severity: input.severity ?? ('warning' as const),
        title: input.title,
        body: input.body ?? null,
        dedupeKey: input.dedupeKey,
        actionUrl: input.actionUrl ?? null,
        subjectType: input.subjectType ?? null,
        subjectId: input.subjectId ?? null,
        enquiryId: input.enquiryId ?? null,
        channels: ['in_app' as const],
      }))
    if (rows.length === 0) return { created: 0 }
    let created = 0
    try {
      created = (await opsDb.notification.createMany({ data: rows, skipDuplicates: true })).count
    } catch (error) {
      // P2003: a user was removed between the read and the write. Fall back to one row at a time, so
      // everyone else still gets it.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'))
        throw error
      for (const row of rows) {
        try {
          await opsDb.notification.create({ data: row })
          created += 1
        } catch (e) {
          if (!(
            e instanceof Prisma.PrismaClientKnownRequestError &&
            (e.code === 'P2002' || e.code === 'P2003')
          ))
            throw e
        }
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
