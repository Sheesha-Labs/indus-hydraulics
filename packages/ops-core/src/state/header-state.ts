// The record cockpit header (board 75, 05 §3.13): what the RecordHeader and the Assistant strip show for one
// enquiry, order or tender. Pure data and mapping only. apps/ops/src/data/cockpit.ts builds the input from
// the database; S09 fills resolveHeaderState() in fully (CTA per tab, chips, deadline tone).
import { ENQUIRY_STAGE_WORD, type EnquiryStage, type OrderStage } from './labels'

export type RecordKind = 'enquiry' | 'order' | 'tender'

/** The enquiry stage track's words (C7). Won, Lost and Regretted all light the one final stage. */
export type EnquiryTrackStage = (typeof ENQUIRY_STAGE_WORD)[EnquiryStage]

/** The nine display stages of an order after the win (board 75). */
export const ORDER_TRACK_STAGES = [
  'Confirmed',
  'Advance',
  'Production',
  'Inspection',
  'Freight',
  'Shipped',
  'Delivered',
  'Invoiced',
  'Paid',
] as const
export type OrderTrackStage = (typeof ORDER_TRACK_STAGES)[number]

/** Chip tones a header may use (a subset of the Status kit tones). */
export type HeaderChipTone = 'ok' | 'warn' | 'bad' | 'n' | 'acc' | 'navy'

export interface HeaderMeta {
  label: string
  value: string
  /** `bad` when the value needs attention now (a client deadline that is close). */
  tone?: 'bad'
}

export type HeaderCta = { label: string; href: string } | { label: string; actionKey: string }

export type HeaderStage =
  { flow: 'enquiry'; current: EnquiryTrackStage } | { flow: 'order'; current: OrderTrackStage }

export interface RecordHeaderState {
  kind: RecordKind
  /** The route reference: ENQ-2026-0001 for an enquiry or tender, SO-0001 for an order (C11). */
  ref: string
  /**
   * The enquiry number the crumb shows. The record keeps it when it becomes an order (board 75), which is
   * how the order header shows the ENQ ref (C11).
   */
  enquiryRef: string
  clientName: string
  clientHref: string
  /** The page h1, Instrument Serif. */
  title: string
  meta: readonly [HeaderMeta, HeaderMeta, HeaderMeta, HeaderMeta]
  stage: HeaderStage
  /** Warn chip right of the crumb: "Waiting on client · 3 lines", a tender countdown, "Bank change". */
  chip?: { label: string; tone: HeaderChipTone }
  /** The one primary action for the tab shown; null when this viewer has none (a Helper on an ended enquiry). */
  cta: HeaderCta | null
  /** What the Assistant did on this record, as one deterministic sentence (board 75). */
  did?: string
  /** Proposed actions on this record waiting for a person: links to Review filtered by the record. */
  need?: { count: number; href: string; label?: string }
  /** "Open thread in Mail ↗": the sales@ conversation. */
  threadHref?: string
}

export interface RecordHeaderInput {
  kind: RecordKind
  ref: string
  enquiryRef?: string
  clientName: string
  clientHref: string
  title: string
  meta: readonly [HeaderMeta, HeaderMeta, HeaderMeta, HeaderMeta]
  /** The stored stage: the enquiry enum for an enquiry or tender, the order enum for an order. */
  stage: EnquiryStage | OrderStage
  chip?: { label: string; tone: HeaderChipTone }
  /** Omitted: a "Next step" link to the record. null: no primary for this viewer. */
  cta?: HeaderCta | null
  did?: string
  /** Proposed Assistant actions on the record. */
  needCount?: number
  /** Where "N things need you" goes; defaults to Review filtered by the record ref. */
  needHref?: string | undefined
  /** A strip link with nothing counted ("choose a path →"), shown when needCount is 0. */
  needLink?: { href: string; label: string } | undefined
  threadHref?: string
}

/** C7: the stored enquiry stage → the word the stage track lights (new and qualifying → Enquiry, …). */
export function enquiryTrackStage(stage: EnquiryStage): EnquiryTrackStage {
  return ENQUIRY_STAGE_WORD[stage]
}

/**
 * The stored order stage → the nine-stage track. Closed is past Paid, so the track ends there; a cancelled
 * order has no stage of its own on the track (resolveHeaderState adds a Cancelled chip and the track rests
 * on Confirmed until S09 records the stage the order was cancelled at).
 */
export const ORDER_TRACK_STAGE = {
  confirmed: 'Confirmed',
  advance: 'Advance',
  production: 'Production',
  inspection: 'Inspection',
  freight: 'Freight',
  shipped: 'Shipped',
  delivered: 'Delivered',
  invoiced: 'Invoiced',
  paid: 'Paid',
  closed: 'Paid',
  cancelled: 'Confirmed',
} as const satisfies Record<OrderStage, OrderTrackStage>

export function orderTrackStage(stage: OrderStage): OrderTrackStage {
  return ORDER_TRACK_STAGE[stage]
}

function stageFor(kind: RecordKind, stage: EnquiryStage | OrderStage): HeaderStage {
  // Decided by the kind, not the value: `closed` is a value of both enums.
  if (kind === 'order') {
    if (!Object.hasOwn(ORDER_TRACK_STAGE, stage))
      throw new Error(`"${stage}" is not an order stage`)
    return { flow: 'order', current: ORDER_TRACK_STAGE[stage as OrderStage] }
  }
  if (!Object.hasOwn(ENQUIRY_STAGE_WORD, stage))
    throw new Error(`"${stage}" is not an enquiry stage`)
  return { flow: 'enquiry', current: ENQUIRY_STAGE_WORD[stage as EnquiryStage] }
}

/** Review filtered by one record (board 75: "N things need you →"). */
export function reviewHrefForRecord(ref: string): string {
  return `/review?record=${encodeURIComponent(ref)}`
}

/** The record's base route (C9: a tender is an enquiry; C11: orders route by SO number). */
export function recordBaseHref(kind: RecordKind, ref: string): string {
  return kind === 'order' ? `/orders/${ref}` : `/enquiries/${ref}`
}

/**
 * Header state from the record's facts. In S02 it maps the stage, links the need count to Review and fills
 * placeholders (a "Next step" CTA to the record itself); S09 implements the CTA per tab and the chips.
 */
export function resolveHeaderState(input: RecordHeaderInput): RecordHeaderState {
  const stage = stageFor(input.kind, input.stage)
  const cancelled = input.kind === 'order' && input.stage === 'cancelled'
  const chip = input.chip ?? (cancelled ? { label: 'Cancelled', tone: 'bad' as const } : undefined)
  const needCount = input.needCount ?? 0
  return {
    kind: input.kind,
    ref: input.ref,
    enquiryRef: input.enquiryRef ?? input.ref,
    clientName: input.clientName,
    clientHref: input.clientHref,
    title: input.title,
    meta: input.meta,
    stage,
    ...(chip ? { chip } : {}),
    cta:
      input.cta === null
        ? null
        : (input.cta ?? { label: 'Next step', href: recordBaseHref(input.kind, input.ref) }),
    ...(input.did ? { did: input.did } : {}),
    ...(needCount > 0
      ? { need: { count: needCount, href: input.needHref ?? reviewHrefForRecord(input.ref) } }
      : input.needLink
        ? { need: { count: 0, ...input.needLink } }
        : {}),
    ...(input.threadHref ? { threadHref: input.threadHref } : {}),
  }
}

/** "1 thing needs you" / "3 things need you" (board 75). */
export function needLabel(count: number): string {
  return count === 1 ? '1 thing needs you' : `${count} things need you`
}
