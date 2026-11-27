import { describe, expect, it } from 'vitest'
import {
  ALL_ENQUIRY_STAGES,
  canTransition,
  ENQUIRY_STAGE_DISPLAY,
  enquiryEdges,
  enquiryStageWord,
  GROUP_TARGET_STAGE,
  groupOf,
  PIPELINE_GROUP_KEYS,
  PIPELINE_GROUPS,
  transition,
  TransitionRefused,
  type EnquiryStage,
  type EnquiryTransitionContext,
} from './enquiry'

/** §9.1 written out independently of ENQUIRY_RULES, with the facts each edge needs. */
const OPEN: EnquiryStage[] = [
  'new',
  'qualifying',
  'sourcing',
  'quotes_in',
  'pricing',
  'quoted',
  'negotiation',
]
const EXPECTED: Record<string, EnquiryTransitionContext> = {
  'new>qualifying': {},
  'new>sourcing': { chosenPath: 'quote_fully' },
  'qualifying>sourcing': { chosenPath: 'quote_partial' },
  'sourcing>quotes_in': {},
  'quotes_in>pricing': {},
  'pricing>quoted': { hasSentQuotation: true },
  'quoted>negotiation': {},
  'negotiation>pricing': {},
  'quotes_in>sourcing': { resource: true },
  'pricing>sourcing': { resource: true },
  'quoted>sourcing': { resource: true },
  'quoted>won': { hasSentQuotation: true, orderCreated: true },
  'negotiation>won': { hasSentQuotation: true, orderCreated: true },
  'quoted>lost': { lostReason: 'price' },
  'negotiation>lost': { lostReason: 'price' },
  ...Object.fromEntries(OPEN.map((s) => [`${s}>regretted`, { regretSent: true }])),
  ...Object.fromEntries(OPEN.map((s) => [`${s}>closed`, { closedReason: 'withdrawn_by_client' }])),
  'lost>qualifying': { actorRole: 'owner', reopen: true },
  'regretted>qualifying': { actorRole: 'owner', reopen: true },
  'closed>qualifying': { actorRole: 'owner', reopen: true },
}

/** Every fact switched on: the only refusals left are edges the table does not have. */
const ALL: EnquiryTransitionContext = {
  chosenPath: 'quote_fully',
  closedReason: 'other',
  lostReason: 'price',
  hasSentQuotation: true,
  orderCreated: true,
  regretSent: true,
  resource: true,
  actorRole: 'owner',
  reopen: true,
}

describe('enquiry machine (§9.1)', () => {
  const pairs = ALL_ENQUIRY_STAGES.flatMap((f) => ALL_ENQUIRY_STAGES.map((t) => [f, t] as const))

  it('covers all 121 pairs: the allowed set equals the table', () => {
    expect(pairs).toHaveLength(121)
    const allowed = pairs
      .filter(([f, t]) => canTransition(f, t, ALL).ok)
      .map(([f, t]) => `${f}>${t}`)
    expect(allowed.sort()).toEqual(Object.keys(EXPECTED).sort())
    expect(
      enquiryEdges()
        .map(([f, t]) => `${f}>${t}`)
        .sort()
    ).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(Object.entries(EXPECTED))('%s is allowed with its facts', (edge, ctx) => {
    const [f, t] = edge.split('>') as [EnquiryStage, EnquiryStage]
    expect(canTransition(f, t, ctx)).toEqual({ ok: true })
    expect(transition(f, t, ctx, 'why')).toEqual({
      kind: 'status',
      field: 'stage',
      before: f,
      after: t,
      reason: 'why',
    })
  })

  it.each(pairs.filter(([f, t]) => !EXPECTED[`${f}>${t}`]))(
    '%s → %s is refused with a reason',
    (f, t) => {
      const r = canTransition(f, t, ALL)
      expect(r.ok).toBe(false)
      if (r.ok) return
      if (f === t) expect(r.reason).toBe(`It is already ${ENQUIRY_STAGE_DISPLAY[t]}`)
      else if (f === 'won') expect(r.reason).toBe('A won enquiry carries on as its order')
      else if (t === 'won') expect(r.reason).toBe('Record the client PO first')
      else
        expect(r.reason).toBe(
          `${ENQUIRY_STAGE_DISPLAY[f]} cannot move to ${ENQUIRY_STAGE_DISPLAY[t]}`
        )
      expect(() => transition(f, t, ALL)).toThrow(TransitionRefused)
    }
  )

  it('guards refuse without their facts', () => {
    const refuse = (f: EnquiryStage, t: EnquiryStage, ctx: EnquiryTransitionContext) => {
      const r = canTransition(f, t, ctx)
      return r.ok ? null : r.reason
    }
    expect(refuse('new', 'sourcing', {})).toBe('Choose a path on the qualification card first')
    expect(refuse('qualifying', 'sourcing', { chosenPath: 'ask_client_first' })).toBe(
      'Choose a path on the qualification card first'
    )
    expect(refuse('pricing', 'quoted', {})).toBe('Send the quotation first')
    expect(refuse('quoted', 'sourcing', {})).toBe(
      'It goes back to Sourcing when a line is re-sourced or the client revises'
    )
    expect(refuse('quoted', 'won', {})).toBe('Send the quotation first')
    expect(refuse('negotiation', 'won', { hasSentQuotation: true })).toBe(
      'Record the client PO first'
    )
    expect(refuse('quoted', 'lost', {})).toBe('Say why it was lost')
    expect(refuse('sourcing', 'regretted', {})).toBe(
      'It is regretted when the regret email is sent'
    )
    expect(refuse('pricing', 'closed', {})).toBe('Say why it is closed')
    expect(refuse('new', 'closed', { closedReason: 'merged' })).toBe(
      'Choose the enquiry it merges into'
    )
    expect(refuse('new', 'closed', { closedReason: 'merged', mergedIntoId: 'x' })).toBeNull()
    expect(refuse('qualifying', 'closed', { closedReason: 'spam' })).toBeNull()
    expect(refuse('new', 'closed', { closedReason: 'duplicate' })).toBeNull()
    expect(refuse('sourcing', 'closed', { closedReason: 'spam' })).toBe(
      'Spam and duplicates are closed before sourcing starts'
    )
    expect(refuse('lost', 'qualifying', { actorRole: 'helper', reopen: true })).toBe(
      'Only the Owner reopens an enquiry'
    )
    expect(refuse('closed', 'qualifying', { actorRole: 'owner' })).toBe('Reopen it from the record')
    // The spam filing's own undo, inside its window, needs no reopen (board 171b state 3).
    expect(refuse('closed', 'qualifying', { actorRole: 'helper', undoSpam: true })).toBeNull()
  })

  it('transition() without a reason leaves it out', () => {
    expect(transition('new', 'qualifying')).toEqual({
      kind: 'status',
      field: 'stage',
      before: 'new',
      after: 'qualifying',
    })
  })
})

describe('pipeline groups (C7)', () => {
  it('maps every stage to its column; ended stages other than won have none', () => {
    expect(PIPELINE_GROUPS.map((g) => g.label)).toEqual([
      'Enquiry',
      'Sourcing',
      'Quotes in',
      'Quoted',
      'Negotiation',
      'Won',
    ])
    expect(ALL_ENQUIRY_STAGES.map((s) => [s, groupOf(s)])).toEqual([
      ['new', 'enquiry'],
      ['qualifying', 'enquiry'],
      ['sourcing', 'sourcing'],
      ['quotes_in', 'quotes_in'],
      ['pricing', 'quotes_in'],
      ['quoted', 'quoted'],
      ['negotiation', 'negotiation'],
      ['won', 'won'],
      ['lost', null],
      ['regretted', null],
      ['closed', null],
    ])
    expect(PIPELINE_GROUP_KEYS).toHaveLength(6)
    expect(GROUP_TARGET_STAGE.won).toBeNull()
    expect(enquiryStageWord('pricing')).toBe('Quotes in')
  })
})
