import { describe, expect, it } from 'vitest'
import { TransitionRefused } from './enquiry'
import {
  ALL_LINE_STATUSES,
  canTransitionLine,
  LINE_STATUS_DISPLAY,
  lineEdges,
  transitionLine,
  type LineStatus,
  type LineTransitionContext,
} from './line'

const NON_TERMINAL: LineStatus[] = [
  'open',
  'held',
  'sourcing',
  'quoted',
  'to_follow',
  'not_quoted',
  'no_source',
]
/** §9.2 (+ the S09 qualification regret from open/held), written out independently of LINE_RULES. */
const EXPECTED: Record<string, LineTransitionContext> = {
  'open>held': { heldReason: 'client question' },
  'held>open': {},
  'held>not_quoted': { notQuotedReason: 'Awaiting client answer' },
  'open>sourcing': {},
  'sourcing>quoted': {},
  'sourcing>no_source': {},
  'no_source>sourcing': {},
  'no_source>not_quoted': { notQuotedReason: 'x' },
  'sourcing>not_quoted': { notQuotedReason: 'x' },
  'not_quoted>sourcing': {},
  'sourcing>to_follow': {},
  'no_source>to_follow': {},
  'to_follow>quoted': {},
  'to_follow>to_follow': { extendTo: '2026-10-01' },
  'to_follow>regretted': { regretReason: 'no_source_found' },
  'no_source>regretted': { regretReason: 'no_source_found' },
  'open>regretted': { regretReason: 'not_our_range' },
  'held>regretted': { regretReason: 'not_our_range' },
  'quoted>sourcing': { staleReason: 'quantity_changed_awaiting_revision' },
  ...Object.fromEntries(NON_TERMINAL.map((s) => [`${s}>cancelled`, {}])),
}
const ALL: LineTransitionContext = {
  heldReason: 'q',
  regretReason: 'other',
  notQuotedReason: 'r',
  staleReason: 's',
  extendTo: '2026-10-01',
}

describe('line machine (§9.2)', () => {
  const pairs = ALL_LINE_STATUSES.flatMap((f) => ALL_LINE_STATUSES.map((t) => [f, t] as const))

  it('covers all 81 pairs: the allowed set equals the table', () => {
    expect(pairs).toHaveLength(81)
    const allowed = pairs
      .filter(([f, t]) => canTransitionLine(f, t, ALL).ok)
      .map(([f, t]) => `${f}>${t}`)
    expect(allowed.sort()).toEqual(Object.keys(EXPECTED).sort())
    expect(
      lineEdges()
        .map(([f, t]) => `${f}>${t}`)
        .sort()
    ).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(Object.entries(EXPECTED))('%s is allowed with its facts', (edge, ctx) => {
    const [f, t] = edge.split('>') as [LineStatus, LineStatus]
    expect(canTransitionLine(f, t, ctx)).toEqual({ ok: true })
    expect(transitionLine(f, t, ctx)).toEqual({
      kind: 'status',
      field: 'status',
      before: f,
      after: t,
    })
    expect(transitionLine(f, t, ctx, 'r').reason).toBe('r')
  })

  it.each(pairs.filter(([f, t]) => !EXPECTED[`${f}>${t}`]))('%s → %s is refused', (f, t) => {
    const r = canTransitionLine(f, t, ALL)
    expect(r.ok).toBe(false)
    if (r.ok) return
    if (f === 'regretted' || f === 'cancelled')
      expect(r.reason).toBe(`A ${LINE_STATUS_DISPLAY[f].toLowerCase()} line does not change`)
    else if (f === t) expect(r.reason).toBe(`It is already ${LINE_STATUS_DISPLAY[t]}`)
    else expect(r.reason).toBe(`${LINE_STATUS_DISPLAY[f]} cannot move to ${LINE_STATUS_DISPLAY[t]}`)
    expect(() => transitionLine(f, t, ALL)).toThrow(TransitionRefused)
  })

  it('guards refuse without their facts', () => {
    const reason = (f: LineStatus, t: LineStatus) => {
      const r = canTransitionLine(f, t, {})
      return r.ok ? null : r.reason
    }
    expect(reason('open', 'held')).toBe('Say what the line waits for')
    expect(reason('held', 'not_quoted')).toBe('Say why it is not quoted')
    expect(reason('sourcing', 'not_quoted')).toBe('Say why it is not quoted')
    expect(reason('to_follow', 'to_follow')).toBe('Choose the new date')
    expect(reason('no_source', 'regretted')).toBe('Choose a regret reason')
    expect(reason('quoted', 'sourcing')).toBe(
      'A quoted line goes back to sourcing when its quantity or spec changes'
    )
  })
})
