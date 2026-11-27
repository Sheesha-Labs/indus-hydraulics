import type { ActivityEventDraft, TransitionCheck } from './enquiry'
import { TransitionRefused } from './enquiry'

/**
 * The lead machine (S09-T01, boards 03 and 22). A lead is a company with a requirement and no formal RFQ yet.
 *
 *   new → contacted → qualified
 *   new | contacted | qualified → converted      convert to enquiry (23): needs the enquiry id
 *   new | contacted | qualified → dropped
 *   dropped → new                                the Owner revives it
 *
 * `converted` is terminal: the enquiry carries on.
 */

export const LEAD_STAGES = ['new', 'contacted', 'qualified', 'converted', 'dropped'] as const
export type LeadStage = (typeof LEAD_STAGES)[number]

export const LEAD_SOURCES = ['callback', 'website', 'email', 'manual', 'import'] as const
export type LeadSourceValue = (typeof LEAD_SOURCES)[number]

/** Board 03 Source column words (no WhatsApp: 10-architecture §1.2). */
export const LEAD_SOURCE_WORD = {
  callback: 'Call-back',
  website: 'Website',
  email: 'Email',
  manual: 'Manual',
  import: 'Import',
} as const satisfies Record<LeadSourceValue, string>

export const LEAD_STAGE_WORD = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  dropped: 'Dropped',
} as const satisfies Record<LeadStage, string>

export interface LeadTransitionContext {
  convertedEnquiryId?: string | null
  actorRole?: 'owner' | 'helper' | 'assistant' | 'system'
}

const OPEN: readonly LeadStage[] = ['new', 'contacted', 'qualified']

type Guard = (c: LeadTransitionContext) => string | null

export const LEAD_RULES: ReadonlyArray<{
  from: readonly LeadStage[]
  to: LeadStage
  guard?: Guard
}> = [
  { from: ['new'], to: 'contacted' },
  { from: ['contacted'], to: 'qualified' },
  {
    from: OPEN,
    to: 'converted',
    guard: (c) => (c.convertedEnquiryId ? null : 'Convert it to an enquiry'),
  },
  { from: OPEN, to: 'dropped' },
  {
    from: ['dropped'],
    to: 'new',
    guard: (c) => (c.actorRole === 'owner' ? null : 'Only the Owner revives a dropped lead'),
  },
]

const BY_EDGE = new Map<string, Guard | undefined>()
for (const r of LEAD_RULES) for (const f of r.from) BY_EDGE.set(`${f}>${r.to}`, r.guard)

export function leadEdges(): ReadonlyArray<readonly [LeadStage, LeadStage]> {
  return [...BY_EDGE.keys()].map((k) => k.split('>') as [LeadStage, LeadStage])
}

export function canTransitionLead(
  from: LeadStage,
  to: LeadStage,
  ctx: LeadTransitionContext = {}
): TransitionCheck {
  if (from === 'converted')
    return { ok: false, reason: 'A converted lead carries on as its enquiry' }
  if (!BY_EDGE.has(`${from}>${to}`))
    return from === to
      ? { ok: false, reason: `It is already ${LEAD_STAGE_WORD[to]}` }
      : { ok: false, reason: `${LEAD_STAGE_WORD[from]} cannot move to ${LEAD_STAGE_WORD[to]}` }
  const reason = BY_EDGE.get(`${from}>${to}`)?.(ctx) ?? null
  return reason ? { ok: false, reason } : { ok: true }
}

export function transitionLead(
  from: LeadStage,
  to: LeadStage,
  ctx: LeadTransitionContext = {}
): ActivityEventDraft {
  const c = canTransitionLead(from, to, ctx)
  if (!c.ok) throw new TransitionRefused(from, to, c.reason)
  return { kind: 'status', field: 'stage', before: from, after: to }
}

/** The lead stage track (board 22): New · Contacted · Qualified · Enquiry. */
export const LEAD_TRACK = ['New', 'Contacted', 'Qualified', 'Enquiry'] as const
export function leadTrackIndex(stage: LeadStage): number {
  return stage === 'converted'
    ? 3
    : stage === 'dropped'
      ? 0
      : LEAD_TRACK.indexOf(LEAD_STAGE_WORD[stage] as never)
}
