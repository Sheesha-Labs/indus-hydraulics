import { z } from 'zod'

/**
 * Board 04 URL state (S09-T02, 05 §7.4): the view, the table's filter, owner, search, sort and page. Parsed
 * from the awaited searchParams; a bad value falls back instead of failing the page. Chips and sort headers
 * are links built from it, so a refresh or a shared link keeps the state.
 */
export const ENQUIRY_GROUPS = [
  'enquiry',
  'sourcing',
  'quotes_in',
  'quoted',
  'negotiation',
  'won',
  'ended',
] as const
export type EnquiryGroupParam = (typeof ENQUIRY_GROUPS)[number]

export const ENQUIRY_SORTS = ['deadline', 'received', 'value'] as const
export type EnquirySort = (typeof ENQUIRY_SORTS)[number]

const one = (v: unknown) => (Array.isArray(v) ? v[0] : v)

const schema = z.object({
  view: z.enum(['board', 'table']).catch('board'),
  stage: z.enum(ENQUIRY_GROUPS).optional().catch(undefined),
  owner: z
    .string()
    .regex(/^[a-z]{2,3}$/)
    .optional()
    .catch(undefined),
  q: z.string().trim().min(1).max(80).optional().catch(undefined),
  sort: z.enum(ENQUIRY_SORTS).catch('deadline'),
  dir: z.enum(['asc', 'desc']).optional().catch(undefined),
  cursor: z
    .string()
    .max(1024)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional()
    .catch(undefined),
})

export type EnquiriesSearch = z.infer<typeof schema> & { dir: 'asc' | 'desc' }

/** Deadline and received read soonest/newest first by default; value largest first. */
const DEFAULT_DIR: Record<EnquirySort, 'asc' | 'desc'> = {
  deadline: 'asc',
  received: 'desc',
  value: 'desc',
}

export function parseEnquiriesSearch(
  raw: Record<string, string | string[] | undefined>
): EnquiriesSearch {
  const s = schema.parse({
    view: one(raw.view),
    stage: one(raw.stage),
    owner: one(raw.owner),
    q: one(raw.q),
    sort: one(raw.sort),
    dir: one(raw.dir),
    cursor: one(raw.cursor),
  })
  return { ...s, dir: s.dir ?? DEFAULT_DIR[s.sort] }
}

/** A link to the index with `over` applied; a change of filter or sort drops the page cursor. */
export function enquiriesHref(
  s: Partial<EnquiriesSearch>,
  over: Partial<Record<keyof EnquiriesSearch, string | undefined>> = {}
): string {
  const v: Record<string, string | undefined> = {
    view: s.view,
    stage: s.stage,
    owner: s.owner,
    q: s.q,
    sort: s.sort,
    dir: s.dir,
    cursor: s.cursor,
    ...over,
  }
  if (!('cursor' in over)) delete v.cursor
  const p = new URLSearchParams()
  if (v.view && v.view !== 'board') p.set('view', v.view)
  if (v.stage) p.set('stage', v.stage)
  if (v.owner) p.set('owner', v.owner)
  if (v.q) p.set('q', v.q)
  if (v.view === 'table') {
    if (v.sort && v.sort !== 'deadline') p.set('sort', v.sort)
    if (v.dir && v.sort && v.dir !== DEFAULT_DIR[v.sort as EnquirySort]) p.set('dir', v.dir)
    if (v.cursor) p.set('cursor', v.cursor)
  }
  const qs = p.toString()
  return qs ? `/enquiries?${qs}` : '/enquiries'
}
