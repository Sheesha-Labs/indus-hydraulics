/**
 * The outbound email state machine (S04-T06, ADR-07). Forward only:
 *
 *   draft → scheduled → (held) → sending → sent | failed | unknown
 *   draft | awaiting_approval → scheduled (a person approved)
 *   scheduled | held → waiting_for_mailbox → scheduled (the mailbox came back; never another mailbox)
 *   scheduled | held | waiting_for_mailbox → cancelled (Undo, or Cancel while held) | superseded (a newer
 *     proposal replaced it) | suppressed_preview (outside production, recipient not allow-listed) | failed
 *     (the gate refused: needs a person, stale, identifier check)
 *   unknown → sent (reconcile found it in Sent) | failed (a person marked it)
 *
 * `queued` and `undone` remain in the database enum for old rows but are never written (S04-T02 migration).
 */
export const OUTBOUND_STATUSES = [
  'draft',
  'awaiting_approval',
  'queued',
  'waiting_for_mailbox',
  'sending',
  'sent',
  'failed',
  'cancelled',
  'undone',
  'scheduled',
  'held',
  'unknown',
  'superseded',
  'suppressed_preview',
] as const

export type OutboundStatusValue = (typeof OUTBOUND_STATUSES)[number]

const EDGES: ReadonlyArray<readonly [OutboundStatusValue, OutboundStatusValue]> = [
  ['draft', 'awaiting_approval'],
  ['draft', 'scheduled'],
  ['draft', 'cancelled'],
  ['draft', 'superseded'],
  ['awaiting_approval', 'scheduled'],
  ['awaiting_approval', 'cancelled'],
  ['awaiting_approval', 'superseded'],
  ['scheduled', 'held'],
  ['held', 'scheduled'],
  ['scheduled', 'sending'],
  ['scheduled', 'waiting_for_mailbox'],
  ['held', 'waiting_for_mailbox'],
  ['waiting_for_mailbox', 'scheduled'],
  ...(['scheduled', 'held', 'waiting_for_mailbox'] as const).flatMap((from) =>
    (['cancelled', 'superseded', 'suppressed_preview', 'failed'] as const).map(
      (to) => [from, to] as const
    )
  ),
  ['sending', 'sent'],
  ['sending', 'failed'],
  ['sending', 'unknown'],
  ['unknown', 'sent'],
  ['unknown', 'failed'],
]

const ALLOWED = new Set(EDGES.map(([a, b]) => `${a}>${b}`))

export function canTransitionOutbound(from: OutboundStatusValue, to: OutboundStatusValue): boolean {
  return ALLOWED.has(`${from}>${to}`)
}

export function outboundTransitions(): Array<[OutboundStatusValue, OutboundStatusValue]> {
  return [...ALLOWED].map((e) => e.split('>') as [OutboundStatusValue, OutboundStatusValue])
}

/** Statuses an Undo (or a Cancel while held) may still stop: nothing has gone to Google yet. */
export const CANCELLABLE: readonly OutboundStatusValue[] = [
  'scheduled',
  'held',
  'waiting_for_mailbox',
]

/** Terminal: nothing moves out of them. */
export const OUTBOUND_TERMINAL: readonly OutboundStatusValue[] = [
  'sent',
  'failed',
  'cancelled',
  'superseded',
  'suppressed_preview',
  'undone',
]
