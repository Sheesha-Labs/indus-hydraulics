import {
  canTransition,
  GROUP_TARGET_STAGE,
  groupOf,
  PIPELINE_GROUPS,
  type EnquiryTransitionContext,
  type PipelineGroupKey,
} from '../state/enquiry'
import type { EnquiryStage } from '../state/labels'

/**
 * Board 04 pipeline card rules (S09-T02). Pure. What the coverage bar and its label say for one enquiry, by its
 * display group:
 *   Enquiry, Sourcing      lines sent on an RFQ that went out: "0 / 6 sent", "25 / 34 sent"
 *   Quotes in              lines quoted (or to follow): "11 / 12 quoted"
 *   Quoted                 the quotation: "INDUS/Q26933 sent" (full bar)
 *   Negotiation            the quotation and what the client asked: "INDUS/Q26924-R2 · price review"
 *   Won                    the client PO: "PO-DME-7781"
 */

export type PipelineGroup =
  'enquiry' | 'sourcing' | 'quotes_in' | 'quoted' | 'negotiation' | 'won' | 'ended'

export interface PipelineCardInput {
  stageGroup: PipelineGroup
  linesTotal: number
  linesSent: number
  linesQuoted: number
  quotationNumber: string | null
  quotationStatus: string | null
  quotationClientStatus: string | null
  clientPoRef: string | null
}

const CLIENT_ASK: Record<string, string> = {
  asked_for_changes: 'changes asked',
  asked_for_discount: 'price review',
  counter_offer: 'counter offer',
  still_deciding: 'still deciding',
  no_reply: 'no reply',
  evaluating: 'evaluating',
  technical_review: 'technical review',
  budget_approval: 'budget approval',
  shortlisted: 'shortlisted',
  received: 'received',
  po_to_follow: 'PO to follow',
  po_received: 'PO received',
}

const QUOTATION_STATE: Record<string, string> = {
  draft: 'draft',
  awaiting_approval: 'waiting approval',
  approved: 'approved',
  sent: 'sent',
  viewed: 'viewed',
  evaluating: 'evaluating',
  won: 'won',
  lost: 'lost',
}

/** The bar's fill (0–100, whole percent) and its label. */
export function pipelineCoverage(c: PipelineCardInput): { pct: number; label: string } {
  const pct = (n: number) => (c.linesTotal > 0 ? Math.round((n / c.linesTotal) * 100) : 0)
  switch (c.stageGroup) {
    case 'enquiry':
    case 'sourcing':
      return { pct: pct(c.linesSent), label: `${c.linesSent} / ${c.linesTotal} sent` }
    case 'quotes_in':
      return { pct: pct(c.linesQuoted), label: `${c.linesQuoted} / ${c.linesTotal} quoted` }
    case 'quoted':
      return {
        pct: 100,
        label: c.quotationNumber
          ? `${c.quotationNumber} ${QUOTATION_STATE[c.quotationStatus ?? ''] ?? 'sent'}`
          : `${c.linesQuoted} / ${c.linesTotal} quoted`,
      }
    case 'negotiation': {
      const ask = CLIENT_ASK[c.quotationClientStatus ?? '']
      return {
        pct: 100,
        label: c.quotationNumber
          ? ask
            ? `${c.quotationNumber} · ${ask}`
            : c.quotationNumber
          : 'In negotiation',
      }
    }
    case 'won':
      return { pct: 100, label: c.clientPoRef ?? 'Won' }
    case 'ended':
      return { pct: 0, label: 'Closed' }
  }
}

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' }

/**
 * A card or column value, compact: "$86K", "$1.2M", "AED 450K". Amounts are decimal strings (never floats into
 * money maths; this only rounds for display). Null when there is no value.
 */
export function compactMoney(amount: string | null, currency: string | null): string | null {
  if (amount === null || currency === null) return null
  const n = Number(amount)
  if (!Number.isFinite(n)) return null
  const abs = Math.abs(n)
  const body =
    abs >= 1_000_000
      ? `${trim(n / 1_000_000)}M`
      : abs >= 1_000
        ? `${Math.round(n / 1_000)}K`
        : String(Math.round(n))
  const sym = SYMBOL[currency]
  return sym ? `${sym}${body}` : `${currency} ${body}`
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '')
}

/**
 * A column total across currencies: one compact sum per currency, largest first ("$228K", "$140K + AED 90K").
 * Sums decimal strings in integer hundredths so the total is exact before it is rounded for display.
 */
export function columnTotal(
  values: ReadonlyArray<{ amount: string | null; currency: string | null }>
): string {
  const by = new Map<string, bigint>()
  for (const v of values) {
    if (v.amount === null || v.currency === null) continue
    const cents = toCents(v.amount)
    if (cents === null) continue
    by.set(v.currency, (by.get(v.currency) ?? 0n) + cents)
  }
  if (by.size === 0) return '—'
  return [...by.entries()]
    .sort((a, b) => (a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1))
    .map(([ccy, cents]) => compactMoney(fromCents(cents), ccy)!)
    .join(' + ')
}

function toCents(s: string): bigint | null {
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s.trim())
  if (!m) return null
  const frac = (m[3] ?? '').padEnd(2, '0').slice(0, 2)
  const v = BigInt(m[2]!) * 100n + BigInt(frac)
  return m[1] ? -v : v
}

function fromCents(c: bigint): string {
  const neg = c < 0n
  const a = neg ? -c : c
  return `${neg ? '-' : ''}${a / 100n}.${String(a % 100n).padStart(2, '0')}`
}

/**
 * The stage a drop on a column asks for. Quotes in from Negotiation is a price review (negotiation → pricing,
 * §9.1); from anywhere else it is quotes_in.
 */
export function groupTarget(to: PipelineGroupKey, from: EnquiryStage): EnquiryStage | null {
  if (to === 'quotes_in' && from === 'negotiation') return 'pricing'
  return GROUP_TARGET_STAGE[to]
}

/**
 * The columns a card may be moved to by drag or "Move to…" (T02): every group whose target stage the machine
 * allows from here with the enquiry's facts. Won is never a target: winning goes through the PO check.
 */
export function pipelineMoves(
  stage: EnquiryStage,
  ctx: EnquiryTransitionContext
): PipelineGroupKey[] {
  const here = groupOf(stage)
  return PIPELINE_GROUPS.flatMap((g) => {
    const target = groupTarget(g.key, stage)
    if (!target || g.key === here) return []
    return canTransition(stage, target, ctx).ok ? [g.key] : []
  })
}

/** Why a drop on a column is refused, in the machine's words ("Won" asks for the PO). */
export function pipelineRefusal(
  stage: EnquiryStage,
  to: PipelineGroupKey,
  ctx: EnquiryTransitionContext
): string | null {
  const target = groupTarget(to, stage)
  if (!target) return 'Record the client PO to mark it Won'
  const r = canTransition(stage, target, ctx)
  return r.ok ? null : r.reason
}
