import 'server-only'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { encodeEvidenceId, SENDS_EXTERNALLY } from '@indus/ops-core'
import type { OpsUser } from '../lib/access-core'

/**
 * Record history (S06-T06, board 113): the field-level story of a record from `activity_event`: who changed
 * what, from what, to what, and why. One read serves an enquiry (its own rows and every row carrying its
 * enquiryId), a supplier and a client (company rows).
 *
 * Keyset by (at, id) desc, 50 a page. The strip count ("made 31 of the 47 changes") is one grouped query over
 * the same scope. Sensitive rows (margin, cost, sell) reach a Helper without "can see margins" as "Hidden":
 * masked here, so the value is never in the page.
 */
export const HISTORY_PAGE = 50

export type HistoryKindFilter = 'all' | 'money' | 'documents'

export interface HistoryScope {
  subjectType: $Enums.RecordType
  subjectId: string
  /** For an enquiry: every row stamped with it (lines, RFQs, quotes, quotation). */
  enquiryId?: string | null
}

export interface HistoryRow {
  id: string
  at: string
  /** "23 Sep", "10:12" (Dubai). */
  day: string
  time: string
  who: { assistant: true; ref: string | null } | { assistant: false; initials: string }
  field: string
  before: string
  after: string
  note: string | null
  kind: $Enums.ActivityKind
  /** Why? for this row: the action's field evidence, or the row itself. */
  evidenceId: string
  /** An Assistant row whose action is internal and still done: "Revert to before Assistant change". */
  revertible: boolean
  /** This row reverses another (S06-T07). */
  reverts: boolean
}

export interface HistoryPage {
  rows: HistoryRow[]
  nextCursor: string | null
  counts: { total: number; assistant: number }
}

type Viewer = Pick<OpsUser, 'role' | 'canSeeMargins'>

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const EXTERNAL = new Set<string>(SENDS_EXTERNALLY)

export function scopeWhere(scope: HistoryScope): Prisma.ActivityEventWhereInput {
  const own = { subjectType: scope.subjectType, subjectId: scope.subjectId }
  return scope.enquiryId ? { OR: [own, { enquiryId: scope.enquiryId }] } : own
}

export function kindWhere(kind: HistoryKindFilter): Prisma.ActivityEventWhereInput {
  return kind === 'money' ? { kind: 'money' } : kind === 'documents' ? { kind: 'documents' } : {}
}

function encodeCursor(at: Date, id: string): string {
  return Buffer.from(`${at.toISOString()}|${id}`).toString('base64url')
}

export function decodeCursor(c: string | undefined): { at: Date; id: string } | null {
  if (!c) return null
  try {
    const [iso, id] = Buffer.from(c, 'base64url').toString('utf8').split('|')
    const at = new Date(iso ?? '')
    return id && !Number.isNaN(at.getTime()) && /^[0-9a-f-]{36}$/.test(id) ? { at, id } : null
  } catch {
    return null
  }
}

/** A stored before/after value as the table prints it. */
export function shownValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'string') return v.replace(/_/g, ' ')
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return JSON.stringify(v)
}

/** "line.4.margin" → "Line 4 · margin"; "handledState" → "Handled state". */
export function fieldLabel(field: string | null): string {
  if (!field) return '—'
  const words = field
    .replace(/([A-Za-z])\.(\d+)/g, '$1 $2')
    .split('.')
    .map((p) => p.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase())
  const s = words.join(' · ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function listHistory(
  input: { scope: HistoryScope; kind: HistoryKindFilter; cursor?: string },
  viewer: Viewer
): Promise<HistoryPage> {
  const masked = viewer.role !== 'owner' && !viewer.canSeeMargins
  const base = scopeWhere(input.scope)
  const after = decodeCursor(input.cursor)
  const where: Prisma.ActivityEventWhereInput = {
    AND: [
      base,
      kindWhere(input.kind),
      ...(after
        ? [{ OR: [{ at: { lt: after.at } }, { at: after.at, id: { lt: after.id } }] }]
        : []),
    ],
  }
  const [rows, grouped] = await Promise.all([
    opsDb.activityEvent.findMany({
      where,
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      take: HISTORY_PAGE + 1,
    }),
    opsDb.activityEvent.groupBy({ by: ['actorKind'], where: base, _count: { _all: true } }),
  ])
  const page = rows.slice(0, HISTORY_PAGE)
  const actionIds = [...new Set(page.map((r) => r.actionId).filter((x): x is string => !!x))]
  const userIds = [...new Set(page.map((r) => r.actorId).filter((x): x is string => !!x))]
  const [actions, users] = await Promise.all([
    actionIds.length
      ? opsDb.assistantAction.findMany({
          where: { id: { in: actionIds } },
          select: { id: true, ref: true, actionKey: true, state: true },
        })
      : Promise.resolve([]),
    userIds.length
      ? opsDb.user.findMany({ where: { id: { in: userIds } }, select: { id: true, initials: true } })
      : Promise.resolve([]),
  ])
  const byAction = new Map(actions.map((a) => [a.id, a]))
  const initials = new Map(users.map((u) => [u.id, u.initials]))
  const reverted = new Set(page.map((r) => r.revertsEventId).filter((x): x is string => !!x))

  const total = grouped.reduce((n, g) => n + g._count._all, 0)
  const assistant = grouped.find((g) => g.actorKind === 'assistant')?._count._all ?? 0
  const last = page.at(-1)
  return {
    rows: page.map((r) => {
      const a = r.actionId ? byAction.get(r.actionId) : undefined
      const hide = masked && r.sensitive
      const isAssistant = r.actorKind === 'assistant'
      return {
        id: r.id,
        at: r.at.toISOString(),
        day: DAY.format(r.at),
        time: CLOCK.format(r.at),
        who: isAssistant
          ? { assistant: true, ref: a?.ref ?? null }
          : {
              assistant: false,
              initials:
                r.actorKind === 'user' ? (initials.get(r.actorId ?? '') ?? '—') : 'System',
            },
        field: fieldLabel(r.field),
        before: hide ? 'Hidden' : shownValue(r.before),
        after: hide ? 'Hidden' : shownValue(r.after),
        note: r.note,
        kind: r.kind,
        evidenceId:
          isAssistant && a
            ? encodeEvidenceId({ kind: 'field', ref: a.ref, field: r.field ?? 'value' })
            : encodeEvidenceId({ kind: 'event', eventId: r.id }),
        revertible:
          isAssistant &&
          !!a &&
          a.state === 'done' &&
          !EXTERNAL.has(a.actionKey) &&
          !reverted.has(r.id) &&
          !hide,
        reverts: !!r.revertsEventId,
      }
    }),
    nextCursor: rows.length > HISTORY_PAGE && last ? encodeCursor(last.at, last.id) : null,
    counts: { total, assistant },
  }
}

/** The enquiry's id for a ref (null until S09 writes enquiries; the page then shows an empty history). */
export async function enquiryIdForRef(ref: string): Promise<string | null> {
  const e = await opsDb.enquiry.findUnique({ where: { ref }, select: { id: true } })
  return e?.id ?? null
}
