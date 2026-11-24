import { z } from 'zod'

/**
 * Assistant log params (S06-T04, board 111): `?day=today|yesterday|week|YYYY-MM-DD`, `?record=` a reference,
 * `?action=` an action key, `?outcome=`, `?actor=assistant|<initials>`, `?cursor=` the next page. Anything
 * malformed falls back to the default.
 */
export const LOG_OUTCOMES = [
  'approved',
  'edited',
  'done',
  'rejected',
  'undone',
  'failed',
  'waiting',
] as const
export type LogOutcome = (typeof LOG_OUTCOMES)[number]

const schema = z.object({
  day: z
    .union([z.enum(['today', 'yesterday', 'week']), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
    .catch('today'),
  record: z.string().trim().max(40).optional().catch(undefined),
  action: z
    .string()
    .regex(/^[a-z_]{2,40}$/)
    .optional()
    .catch(undefined),
  outcome: z.enum(LOG_OUTCOMES).optional().catch(undefined),
  actor: z
    .union([z.literal('assistant'), z.string().regex(/^[A-Z]{1,4}$/)])
    .optional()
    .catch(undefined),
  cursor: z.string().max(200).optional().catch(undefined),
  open: z.uuid().optional().catch(undefined),
})

export type LogSearch = z.infer<typeof schema>

export function parseLogSearch(raw: Record<string, string | string[] | undefined>): LogSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return schema.parse({
    day: one(raw.day) ?? 'today',
    record: one(raw.record) || undefined,
    action: one(raw.action),
    outcome: one(raw.outcome),
    actor: one(raw.actor),
    cursor: one(raw.cursor),
    open: one(raw.open),
  })
}

export function logQuery(s: Partial<LogSearch>, over: Partial<LogSearch> = {}): string {
  const v = { ...s, ...over }
  const p = new URLSearchParams()
  if (v.day && v.day !== 'today') p.set('day', v.day)
  if (v.record) p.set('record', v.record)
  if (v.action) p.set('action', v.action)
  if (v.outcome) p.set('outcome', v.outcome)
  if (v.actor) p.set('actor', v.actor)
  if (v.cursor) p.set('cursor', v.cursor)
  if (v.open) p.set('open', v.open)
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

/** The [from, to) instants of a day choice, in Dubai (GST, UTC+4, no daylight saving). */
export function dayRange(
  day: LogSearch['day'],
  now: Date
): { from: Date; to: Date; label: string } {
  const DAY = 86_400_000
  const local = new Date(now.getTime() + 4 * 3_600_000)
  const midnight =
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 4 * 3_600_000
  // A fixed table: ICU writes "Sept" in some runtimes.
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const fmt = (ms: number) => {
    const d = new Date(ms + 4 * 3_600_000)
    return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
  }
  if (day === 'today')
    return {
      from: new Date(midnight),
      to: new Date(midnight + DAY),
      label: `Today · ${fmt(midnight)}`,
    }
  if (day === 'yesterday')
    return {
      from: new Date(midnight - DAY),
      to: new Date(midnight),
      label: `Yesterday · ${fmt(midnight - DAY)}`,
    }
  if (day === 'week')
    return { from: new Date(midnight - 6 * DAY), to: new Date(midnight + DAY), label: 'This week' }
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  const start = Date.UTC(y, m - 1, d) - 4 * 3_600_000
  return { from: new Date(start), to: new Date(start + DAY), label: fmt(start) }
}
