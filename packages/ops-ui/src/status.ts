// The status tone map (05-map-frontend §4): the single source for "which colour is this word". The kit builds a
// flat first-wins MAP across families, which makes "No reply" always warn; Ops keys by family and the types
// require it. The words per family come from @indus/ops-core (state/vocabulary.ts), so the DB → word maps there
// and the tones here can never disagree about which words exist.
import type { VocabularyFamily, VocabularyWord } from '@indus/ops-core'
import type { MailRole, MailType } from './mail/types'
import type { AssistantStatus, Tone } from './types'

/** A tone, or a tone with a trailing ~ for words printed struck through (Superseded, Withdrawn). */
type Spec = Tone | `${Tone}~`

/**
 * The 12 kit families are the Status kit's S table verbatim (status.test.ts compares them with a JSON
 * transcription of it). The product families after them carry the stored lifecycles the kit's words cannot
 * express; every tone in them is ours and awaits sign-off (listed in the S01 PR).
 */
export const STATUS_VOCABULARY = {
  enquiry: {
    Enquiry: 'n',
    Sourcing: 'acc',
    'Quotes in': 'acc',
    Quoted: 'acc',
    Negotiation: 'warn',
    Won: 'ok',
    Lost: 'n',
    Regretted: 'n',
    'On hold': 'warn',
  },
  order: {
    Confirmed: 'acc',
    'Awaiting advance': 'warn',
    'Advance received': 'ok',
    Production: 'acc',
    Inspection: 'acc',
    Freight: 'acc',
    Shipped: 'acc',
    Delivered: 'ok',
    Invoiced: 'acc',
    Paid: 'ok',
  },
  line: {
    'To source': 'warn',
    'RFQ sent': 'acc',
    Quoted: 'ok',
    Partial: 'warn',
    'Alternative offered': 'warn',
    Regret: 'bad',
    'No source': 'bad',
    'To follow': 'warn',
    Held: 'n',
  },
  doc: {
    Draft: 'n',
    'Waiting approval': 'warn',
    Approved: 'ok',
    Sent: 'acc',
    Viewed: 'acc',
    Accepted: 'ok',
    'Changes asked': 'warn',
    Superseded: 'n~',
    Cancelled: 'bad',
    Reissued: 'acc',
  },
  client: {
    Evaluating: 'n',
    Received: 'n',
    'No reply': 'warn',
    'Asked for changes': 'warn',
    Won: 'ok',
    Lost: 'n',
  },
  supplier: {
    'Contact only': 'n',
    Trial: 'warn',
    Approved: 'ok',
    Principal: 'navy',
    Blocked: 'bad',
  },
  rfq: {
    Drafted: 'n',
    Scheduled: 'acc',
    Sent: 'acc',
    Opened: 'acc',
    Chased: 'warn',
    Quoted: 'ok',
    Regretted: 'n',
    'No reply': 'bad',
    Withdrawn: 'n~',
  },
  money: {
    'Not due': 'n',
    Due: 'acc',
    'Part-paid': 'warn',
    Overdue: 'bad',
    Paid: 'ok',
    'Credit hold': 'bad',
    'Written off': 'n',
  },
  autopilot: {
    Off: 'n',
    Suggest: 'out',
    'Draft and ask': 'acc',
    'Do and tell': 'acc',
    'Do quietly': 'navy',
    Locked: 'n',
  },
  assistant: { Running: 'ok', Paused: 'warn', Unsure: 'warn', Failed: 'bad', Disconnected: 'bad' },
  check: { Passed: 'ok', Warning: 'warn', Failed: 'bad', 'Not checked': 'n' },
  tender: { Reading: 'acc', Clarifying: 'warn', 'Bid pack': 'acc', Submitted: 'ok', Missed: 'bad' },

  // ---- Product families (tones awaiting sign-off) ----
  recipient: {
    Drafted: 'n',
    'Awaiting approval': 'warn',
    Scheduled: 'acc',
    Sent: 'acc',
    Opened: 'acc',
    'Auto-reply': 'n',
    Bounced: 'bad',
    Question: 'warn',
    Partial: 'warn',
    Quoted: 'ok',
    Regretted: 'n',
    'No reply': 'bad',
    Withdrawn: 'n~',
  },
  quote: {
    Capturing: 'acc',
    'Needs review': 'warn',
    Confirmed: 'ok',
    Duplicate: 'n',
    Rejected: 'bad',
    Superseded: 'n~',
  },
  quotation: {
    Draft: 'n',
    'Waiting approval': 'warn',
    Approved: 'ok',
    Sent: 'acc',
    Viewed: 'acc',
    Evaluating: 'n',
    Won: 'ok',
    Lost: 'n',
    Superseded: 'n~',
    Cancelled: 'bad',
  },
  orderState: {
    Confirmed: 'acc',
    'Awaiting advance': 'warn',
    Production: 'acc',
    Inspection: 'acc',
    Freight: 'acc',
    Shipped: 'acc',
    Delivered: 'ok',
    Invoiced: 'acc',
    Paid: 'ok',
    Closed: 'n',
    Cancelled: 'bad',
  },
  po: {
    Draft: 'n',
    'Waiting approval': 'warn',
    Approved: 'ok',
    Sent: 'acc',
    Acknowledged: 'ok',
    'In production': 'acc',
    Ready: 'acc',
    Inspected: 'ok',
    Shipped: 'acc',
    Delivered: 'ok',
    Invoiced: 'acc',
    Closed: 'n',
    Cancelled: 'bad',
  },
  document: {
    Draft: 'n',
    'Waiting approval': 'warn',
    Approved: 'ok',
    Sent: 'acc',
    Viewed: 'acc',
    Accepted: 'ok',
    'Changes asked': 'warn',
    Superseded: 'n~',
    Cancelled: 'bad',
    Reissued: 'acc',
    Received: 'n',
    Void: 'n~',
  },
  invoice: {
    Draft: 'n',
    Sent: 'acc',
    'Part-paid': 'warn',
    'Short-paid': 'warn',
    Overdue: 'bad',
    Disputed: 'bad',
    Paid: 'ok',
    'Written off': 'n',
    Void: 'n~',
  },
  payment: {
    Draft: 'n',
    'Checks pending': 'warn',
    'Ready for approval': 'warn',
    Blocked: 'bad',
    Approved: 'ok',
    Paid: 'ok',
    Cancelled: 'bad',
  },
  mailbox: {
    Connecting: 'acc',
    Backfilling: 'acc',
    Live: 'ok',
    Behind: 'warn',
    'Limit reached': 'bad',
    'Backfill paused': 'warn',
    Paused: 'warn',
    Disconnected: 'bad',
  },
  action: {
    Proposed: 'warn',
    Later: 'n',
    Approved: 'ok',
    Edited: 'ok',
    Rejected: 'n',
    Queued: 'acc',
    Running: 'acc',
    Done: 'ok',
    Failed: 'bad',
    Undone: 'n',
    Reverted: 'n',
    Corrected: 'n',
    Cancelled: 'n',
  },
} as const satisfies { [F in VocabularyFamily]: Record<VocabularyWord<F>, Spec> }

export type StatusFamily = keyof typeof STATUS_VOCABULARY
export type StatusWord<F extends StatusFamily> = keyof (typeof STATUS_VOCABULARY)[F] & string

/** The 12 families the Status kit names, in its order (the rest are product families). */
export const KIT_STATUS_FAMILIES = [
  'enquiry',
  'order',
  'line',
  'doc',
  'client',
  'supplier',
  'rfq',
  'money',
  'autopilot',
  'assistant',
  'check',
  'tender',
] as const satisfies readonly StatusFamily[]

export const STATUS_FAMILY_META: Record<StatusFamily, { title: string; note: string }> = {
  enquiry: {
    title: 'Enquiry stages',
    note: 'RecordHeader stage track. Won / Lost / Regretted is one final stage.',
  },
  order: { title: 'Order stages', note: 'Order stage track after the win. Paid closes the order.' },
  line: { title: 'Line states', note: 'Per quotation line, on Lines and Compare.' },
  doc: {
    title: 'Document states',
    note: 'Quotation, PO, OA, PI, invoice, DN, PL. Superseded prints struck through.',
  },
  client: { title: 'Client response', note: 'What the client has done with a sent quotation.' },
  supplier: {
    title: 'Supplier tiers',
    note: 'Supplier tier. Principal is a type, not a generic word.',
  },
  rfq: { title: 'Supplier RFQ', note: 'Supplier RFQ tracker, one row per supplier.' },
  money: { title: 'Invoice and payment', note: 'Client invoices. Zoho Books is the ledger.' },
  autopilot: {
    title: 'Autopilot levels',
    note: 'Five levels per action. Send quotation and supplier POs are locked.',
  },
  assistant: { title: 'Assistant', note: 'Sidebar pill and the Assistant strip.' },
  check: { title: 'Checks', note: 'Price guard, PO check, inspection, payment checks.' },
  tender: { title: 'Tenders', note: 'Tender timeline.' },
  recipient: {
    title: 'RFQ recipient',
    note: 'One supplier on one RFQ, as stored. No reply is bad here, as on the tracker.',
  },
  quote: { title: 'Supplier quote', note: 'A captured supplier quote, from email to confirmed.' },
  quotation: { title: 'Quotation', note: 'Our INDUS/Q quotation, as stored. Superseded strikes.' },
  orderState: {
    title: 'Order status',
    note: 'The stored order stage, including Closed and Cancelled, which the stage track does not show.',
  },
  po: { title: 'Supplier PO', note: 'A supplier purchase order, approval to close.' },
  document: {
    title: 'Document record',
    note: 'Every A4 document, sent or received. Void strikes.',
  },
  invoice: { title: 'Client invoice', note: 'Client tax invoices. Zoho Books is the ledger.' },
  payment: {
    title: 'Supplier payment',
    note: 'A prepared payment instruction. A person always pays.',
  },
  mailbox: { title: 'Mailbox', note: 'Gmail connection and sync health per mailbox.' },
  action: { title: 'Assistant action', note: 'One proposal from Proposed to Done or undone.' },
}

/** Tone and strike for a word of a family. Both are checked at compile time. */
export function statusTone<F extends StatusFamily>(
  family: F,
  word: StatusWord<F>
): { tone: Tone; strike: boolean } {
  const spec = (STATUS_VOCABULARY[family] as Record<string, Spec>)[word]!
  return spec.endsWith('~')
    ? { tone: spec.slice(0, -1) as Tone, strike: true }
    : { tone: spec as Tone, strike: false }
}

/** Runtime lookup for words that arrive as strings (DB, Assistant output). Unknown → neutral, warned in dev. */
export function statusToneLoose(
  family: StatusFamily,
  word: string
): { tone: Tone; strike: boolean } {
  const spec = (STATUS_VOCABULARY[family] as Record<string, Spec | undefined>)[word]
  if (!spec) {
    if (process.env.NODE_ENV !== 'production')
      console.warn(`[status] unknown "${word}" in ${family}`)
    return { tone: 'n', strike: false }
  }
  return statusTone(family, word as StatusWord<typeof family>)
}

/** Chip ground and ink per tone (kit `.t-*`). solid-ok sits on io-ok-solid-strong: the kit's ok-solid under white
 * 11px text is 4.0:1, below WCAG AA (ext token, awaiting sign-off). */
export const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-io-ok-tint text-io-ok',
  warn: 'bg-io-warn-tint text-io-warn',
  bad: 'bg-io-bad-tint text-io-bad',
  n: 'bg-io-fill text-io-ink-2',
  acc: 'bg-io-accent-tint text-io-accent',
  navy: 'bg-io-navy text-white',
  out: 'bg-io-card text-io-ink-2 shadow-[inset_0_0_0_1px_var(--io-stroke)]',
  'solid-ok': 'bg-io-ok-solid-strong text-white',
  'solid-bad': 'bg-io-bad-solid text-white',
}

/** Mail kit type chip: quote ok, new enquiry acc, supplier question warn, client PO ok, unsure warn,
 * bounce and phishing bad, the rest neutral. */
export const MAIL_TYPE_TONE = {
  'Supplier quote': 'ok',
  'Client reply': 'n',
  'New enquiry': 'acc',
  'Supplier question': 'warn',
  'Client PO': 'ok',
  'Supplier documents': 'n',
  Freight: 'n',
  Payments: 'n',
  Unsure: 'warn',
  Bounce: 'bad',
  Phishing: 'bad',
} as const satisfies Record<MailType, Tone>

/** Mail kit role tag: Client acc, Unknown warn, Supplier and Internal neutral. */
export const MAIL_ROLE_TONE = {
  Client: 'acc',
  Unknown: 'warn',
  Supplier: 'n',
  Internal: 'n',
} as const satisfies Record<MailRole, Tone>

/** Assistant pill (kit `Dot`): default label and the ground, ink and dot classes per status. */
export const ASSISTANT_PILL: Record<
  AssistantStatus,
  { label: string; bg: string; ink: string; dot: string }
> = {
  running: {
    label: 'Assistant · running',
    bg: 'bg-io-pill-ok-bg',
    ink: 'text-io-ok',
    dot: 'bg-io-ok-solid',
  },
  paused: {
    label: 'Paused by you',
    bg: 'bg-io-warn-tint',
    ink: 'text-io-pill-warn-ink',
    dot: 'bg-io-pill-warn-dot',
  },
  disconnected: {
    label: 'Mailbox disconnected',
    bg: 'bg-io-bad-tint',
    ink: 'text-io-bad',
    dot: 'bg-io-pill-bad-dot',
  },
  unsure: {
    label: 'Assistant · unsure',
    bg: 'bg-io-warn-tint',
    ink: 'text-io-pill-warn-ink',
    dot: 'bg-io-pill-warn-dot',
  },
  off: { label: 'Assistant off', bg: 'bg-io-fill', ink: 'text-io-ink-2', dot: 'bg-io-ink-4' },
}
