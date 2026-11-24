import 'server-only'
import { opsDb } from '@indus/ops-db'
import * as Sentry from '@sentry/nextjs'
import { logWhere } from '../../data/assistant-log'
import { dayRange, type LogSearch } from '../../lib/log-params'
import { settingSubjectId } from '../settings/subject-id'

/**
 * The Assistant log as CSV (S06-T04): the current filters, 500 rows per database page, streamed. Records who
 * exported which range. The Owner check is the route's.
 */
const PAGE = 500
const HEADER = [
  'time',
  'kind',
  'actor',
  'action_ref',
  'action_key',
  'headline',
  'record',
  'level',
  'outcome',
  'cost_usd',
]

function cell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function recordExport(
  user: { id: string; initials: string },
  search: LogSearch,
  now: Date
): Promise<void> {
  await opsDb.activityEvent.create({
    data: {
      actorKind: 'user',
      actorId: user.id,
      subjectType: 'settings',
      subjectId: settingSubjectId('assistant.log'),
      kind: 'settings',
      field: 'export',
      note: `${user.initials} exported the Assistant log (${dayRange(search.day, now).label})`,
    },
  })
}

export function logCsvStream(search: LogSearch, now: Date): ReadableStream<Uint8Array> {
  const where = logWhere(search, now)
  const enc = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(enc.encode(`${HEADER.join(',')}\n`))
        let cursor: { at: Date; id: string } | null = null
        for (;;) {
          const page: Awaited<ReturnType<typeof opsDb.assistantLogEntry.findMany>> =
            await opsDb.assistantLogEntry.findMany({
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
          for (const r of page) {
            const line = [
              r.at.toISOString(),
              r.kind,
              r.kind === 'action' ? 'Assistant' : (r.actorInitials ?? ''),
              r.actionRef,
              r.actionKey,
              r.headline,
              r.enquiryRef,
              r.level,
              r.outcome,
              r.kind === 'action' ? Number(r.costUsd).toFixed(6) : '',
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
