import { z } from 'zod'
import type { HistoryKindFilter } from '../data/history'

/**
 * Board 113 search params: `?kind=money|documents` (All by default), `?cursor=` the next page, and on an
 * enquiry `?view=timeline|history`. Anything malformed falls back to the default.
 */
const schema = z.object({
  kind: z.enum(['all', 'money', 'documents']).catch('all').default('all'),
  cursor: z.string().max(200).optional().catch(undefined),
  view: z.enum(['timeline', 'history']).catch('history').default('history'),
})
export type HistorySearch = z.infer<typeof schema>

export function parseHistorySearch(
  raw: Record<string, string | string[] | undefined>
): HistorySearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return schema.parse({ kind: one(raw.kind), cursor: one(raw.cursor), view: one(raw.view) })
}

/** The query string for a history link; `extra` keeps a page's own params (a client's ?view=history). */
export function historyQuery(
  over: { kind?: HistoryKindFilter; cursor?: string; view?: 'timeline' | 'history' },
  extra: Record<string, string> = {}
): string {
  const p = new URLSearchParams(extra)
  if (over.view && over.view !== 'history') p.set('view', over.view)
  if (over.kind && over.kind !== 'all') p.set('kind', over.kind)
  if (over.cursor) p.set('cursor', over.cursor)
  const s = p.toString()
  return s ? `?${s}` : ''
}
