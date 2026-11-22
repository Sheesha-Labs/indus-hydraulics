// Stored enum value → status vocabulary word (05-map-frontend §4). ops-core never imports Prisma, so each
// enum is copied here from 06-map-schema Appendix A as a const tuple plus its union. Every map uses
// `satisfies Record<Enum, VocabularyWord<family>>`: adding a value to a union without a word, or naming a word
// the family does not have, fails typecheck. labels.test.ts walks every tuple at runtime as well.
import type { VocabularyFamily, VocabularyWord } from './vocabulary'

// ---- Enum values (06 Appendix A, verbatim) ----

export const ENQUIRY_STAGES = [
  'new',
  'qualifying',
  'sourcing',
  'quotes_in',
  'pricing',
  'quoted',
  'negotiation',
  'won',
  'lost',
  'regretted',
  'closed',
] as const
export type EnquiryStage = (typeof ENQUIRY_STAGES)[number]

export const LINE_STATUSES = [
  'open',
  'held',
  'sourcing',
  'quoted',
  'to_follow',
  'not_quoted',
  'no_source',
  'regretted',
  'cancelled',
] as const
export type LineStatus = (typeof LINE_STATUSES)[number]

export const RECIPIENT_STATUSES = [
  'draft',
  'awaiting_approval',
  'scheduled',
  'sent',
  'opened',
  'auto_reply',
  'bounced',
  'replied_question',
  'partial_quote',
  'quoted',
  'regretted',
  'no_reply',
  'withdrawn',
] as const
export type RecipientStatus = (typeof RECIPIENT_STATUSES)[number]

export const SUPPLIER_QUOTE_STATUSES = [
  'capturing',
  'needs_review',
  'confirmed',
  'superseded',
  'rejected',
  'duplicate',
] as const
export type SupplierQuoteStatus = (typeof SUPPLIER_QUOTE_STATUSES)[number]

export const QUOTATION_STATUSES = [
  'draft',
  'awaiting_approval',
  'approved',
  'sent',
  'viewed',
  'evaluating',
  'won',
  'lost',
  'superseded',
  'cancelled',
] as const
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export const QUOTATION_CLIENT_STATUSES = [
  'received',
  'technical_review',
  'budget_approval',
  'evaluating',
  'shortlisted',
  'asked_for_changes',
  'asked_for_discount',
  'counter_offer',
  'no_reply',
  'still_deciding',
  'po_to_follow',
  'po_received',
] as const
export type QuotationClientStatus = (typeof QUOTATION_CLIENT_STATUSES)[number]

export const ORDER_STAGES = [
  'confirmed',
  'advance',
  'production',
  'inspection',
  'freight',
  'shipped',
  'delivered',
  'invoiced',
  'paid',
  'closed',
  'cancelled',
] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export const SUPPLIER_PO_STATUSES = [
  'draft',
  'awaiting_approval',
  'approved',
  'sent',
  'acknowledged',
  'in_production',
  'ready',
  'inspected',
  'shipped',
  'delivered',
  'invoiced',
  'closed',
  'cancelled',
] as const
export type SupplierPoStatus = (typeof SUPPLIER_PO_STATUSES)[number]

export const DOCUMENT_STATUSES = [
  'draft',
  'approved',
  'sent',
  'superseded',
  'cancelled',
  'received',
  'void',
] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

export const CLIENT_INVOICE_STATUSES = [
  'draft',
  'sent',
  'part_paid',
  'short_paid',
  'paid',
  'disputed',
  'overdue',
  'written_off',
  'void',
] as const
export type ClientInvoiceStatus = (typeof CLIENT_INVOICE_STATUSES)[number]

export const SUPPLIER_PAYMENT_STATUSES = [
  'draft',
  'checks_pending',
  'blocked',
  'ready_for_approval',
  'approved',
  'paid',
  'cancelled',
] as const
export type SupplierPaymentStatus = (typeof SUPPLIER_PAYMENT_STATUSES)[number]

export const MAILBOX_STATUSES = [
  'connecting',
  'backfilling',
  'live',
  'behind',
  'limit_reached',
  'backfill_paused',
  'paused',
  'disconnected',
] as const
export type MailboxStatus = (typeof MAILBOX_STATUSES)[number]

export const ACTION_STATES = [
  'proposed',
  'later',
  'approved',
  'edited_approved',
  'rejected',
  'queued',
  'running',
  'done',
  'failed',
  'undone',
  'reverted',
  'corrected',
  'cancelled',
] as const
export type ActionState = (typeof ACTION_STATES)[number]

export const AUTOPILOT_LEVELS = [
  'off',
  'suggest',
  'draft_and_ask',
  'do_and_tell',
  'do_quietly',
  'never',
] as const
export type AutopilotLevel = (typeof AUTOPILOT_LEVELS)[number]

// ---- Maps ----

/** C7 display grouping: new + qualifying → Enquiry, quotes_in + pricing → Quotes in. Closed (merged,
 * duplicate, spam, withdrawn) is a final stage without a win, so it reads Lost. */
export const ENQUIRY_STAGE_WORD = {
  new: 'Enquiry',
  qualifying: 'Enquiry',
  sourcing: 'Sourcing',
  quotes_in: 'Quotes in',
  pricing: 'Quotes in',
  quoted: 'Quoted',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  regretted: 'Regretted',
  closed: 'Lost',
} as const satisfies Record<EnquiryStage, VocabularyWord<'enquiry'>>

/** Not quoted and cancelled both read Regret (a line the client dropped is a regret reason). */
export const LINE_STATUS_WORD = {
  open: 'To source',
  held: 'Held',
  sourcing: 'RFQ sent',
  quoted: 'Quoted',
  to_follow: 'To follow',
  not_quoted: 'Regret',
  no_source: 'No source',
  regretted: 'Regret',
  cancelled: 'Regret',
} as const satisfies Record<LineStatus, VocabularyWord<'line'>>

export const RECIPIENT_STATUS_WORD = {
  draft: 'Drafted',
  awaiting_approval: 'Awaiting approval',
  scheduled: 'Scheduled',
  sent: 'Sent',
  opened: 'Opened',
  auto_reply: 'Auto-reply',
  bounced: 'Bounced',
  replied_question: 'Question',
  partial_quote: 'Partial',
  quoted: 'Quoted',
  regretted: 'Regretted',
  no_reply: 'No reply',
  withdrawn: 'Withdrawn',
} as const satisfies Record<RecipientStatus, VocabularyWord<'recipient'>>

export const SUPPLIER_QUOTE_STATUS_WORD = {
  capturing: 'Capturing',
  needs_review: 'Needs review',
  confirmed: 'Confirmed',
  superseded: 'Superseded',
  rejected: 'Rejected',
  duplicate: 'Duplicate',
} as const satisfies Record<SupplierQuoteStatus, VocabularyWord<'quote'>>

export const QUOTATION_STATUS_WORD = {
  draft: 'Draft',
  awaiting_approval: 'Waiting approval',
  approved: 'Approved',
  sent: 'Sent',
  viewed: 'Viewed',
  evaluating: 'Evaluating',
  won: 'Won',
  lost: 'Lost',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
} as const satisfies Record<QuotationStatus, VocabularyWord<'quotation'>>

/** The client's response folds into the kit's six words: still deciding is evaluating, a discount or counter
 * offer is asking for changes, and a PO received or promised is a win. */
export const QUOTATION_CLIENT_STATUS_WORD = {
  received: 'Received',
  technical_review: 'Evaluating',
  budget_approval: 'Evaluating',
  evaluating: 'Evaluating',
  shortlisted: 'Evaluating',
  asked_for_changes: 'Asked for changes',
  asked_for_discount: 'Asked for changes',
  counter_offer: 'Asked for changes',
  no_reply: 'No reply',
  still_deciding: 'Evaluating',
  po_to_follow: 'Won',
  po_received: 'Won',
} as const satisfies Record<QuotationClientStatus, VocabularyWord<'client'>>

/** The stored order stage (orderState family: the kit's order words cannot say Closed or Cancelled). The
 * stage track uses the nine display stages instead. */
export const ORDER_STAGE_WORD = {
  confirmed: 'Confirmed',
  advance: 'Awaiting advance',
  production: 'Production',
  inspection: 'Inspection',
  freight: 'Freight',
  shipped: 'Shipped',
  delivered: 'Delivered',
  invoiced: 'Invoiced',
  paid: 'Paid',
  closed: 'Closed',
  cancelled: 'Cancelled',
} as const satisfies Record<OrderStage, VocabularyWord<'orderState'>>

export const SUPPLIER_PO_STATUS_WORD = {
  draft: 'Draft',
  awaiting_approval: 'Waiting approval',
  approved: 'Approved',
  sent: 'Sent',
  acknowledged: 'Acknowledged',
  in_production: 'In production',
  ready: 'Ready',
  inspected: 'Inspected',
  shipped: 'Shipped',
  delivered: 'Delivered',
  invoiced: 'Invoiced',
  closed: 'Closed',
  cancelled: 'Cancelled',
} as const satisfies Record<SupplierPoStatus, VocabularyWord<'po'>>

export const DOCUMENT_STATUS_WORD = {
  draft: 'Draft',
  approved: 'Approved',
  sent: 'Sent',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
  received: 'Received',
  void: 'Void',
} as const satisfies Record<DocumentStatus, VocabularyWord<'document'>>

export const CLIENT_INVOICE_STATUS_WORD = {
  draft: 'Draft',
  sent: 'Sent',
  part_paid: 'Part-paid',
  short_paid: 'Short-paid',
  paid: 'Paid',
  disputed: 'Disputed',
  overdue: 'Overdue',
  written_off: 'Written off',
  void: 'Void',
} as const satisfies Record<ClientInvoiceStatus, VocabularyWord<'invoice'>>

export const SUPPLIER_PAYMENT_STATUS_WORD = {
  draft: 'Draft',
  checks_pending: 'Checks pending',
  blocked: 'Blocked',
  ready_for_approval: 'Ready for approval',
  approved: 'Approved',
  paid: 'Paid',
  cancelled: 'Cancelled',
} as const satisfies Record<SupplierPaymentStatus, VocabularyWord<'payment'>>

export const MAILBOX_STATUS_WORD = {
  connecting: 'Connecting',
  backfilling: 'Backfilling',
  live: 'Live',
  behind: 'Behind',
  limit_reached: 'Limit reached',
  backfill_paused: 'Backfill paused',
  paused: 'Paused',
  disconnected: 'Disconnected',
} as const satisfies Record<MailboxStatus, VocabularyWord<'mailbox'>>

export const ACTION_STATE_WORD = {
  proposed: 'Proposed',
  later: 'Later',
  approved: 'Approved',
  edited_approved: 'Edited',
  rejected: 'Rejected',
  queued: 'Queued',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  undone: 'Undone',
  reverted: 'Reverted',
  corrected: 'Corrected',
  cancelled: 'Cancelled',
} as const satisfies Record<ActionState, VocabularyWord<'action'>>

/** Never (supplier payments, a fixed rule) is not a level anyone can choose: it reads Locked. */
export const AUTOPILOT_LEVEL_WORD = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Locked',
} as const satisfies Record<AutopilotLevel, VocabularyWord<'autopilot'>>

/** Every map with its enum values and target family, for the exhaustiveness test and for callers that need
 * the family beside the word (a Chip takes both). */
export const LABEL_MAPS = {
  ENQUIRY_STAGE_WORD: { family: 'enquiry', values: ENQUIRY_STAGES, words: ENQUIRY_STAGE_WORD },
  LINE_STATUS_WORD: { family: 'line', values: LINE_STATUSES, words: LINE_STATUS_WORD },
  RECIPIENT_STATUS_WORD: {
    family: 'recipient',
    values: RECIPIENT_STATUSES,
    words: RECIPIENT_STATUS_WORD,
  },
  SUPPLIER_QUOTE_STATUS_WORD: {
    family: 'quote',
    values: SUPPLIER_QUOTE_STATUSES,
    words: SUPPLIER_QUOTE_STATUS_WORD,
  },
  QUOTATION_STATUS_WORD: {
    family: 'quotation',
    values: QUOTATION_STATUSES,
    words: QUOTATION_STATUS_WORD,
  },
  QUOTATION_CLIENT_STATUS_WORD: {
    family: 'client',
    values: QUOTATION_CLIENT_STATUSES,
    words: QUOTATION_CLIENT_STATUS_WORD,
  },
  ORDER_STAGE_WORD: { family: 'orderState', values: ORDER_STAGES, words: ORDER_STAGE_WORD },
  SUPPLIER_PO_STATUS_WORD: {
    family: 'po',
    values: SUPPLIER_PO_STATUSES,
    words: SUPPLIER_PO_STATUS_WORD,
  },
  DOCUMENT_STATUS_WORD: {
    family: 'document',
    values: DOCUMENT_STATUSES,
    words: DOCUMENT_STATUS_WORD,
  },
  CLIENT_INVOICE_STATUS_WORD: {
    family: 'invoice',
    values: CLIENT_INVOICE_STATUSES,
    words: CLIENT_INVOICE_STATUS_WORD,
  },
  SUPPLIER_PAYMENT_STATUS_WORD: {
    family: 'payment',
    values: SUPPLIER_PAYMENT_STATUSES,
    words: SUPPLIER_PAYMENT_STATUS_WORD,
  },
  MAILBOX_STATUS_WORD: { family: 'mailbox', values: MAILBOX_STATUSES, words: MAILBOX_STATUS_WORD },
  ACTION_STATE_WORD: { family: 'action', values: ACTION_STATES, words: ACTION_STATE_WORD },
  AUTOPILOT_LEVEL_WORD: {
    family: 'autopilot',
    values: AUTOPILOT_LEVELS,
    words: AUTOPILOT_LEVEL_WORD,
  },
} as const satisfies Record<
  string,
  { family: VocabularyFamily; values: readonly string[]; words: Record<string, string> }
>
