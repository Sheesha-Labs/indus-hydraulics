import 'server-only'
import { opsDb, type $Enums } from '@indus/ops-db'
import * as Sentry from '@sentry/nextjs'
import { settingSubjectId } from '../settings/subject-id'
import {
  fieldLabel,
  kindWhere,
  scopeWhere,
  shownValue,
  type HistoryKindFilter,
  type HistoryScope,
} from '../../data/history'

/**
 * Board 113 "Export history" (Owner): the record's history as CSV under the current filter, 500 rows per
 * database page, streamed. Records who exported which record. The Owner check is the route's.
 */
const PAGE = 500
const HEADER = ['time', 'who', 'action_ref', 'field', 'before', 'after', 'note', 'kind']

function cell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function recordHistoryExport(
  user: { id: string; initials: string },
  scope: HistoryScope,
  label: string
): Promise<void> {
  // Logged against the export setting, not the record: an export is not a change to the record's history.
  await opsDb.activityEvent.create({
    data: {
      actorKind: 'user',
      actorId: user.id,
      subjectType: 'settings',
      subjectId: settingSubjectId('records.history'),
      kind: 'settings',
      field: 'export',
      note: `${user.initials} exported the history of ${label} (${scope.subjectType} ${scope.subjectId})`,
    },
  })
}

export function historyCsvStream(
  scope: HistoryScope,
  kind: HistoryKindFilter
): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  const where = { AND: [scopeWhere(scope), kindWhere(kind)] }
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(enc.encode(`${HEADER.join(',')}\n`))
        const users = await opsDb.user.findMany({ select: { id: true, initials: true } })
        const refs = new Map<string, string>()
        const initials = new Map(users.map((u) => [u.id, u.initials]))
        let cursor: { at: Date; id: string } | null = null
        for (;;) {
          const page: Array<{
            id: string
            at: Date
            actorKind: $Enums.ActorKind
            actorId: string | null
            actionId: string | null
            field: string | null
            before: unknown
            after: unknown
            note: string | null
            kind: $Enums.ActivityKind
          }> = await opsDb.activityEvent.findMany({
            where: cursor
              ? {
                  AND: [
                    where,
                    { OR: [{ at: { lt: cursor.at } }, { at: cursor.at, id: { lt: cursor.id } }] },
                  ],
                }
              : where,
            orderBy: [{ at: 'desc' }, { id: 'desc' }],
            take: PAGE,
          })
          const missing = [
            ...new Set(page.map((r) => r.actionId).filter((x): x is string => !!x && !refs.has(x))),
          ]
          if (missing.length) {
            for (const a of await opsDb.assistantAction.findMany({
              where: { id: { in: missing } },
              select: { id: true, ref: true },
            }))
              refs.set(a.id, a.ref)
          }
          for (const r of page) {
            const line = [
              r.at.toISOString(),
              r.actorKind === 'assistant'
                ? 'Assistant'
                : r.actorKind === 'user'
                  ? (initials.get(r.actorId ?? '') ?? '')
                  : 'System',
              r.actionId ? (refs.get(r.actionId) ?? '') : '',
              fieldLabel(r.field),
              shownValue(r.before),
              shownValue(r.after),
              r.note,
              r.kind,
            ]
              .map(cell)
              .join(',')
            controller.enqueue(enc.encode(`${line}\n`))
          }
          const last = page.at(-1)
          if (page.length < PAGE || !last) break
          cursor = { at: last.at, id: last.id }
        }
        controller.close()
      } catch (e) {
        Sentry.captureException(e)
        controller.error(e)
      }
    },
  })
}
