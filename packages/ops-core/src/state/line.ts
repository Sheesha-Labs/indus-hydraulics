import type { ActivityEventDraft, TransitionCheck } from './enquiry'
import { TransitionRefused } from './enquiry'
import { LINE_STATUSES, type LineStatus } from './labels'

/**
 * The enquiry-line status machine (06-map-schema §9.2). Pure; `changeLineStatus` in
 * `apps/ops/src/server/enquiry/transition.ts` is the only writer of `enquiry_line.status`.
 *
 *   (create) → open
 *   open ⇄ held                                  a client question raised (171) / answered or assumed
 *   held → not_quoted                            "Leave the lines out"
 *   open → sourcing                              an RFQ carrying the line is sent
 *   sourcing → quoted                            a confirmed quote line priced
 *   sourcing → no_source → sourcing              nobody can supply / widened or a new supplier
 *   no_source | sourcing → not_quoted            "Quote as Not quoted"
 *   not_quoted → sourcing                        reopened
 *   sourcing | no_source → to_follow             quotation sent with "price to follow"
 *   to_follow → quoted                           the price arrives
 *   to_follow → to_follow                        "5 more working days" (extension)
 *   to_follow | no_source → regretted            line regret sent, regretReason required
 *   open | held → regretted                      (S09 decision) a line regret chosen at qualification,
 *                                                before anything is sourced (board 167 "quote what we
 *                                                can, regret the rest"), regretReason required
 *   quoted → sourcing                            quantity or spec changed (staleReason)
 *   any non-terminal → cancelled                 the client dropped the line
 *
 * Terminal: regretted, cancelled.
 */

export type { LineStatus }

export type LineRegretReasonValue =
  | 'not_our_range'
  | 'no_source_found'
  | 'obsolete'
  | 'client_dropped'
  | 'deadline_too_short'
  | 'client_unresponsive'
  | 'other'

export interface LineTransitionContext {
  heldReason?: string | null
  regretReason?: LineRegretReasonValue | null
  notQuotedReason?: string | null
  /** quoted → sourcing: why the captured quotes went stale (quantity_changed_awaiting_revision …). */
  staleReason?: string | null
  /** to_follow → to_follow: the new give-up date. */
  extendTo?: string | null
}

export const LINE_TERMINAL: readonly LineStatus[] = ['regretted', 'cancelled']
export const LINE_NON_TERMINAL: readonly LineStatus[] = LINE_STATUSES.filter(
  (s) => !LINE_TERMINAL.includes(s)
)

type Guard = (c: LineTransitionContext) => string | null

const needRegret: Guard = (c) => (c.regretReason ? null : 'Choose a regret reason')

interface Rule {
  from: readonly LineStatus[]
  to: LineStatus
  guard?: Guard
}

export const LINE_RULES: readonly Rule[] = [
  {
    from: ['open'],
    to: 'held',
    guard: (c) => (c.heldReason ? null : 'Say what the line waits for'),
  },
  { from: ['held'], to: 'open' },
  {
    from: ['held'],
    to: 'not_quoted',
    guard: (c) => (c.notQuotedReason ? null : 'Say why it is not quoted'),
  },
  { from: ['open'], to: 'sourcing' },
  { from: ['sourcing'], to: 'quoted' },
  { from: ['sourcing'], to: 'no_source' },
  { from: ['no_source'], to: 'sourcing' },
  {
    from: ['no_source', 'sourcing'],
    to: 'not_quoted',
    guard: (c) => (c.notQuotedReason ? null : 'Say why it is not quoted'),
  },
  { from: ['not_quoted'], to: 'sourcing' },
  { from: ['sourcing', 'no_source'], to: 'to_follow' },
  { from: ['to_follow'], to: 'quoted' },
  {
    from: ['to_follow'],
    to: 'to_follow',
    guard: (c) => (c.extendTo ? null : 'Choose the new date'),
  },
  { from: ['to_follow', 'no_source', 'open', 'held'], to: 'regretted', guard: needRegret },
  {
    from: ['quoted'],
    to: 'sourcing',
    guard: (c) =>
      c.staleReason
        ? null
        : 'A quoted line goes back to sourcing when its quantity or spec changes',
  },
  { from: LINE_NON_TERMINAL, to: 'cancelled' },
]

const BY_EDGE = new Map<string, Rule>()
for (const r of LINE_RULES) for (const f of r.from) BY_EDGE.set(`${f}>${r.to}`, r)

export function lineEdges(): ReadonlyArray<readonly [LineStatus, LineStatus]> {
  return [...BY_EDGE.keys()].map((k) => k.split('>') as [LineStatus, LineStatus])
}

export const LINE_STATUS_DISPLAY = {
  open: 'Open',
  held: 'On hold',
  sourcing: 'Sourcing',
  quoted: 'Quoted',
  to_follow: 'To follow',
  not_quoted: 'Not quoted',
  no_source: 'No source',
  regretted: 'Regretted',
  cancelled: 'Cancelled',
} as const satisfies Record<LineStatus, string>

export function canTransitionLine(
  from: LineStatus,
  to: LineStatus,
  ctx: LineTransitionContext = {}
): TransitionCheck {
  if (LINE_TERMINAL.includes(from))
    return {
      ok: false,
      reason: `A ${LINE_STATUS_DISPLAY[from].toLowerCase()} line does not change`,
    }
  const rule = BY_EDGE.get(`${from}>${to}`)
  if (!rule)
    return from === to
      ? { ok: false, reason: `It is already ${LINE_STATUS_DISPLAY[to]}` }
      : {
          ok: false,
          reason: `${LINE_STATUS_DISPLAY[from]} cannot move to ${LINE_STATUS_DISPLAY[to]}`,
        }
  const reason = rule.guard?.(ctx) ?? null
  return reason ? { ok: false, reason } : { ok: true }
}

export function transitionLine(
  from: LineStatus,
  to: LineStatus,
  ctx: LineTransitionContext = {},
  reason?: string
): ActivityEventDraft {
  const c = canTransitionLine(from, to, ctx)
  if (!c.ok) throw new TransitionRefused(from, to, c.reason)
  return { kind: 'status', field: 'status', before: from, after: to, ...(reason ? { reason } : {}) }
}

export const ALL_LINE_STATUSES: readonly LineStatus[] = LINE_STATUSES
