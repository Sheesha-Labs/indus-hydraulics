import { listHistory, type HistoryScope } from '../../data/history'
import type { OpsUser } from '../../lib/access-core'
import { historyQuery, type HistorySearch } from '../../lib/history-params'
import RecordHistory from './RecordHistory'

/**
 * Board 113 mounted in a record (S06-T06): reads one page of the record's history and draws RecordHistory
 * with links that keep the page's own params. `scope` is null when the record is not in the database yet
 * (enquiries before S09): the empty history, with no query.
 */
export default async function HistoryTab({
  scope,
  noun,
  path,
  search,
  user,
  exportPath,
  keep = {},
  timeline = false,
}: {
  scope: HistoryScope | null
  noun: string
  /** The page's path, e.g. /enquiries/ENQ-2026-0001/activity. */
  path: string
  search: HistorySearch
  user: OpsUser
  /** /api/records/<type>/<id>/history/export */
  exportPath: string
  /** Params the page itself needs on every link (a client page's view=history). */
  keep?: Record<string, string>
  /** Show the Timeline | History toggle (the enquiry's Activity tab). */
  timeline?: boolean
}) {
  const page = scope
    ? await listHistory(
        { scope, kind: search.kind, ...(search.cursor ? { cursor: search.cursor } : {}) },
        user
      )
    : { rows: [], nextCursor: null, counts: { total: 0, assistant: 0 } }
  const owner = user.role === 'owner'
  return (
    <RecordHistory
      page={page}
      noun={noun}
      kind={search.kind}
      hrefFor={(k) => `${path}${historyQuery({ kind: k }, keep)}`}
      olderHref={
        page.nextCursor
          ? `${path}${historyQuery({ kind: search.kind, cursor: page.nextCursor }, keep)}`
          : null
      }
      {...(timeline
        ? {
            view: {
              hrefFor: (v: 'timeline' | 'history') => `${path}${historyQuery({ view: v }, keep)}`,
            },
          }
        : {})}
      exportHref={owner && scope ? `${exportPath}${historyQuery({ kind: search.kind })}` : null}
    />
  )
}
