import { ENQUIRY_STAGE_WORD, type EnquiryStage } from '../state/labels'
import type { HeaderChipTone } from '../state/header-state'

/**
 * The enquiry header's moving parts in one place (S09-T01; boards 05, 167, 169, 170, 171): the stage track,
 * the one primary CTA (by stage, then by tab), the chip, the Assistant strip's "did" sentence and its
 * "need" link. Every enquiry tab and the pipeline read it; no page invents its own. Pure.
 */

export type EnquiryTab =
  | 'overview'
  | 'lines'
  | 'suppliers'
  | 'rfqs'
  | 'questions'
  | 'compare'
  | 'deviations'
  | 'pricing'
  | 'quotation'
  | 'files'
  | 'activity'

export interface EnquiryHeaderCounts {
  linesTotal: number
  held: number
  noSource: number
  toFollow: number
  rfqsSent: number
  quotesCaptured: number
  /** Client questions sent and not answered. */
  openQuestions: number
  /** Lines those open questions hold. */
  questionLines: number
}

export interface EnquiryHeaderInput {
  /** The enquiry id: Review groups cards by `enquiry:<id>`. */
  id: string
  ref: string
  stage: EnquiryStage
  tab: EnquiryTab
  counts: EnquiryHeaderCounts
  /** The last done Assistant actions on the enquiry, newest first: their headlines. */
  done: readonly string[]
  /** Proposals for this enquiry waiting in Review. */
  pending: number
  viewerRole: 'owner' | 'helper'
  /** The order's SO number once won. */
  orderRef?: string | null
}

export type TrackState = 'done' | 'current' | 'todo'

export interface EnquiryHeaderResolution {
  stageLabel: string
  stageTrack: ReadonlyArray<{ label: string; state: TrackState }>
  /** null: no primary for this viewer (a Helper on an ended enquiry). */
  cta: { label: string; href: string } | null
  chip?: { tone: HeaderChipTone; label: string }
  did: string
  /** "N things need you →", or on a new enquiry with nothing waiting "choose a path →" (board 167). */
  need: { count: number; href: string; label?: string } | null
}

const TRACK = ['Enquiry', 'Sourcing', 'Quotes in', 'Quoted', 'Negotiation'] as const

function track(stage: EnquiryStage): EnquiryHeaderResolution['stageTrack'] {
  const word = ENQUIRY_STAGE_WORD[stage]
  const final =
    stage === 'won'
      ? 'Won'
      : stage === 'regretted'
        ? 'Regretted'
        : stage === 'lost' || stage === 'closed'
          ? 'Lost'
          : 'Won'
  const labels = [...TRACK, final]
  const at = labels.indexOf(word)
  return labels.map((label, i) => ({
    label,
    state: at === -1 ? 'todo' : i < at ? 'done' : i === at ? 'current' : 'todo',
  }))
}

const base = (ref: string) => `/enquiries/${ref}`

function stageCta(i: EnquiryHeaderInput): EnquiryHeaderResolution['cta'] {
  const r = base(i.ref)
  switch (i.stage) {
    case 'new':
    case 'qualifying':
      return { label: 'Choose path', href: `${r}#qualification` }
    case 'sourcing':
      return { label: 'Send RFQs', href: `${r}/rfqs` }
    case 'quotes_in':
      return { label: 'Compare quotes', href: `${r}/compare` }
    case 'pricing':
      return { label: 'Price', href: `${r}/pricing` }
    case 'quoted':
    case 'negotiation':
      return { label: 'Log activity', href: '?log=1' }
    case 'won':
      return { label: 'Open order', href: i.orderRef ? `/orders/${i.orderRef}` : `${r}/quotation` }
    case 'lost':
    case 'regretted':
    case 'closed':
      return i.viewerRole === 'owner' ? { label: 'Reopen', href: `${r}?reopen=1` } : null
  }
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function chip(c: EnquiryHeaderCounts): EnquiryHeaderResolution['chip'] {
  if (c.openQuestions > 0)
    return { tone: 'warn', label: `Waiting on client · ${plural(c.questionLines, 'line')}` }
  if (c.noSource > 0) return { tone: 'bad', label: `No source · ${c.noSource}` }
  if (c.toFollow > 0) return { tone: 'warn', label: `${c.toFollow} to follow` }
  return undefined
}

const PAST: Record<string, string> = {
  acknowledge: 'acknowledged',
  ask: 'asked',
  chase: 'chased',
  check: 'checked',
  classify: 'classified',
  create: 'created',
  draft: 'drafted',
  extract: 'extracted',
  file: 'filed',
  link: 'linked',
  match: 'matched',
  qualify: 'qualified',
  read: 'read',
  regret: 'regretted',
  remind: 'reminded',
  reply: 'replied',
  withdraw: 'withdrew',
  request: 'requested',
  send: 'sent',
  capture: 'captured',
  compare: 'compared',
  price: 'priced',
  propose: 'proposed',
  record: 'recorded',
  resolve: 'resolved',
  hold: 'held',
  release: 'released',
}

/** "Acknowledge Sample Client LLC: …" → "acknowledged Sample Client LLC: …" (the strip's deterministic voice). */
export function pastTense(headline: string): string {
  const m = /^(\S+)(\s.*)?$/.exec(headline.trim())
  if (!m) return headline
  const verb = m[1]!.toLowerCase()
  const past = PAST[verb]
  const rest = m[2] ?? ''
  if (past) return `${past}${rest}`
  return `${m[1]!.charAt(0).toLowerCase()}${m[1]!.slice(1)}${rest}`
}

function did(i: EnquiryHeaderInput): string {
  const done = i.done.slice(0, 3).map(pastTense)
  if (done.length > 0) return done.join(', ')
  return `created with ${plural(i.counts.linesTotal, 'line')}`
}

export function resolveEnquiryHeader(i: EnquiryHeaderInput): EnquiryHeaderResolution {
  let cta = stageCta(i)
  if (i.tab === 'questions' && !['won', 'lost', 'regretted', 'closed'].includes(i.stage))
    cta = { label: 'Add question', href: `${base(i.ref)}/questions?add=1` }
  const c = chip(i.counts)
  return {
    stageLabel: ENQUIRY_STAGE_WORD[i.stage],
    stageTrack: track(i.stage),
    cta,
    ...(c ? { chip: c } : {}),
    did: did(i),
    need:
      i.pending > 0
        ? { count: i.pending, href: `/review?record=${encodeURIComponent(`enquiry:${i.id}`)}` }
        : i.stage === 'new' || i.stage === 'qualifying'
          ? { count: 0, href: `${base(i.ref)}#qualification`, label: 'choose a path' }
          : null,
  }
}

/** "1 thing needs you →" / "3 things need you →". */
export function needSentence(count: number): string {
  return `${count} ${count === 1 ? 'thing needs' : 'things need'} you →`
}
