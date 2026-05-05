/**
 * RFQ status type. Mirrors the `RfqStatus` enum in the Prisma schema.
 *
 * The post-`order_created` lifecycle (fulfilling → shipped → delivered →
 * invoiced → paid) is **reserved** for the order/fulfilment domain, which is
 * not yet implemented. Until that domain ships, `order_created` is treated as
 * the successful-terminal state for an RFQ — see `TERMINAL_STATES` and the
 * empty transitions for the reserved values below.
 *
 * Audit cross-reference: P1-8 / P1-14 in
 * `~/.claude/plans/in-this-folder-you-mutable-cocoa.md`.
 */
export type RfqStatus =
  | 'draft'
  | 'submitted'
  | 'engineer_review'
  | 'engineer_questions_pending'
  | 'quote_sent'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'order_created'
  | 'fulfilling' // RESERVED — Order/fulfilment domain not yet wired
  | 'shipped' // RESERVED
  | 'delivered' // RESERVED
  | 'invoiced' // RESERVED
  | 'paid' // RESERVED
  | 'cancelled'

export type RfqTransitionActor = 'contact' | 'staff' | 'system'

type TransitionMap = Partial<Record<RfqStatus, RfqStatus[]>>

// Valid transitions keyed by the FROM state. Values are allowed TO states.
//
// `order_created` is treated as a successful terminal state for now: there is
// no admin UI to advance to fulfilling/shipped/delivered/etc. and no Order
// model is currently being written. Reserved values therefore have empty
// transition lists.
const TRANSITIONS: TransitionMap = {
  draft: ['submitted', 'cancelled'],
  submitted: ['engineer_review', 'cancelled'],
  engineer_review: ['engineer_questions_pending', 'quote_sent', 'cancelled'],
  engineer_questions_pending: ['engineer_review', 'cancelled'],
  quote_sent: ['accepted', 'declined', 'expired', 'cancelled'],
  // Lightweight order/fulfilment tracking: admin manually advances state
  // through accepted → order_created → shipped → delivered. No carrier
  // integration, no Order row — the state on the RFQ itself plus the
  // AccountActivity audit log is enough at current volume. The intermediate
  // `fulfilling` state is intentionally skipped for simplicity (collapse
  // into `order_created`); add it back if engineers want a dedicated
  // "preparing/picking" stage.
  accepted: ['order_created', 'cancelled'],
  order_created: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  // Terminal states — no outgoing transitions.
  delivered: [],
  declined: [],
  expired: [],
  cancelled: [],
  // Reserved for the future order/fulfilment + accounting domain. Currently
  // unreachable from the active flow.
  fulfilling: [],
  invoiced: [],
  paid: [],
}

export function canTransition(from: RfqStatus, to: RfqStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(from: RfqStatus, to: RfqStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid RFQ transition: ${from} → ${to}`)
  }
}

export function getValidTransitions(from: RfqStatus): RfqStatus[] {
  return TRANSITIONS[from] ?? []
}

/**
 * Statuses that end the RFQ lifecycle. `delivered` is the successful
 * terminal state once order tracking is wired (PR #44 — 2026-05-04);
 * `order_created` and `shipped` are no longer terminal because the admin
 * can advance them forward.
 */
export const TERMINAL_STATES: RfqStatus[] = [
  'delivered',
  'declined',
  'expired',
  'cancelled',
]

export function isTerminal(status: RfqStatus): boolean {
  return TERMINAL_STATES.includes(status)
}

// Statuses that trigger email notifications to the customer
export const EMAIL_NOTIFICATION_STATUSES: RfqStatus[] = [
  'submitted',
  'quote_sent',
  'order_created',
  'expired',
]

export function shouldNotifyCustomer(status: RfqStatus): boolean {
  return EMAIL_NOTIFICATION_STATUSES.includes(status)
}
