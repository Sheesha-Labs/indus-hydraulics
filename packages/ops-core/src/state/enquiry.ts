import { ENQUIRY_STAGE_WORD, ENQUIRY_STAGES, type EnquiryStage } from './labels'

/**
 * The enquiry stage machine (06-map-schema §9.1, 10-architecture §4.4). Pure: every write of `enquiry.stage`
 * goes through `apps/ops/src/server/enquiry/transition.ts`, which asks `canTransition` first and records the
 * `transition()` draft as one activity event.
 *
 *   (create) → new
 *   new → qualifying                                  qualification card computed
 *   new | qualifying → sourcing                       chosenPath quote_fully | quote_partial
 *   sourcing → quotes_in → pricing → quoted           first quote, first draft, first quotation sent
 *   quoted → negotiation → pricing                    client asks for changes; revision started
 *   quotes_in | pricing | quoted → sourcing           a client revision applied or a line re-sourced
 *   quoted | negotiation → won                        a sent quotation and the order created (PO check)
 *   quoted | negotiation → lost                       lostReason
 *   new … negotiation → regretted                     the whole-enquiry regret email sent
 *   new … negotiation → closed                        closedReason (spam and duplicate only before sourcing;
 *                                                     merged needs mergedIntoId)
 *   lost | regretted | closed → qualifying            the Owner reopens; never automatic
 *
 * `won` is terminal for the enquiry; the order carries on.
 */

export type { EnquiryStage }

export type QualificationPathValue =
  'quote_fully' | 'quote_partial' | 'ask_client_first' | 'regret' | 'no_source' | 'ignore_spam'

export type EnquiryClosedReason = 'merged' | 'duplicate' | 'spam' | 'withdrawn_by_client' | 'other'

export interface EnquiryTransitionContext {
  /** The path a person chose on the qualification card (167). */
  chosenPath?: QualificationPathValue | null
  closedReason?: EnquiryClosedReason | null
  mergedIntoId?: string | null
  lostReason?: string | null
  /** A quotation of this enquiry is sent, viewed or evaluating. */
  hasSentQuotation?: boolean
  /** The PO check completed and the order exists (69). */
  orderCreated?: boolean
  /** The whole-enquiry regret email reached `sent` (168). */
  regretSent?: boolean
  /** A client revision applied or a line re-sourced: the reason a later stage goes back to sourcing. */
  resource?: boolean
  actorRole?: 'owner' | 'helper' | 'assistant' | 'system'
  /** A person asked to reopen (lost, regretted, closed → qualifying). */
  reopen?: boolean
  /**
   * S09-T06: "Undo · treat as enquiry" inside the 5-minute window after a person filed it as spam on the
   * qualification card. Anyone who may choose a path may undo their choice; after the window it is a reopen.
   */
  undoSpam?: boolean
}

export type TransitionCheck = { ok: true } | { ok: false; reason: string }

export interface ActivityEventDraft {
  kind: 'status'
  field: 'stage' | 'status'
  before: string
  after: string
  reason?: string
}

/** Stages before a decision: a regret or a close can still happen. */
export const ENQUIRY_OPEN_STAGES = [
  'new',
  'qualifying',
  'sourcing',
  'quotes_in',
  'pricing',
  'quoted',
  'negotiation',
] as const satisfies readonly EnquiryStage[]

export const ENQUIRY_ENDED_STAGES = [
  'won',
  'lost',
  'regretted',
  'closed',
] as const satisfies readonly EnquiryStage[]

type Guard = (ctx: EnquiryTransitionContext) => string | null

interface Rule {
  from: readonly EnquiryStage[]
  to: EnquiryStage
  guard?: Guard
}

const SOURCING_PATHS: readonly QualificationPathValue[] = ['quote_fully', 'quote_partial']
const EARLY: readonly EnquiryStage[] = ['new', 'qualifying']

/** The rules as data, one per row of §9.1. Exported for the coverage test. */
export const ENQUIRY_RULES: readonly Rule[] = [
  { from: ['new'], to: 'qualifying' },
  {
    from: ['new', 'qualifying'],
    to: 'sourcing',
    guard: (c) =>
      c.chosenPath && SOURCING_PATHS.includes(c.chosenPath)
        ? null
        : 'Choose a path on the qualification card first',
  },
  { from: ['sourcing'], to: 'quotes_in' },
  { from: ['quotes_in'], to: 'pricing' },
  {
    from: ['pricing'],
    to: 'quoted',
    guard: (c) => (c.hasSentQuotation ? null : 'Send the quotation first'),
  },
  { from: ['quoted'], to: 'negotiation' },
  { from: ['negotiation'], to: 'pricing' },
  {
    from: ['quotes_in', 'pricing', 'quoted'],
    to: 'sourcing',
    guard: (c) =>
      c.resource
        ? null
        : 'It goes back to Sourcing when a line is re-sourced or the client revises',
  },
  {
    from: ['quoted', 'negotiation'],
    to: 'won',
    guard: (c) =>
      !c.hasSentQuotation
        ? 'Send the quotation first'
        : c.orderCreated
          ? null
          : 'Record the client PO first',
  },
  {
    from: ['quoted', 'negotiation'],
    to: 'lost',
    guard: (c) => (c.lostReason ? null : 'Say why it was lost'),
  },
  {
    from: ENQUIRY_OPEN_STAGES,
    to: 'regretted',
    guard: (c) => (c.regretSent ? null : 'It is regretted when the regret email is sent'),
  },
  {
    from: ENQUIRY_OPEN_STAGES,
    to: 'closed',
    guard: closeGuard,
  },
  {
    from: ['lost', 'regretted', 'closed'],
    to: 'qualifying',
    guard: (c) =>
      c.undoSpam
        ? null
        : c.actorRole !== 'owner'
          ? 'Only the Owner reopens an enquiry'
          : c.reopen
            ? null
            : 'Reopen it from the record',
  },
]

function closeGuard(c: EnquiryTransitionContext): string | null {
  if (!c.closedReason) return 'Say why it is closed'
  if (c.closedReason === 'merged' && !c.mergedIntoId) return 'Choose the enquiry it merges into'
  return null
}

const BY_EDGE = new Map<string, Rule>()
for (const r of ENQUIRY_RULES) for (const f of r.from) BY_EDGE.set(`${f}>${r.to}`, r)

/** The edges the table allows (guards aside). */
export function enquiryEdges(): ReadonlyArray<readonly [EnquiryStage, EnquiryStage]> {
  return [...BY_EDGE.keys()].map((k) => k.split('>') as [EnquiryStage, EnquiryStage])
}

const word = (s: EnquiryStage) => ENQUIRY_STAGE_DISPLAY[s]

/** The stored stage as a person reads it in a sentence (finer than the track's C7 groups). */
export const ENQUIRY_STAGE_DISPLAY = {
  new: 'New',
  qualifying: 'Qualifying',
  sourcing: 'Sourcing',
  quotes_in: 'Quotes in',
  pricing: 'Pricing',
  quoted: 'Quoted',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  regretted: 'Regretted',
  closed: 'Closed',
} as const satisfies Record<EnquiryStage, string>

/** Whether `from → to` is allowed with these facts, and the person-facing reason when it is not. */
export function canTransition(
  from: EnquiryStage,
  to: EnquiryStage,
  ctx: EnquiryTransitionContext = {}
): TransitionCheck {
  if (from === to) return { ok: false, reason: `It is already ${word(to)}` }
  if (from === 'won') return { ok: false, reason: 'A won enquiry carries on as its order' }
  // Spam and duplicates close at qualification, before anything is sourced (§9.1 qualifying → closed).
  if (
    to === 'closed' &&
    (ctx.closedReason === 'spam' || ctx.closedReason === 'duplicate') &&
    !EARLY.includes(from)
  )
    return { ok: false, reason: 'Spam and duplicates are closed before sourcing starts' }
  const rule = BY_EDGE.get(`${from}>${to}`)
  if (!rule) {
    if (to === 'won') return { ok: false, reason: 'Record the client PO first' }
    return { ok: false, reason: `${word(from)} cannot move to ${word(to)}` }
  }
  const reason = rule.guard?.(ctx) ?? null
  return reason ? { ok: false, reason } : { ok: true }
}

export class TransitionRefused extends Error {
  constructor(
    readonly from: string,
    readonly to: string,
    readonly reason: string
  ) {
    super(reason)
    this.name = 'TransitionRefused'
  }
}

/** The activity-event draft for an allowed move; throws `TransitionRefused` when the machine refuses. */
export function transition(
  from: EnquiryStage,
  to: EnquiryStage,
  ctx: EnquiryTransitionContext = {},
  reason?: string
): ActivityEventDraft {
  const c = canTransition(from, to, ctx)
  if (!c.ok) throw new TransitionRefused(from, to, c.reason)
  return { kind: 'status', field: 'stage', before: from, after: to, ...(reason ? { reason } : {}) }
}

// ── C7: the pipeline's display groups over the stored enum ──────────────────────────────────────────

export const PIPELINE_GROUPS = [
  { key: 'enquiry', label: 'Enquiry', stages: ['new', 'qualifying'] },
  { key: 'sourcing', label: 'Sourcing', stages: ['sourcing'] },
  { key: 'quotes_in', label: 'Quotes in', stages: ['quotes_in', 'pricing'] },
  { key: 'quoted', label: 'Quoted', stages: ['quoted'] },
  { key: 'negotiation', label: 'Negotiation', stages: ['negotiation'] },
  { key: 'won', label: 'Won', stages: ['won'] },
] as const satisfies ReadonlyArray<{ key: string; label: string; stages: readonly EnquiryStage[] }>

export type PipelineGroupKey = (typeof PIPELINE_GROUPS)[number]['key']
export const PIPELINE_GROUP_KEYS = PIPELINE_GROUPS.map((g) => g.key) as readonly PipelineGroupKey[]

/** The pipeline column a stage sits in; ended stages other than won have no column. */
export function groupOf(stage: EnquiryStage): PipelineGroupKey | null {
  for (const g of PIPELINE_GROUPS) if ((g.stages as readonly string[]).includes(stage)) return g.key
  return null
}

/**
 * The concrete stage a drag to a column asks for (T02). Won has none: winning goes through the PO check,
 * never a drag. Enquiry asks for qualifying (a reopen when the enquiry had ended).
 */
export const GROUP_TARGET_STAGE = {
  enquiry: 'qualifying',
  sourcing: 'sourcing',
  quotes_in: 'quotes_in',
  quoted: 'quoted',
  negotiation: 'negotiation',
  won: null,
} as const satisfies Record<PipelineGroupKey, EnquiryStage | null>

/** Every stored stage, for exhaustive tests. */
export const ALL_ENQUIRY_STAGES: readonly EnquiryStage[] = ENQUIRY_STAGES

/** The track word (C7) for a stored stage. */
export const enquiryStageWord = (s: EnquiryStage) => ENQUIRY_STAGE_WORD[s]
