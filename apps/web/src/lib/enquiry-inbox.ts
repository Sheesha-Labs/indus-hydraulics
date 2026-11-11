/**
 * The admin's one Enquiries inbox: every inbound request, whatever door it
 * came through, as one kind of row.
 *
 * There used to be two screens — "Enquiries" (tenders and procurement emails
 * pasted in for supplier research) and "RFQ Queue" (quote requests submitted
 * on the website) — and call-back requests had no screen at all. To the
 * people answering them they are the same thing: someone wants a part priced.
 * So they share a list, sorted by what needs attention, and each row still
 * opens its own workflow (the RFQ review screen, the research pipeline, the
 * call-back card), because those genuinely differ.
 *
 * Pure: the page loads the rows; everything here is mapping and ordering,
 * and is unit-tested.
 */

export const INBOX_SOURCES = ['website', 'tender', 'callback'] as const
export type InboxSource = (typeof INBOX_SOURCES)[number]

export const SOURCE_LABEL: Record<InboxSource, string> = {
  website: 'Website RFQ',
  tender: 'Tender / pasted',
  callback: 'Call-back',
}

/** One shared ladder over three different status enums. */
export const INBOX_STAGES = ['new', 'working', 'quoted', 'won', 'closed'] as const
export type InboxStage = (typeof INBOX_STAGES)[number]

export const STAGE_LABEL: Record<InboxStage, string> = {
  new: 'New',
  working: 'In progress',
  quoted: 'Quoted',
  won: 'Won',
  closed: 'Closed',
}

/** The views the inbox filters to. "Open" is everything still to act on. */
export const INBOX_VIEWS = ['open', 'quoted', 'won', 'closed', 'all'] as const
export type InboxView = (typeof INBOX_VIEWS)[number]

export const VIEW_LABEL: Record<InboxView, string> = {
  open: 'Open',
  quoted: 'Quoted',
  won: 'Won',
  closed: 'Closed',
  all: 'All',
}

export function inView(stage: InboxStage, view: InboxView): boolean {
  if (view === 'all') return true
  if (view === 'open') return stage === 'new' || stage === 'working'
  return stage === view
}

const RFQ_STAGE: Record<string, InboxStage> = {
  draft: 'new',
  submitted: 'new',
  engineer_review: 'working',
  engineer_questions_pending: 'working',
  quote_sent: 'quoted',
  accepted: 'won',
  order_created: 'won',
  fulfilling: 'won',
  shipped: 'won',
  delivered: 'won',
  invoiced: 'won',
  paid: 'won',
  declined: 'closed',
  expired: 'closed',
  cancelled: 'closed',
}

const ENQUIRY_STAGE: Record<string, InboxStage> = {
  triage: 'new',
  researching: 'working',
  rfq_sent: 'working',
  comparing: 'working',
  quoted: 'quoted',
  won: 'won',
  lost: 'closed',
  abandoned: 'closed',
}

const CALLBACK_STAGE: Record<string, InboxStage> = {
  new: 'new',
  called: 'working',
  quoted: 'quoted',
  closed: 'closed',
  spam: 'closed',
}

export function stageOf(source: InboxSource, status: string): InboxStage {
  const map = source === 'website' ? RFQ_STAGE : source === 'tender' ? ENQUIRY_STAGE : CALLBACK_STAGE
  return map[status] ?? 'working'
}

/** The source's own word for its status — shown under the shared stage. */
export const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  engineer_review: 'Under review',
  engineer_questions_pending: 'Questions to customer',
  quote_sent: 'Quote sent',
  accepted: 'Accepted',
  order_created: 'Order created',
  fulfilling: 'Fulfilling',
  shipped: 'Shipped',
  delivered: 'Delivered',
  invoiced: 'Invoiced',
  paid: 'Paid',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  triage: 'Triage',
  researching: 'Researching',
  rfq_sent: 'Supplier RFQs sent',
  comparing: 'Comparing offers',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  abandoned: 'Abandoned',
  new: 'New',
  called: 'Called',
  closed: 'Closed',
  spam: 'Spam',
}

export type InboxRow = {
  key: string
  source: InboxSource
  ref: string
  href: string
  subject: string
  customer: string | null
  status: string
  stage: InboxStage
  /** Website RFQs carry an urgency; plant_down is "a line is stopped". */
  urgency: 'routine' | 'priority' | 'plant_down' | null
  /** A tender's closing date. */
  dueAt: Date | null
  lines: number | null
  receivedAt: Date
  assignee: string | null
}

const DAY = 86_400_000

/**
 * Attention order. Open work first; within it, a stopped plant, then a
 * priority request or a tender closing within three days, then the oldest
 * waiting. Finished work after, newest first.
 */
export function attentionRank(r: InboxRow, now: number): number {
  const open = r.stage === 'new' || r.stage === 'working'
  if (!open) return 3
  if (r.urgency === 'plant_down') return 0
  const closingSoon = r.dueAt !== null && r.dueAt.getTime() - now <= 3 * DAY
  if (r.urgency === 'priority' || closingSoon) return 1
  return 2
}

export function sortInbox(rows: InboxRow[], now = Date.now()): InboxRow[] {
  return [...rows].sort((a, b) => {
    const ra = attentionRank(a, now)
    const rb = attentionRank(b, now)
    if (ra !== rb) return ra - rb
    // Open work: oldest waiting first. Finished work: newest first.
    return ra === 3 ? b.receivedAt.getTime() - a.receivedAt.getTime() : a.receivedAt.getTime() - b.receivedAt.getTime()
  })
}

export function matchesQuery(r: InboxRow, q: string): boolean {
  const term = q.trim().toLowerCase()
  if (!term) return true
  return [r.ref, r.subject, r.customer ?? ''].some((s) => s.toLowerCase().includes(term))
}

/** "Closes in 3d", "Closes today", "Closed" — a tender's deadline in words. */
export function dueLabel(dueAt: Date | null, now = Date.now()): string | null {
  if (!dueAt) return null
  const days = Math.ceil((dueAt.getTime() - now) / DAY)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  return `Closes in ${days}d`
}
