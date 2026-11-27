/**
 * Supplier reliability figures (S10-T03, 06-map-schema §8.4, ADR-08: numbers in code). Pure and deterministic: the
 * nightly job reads the rows and writes what this returns; the Assistant only words a paragraph from these numbers.
 * Withdrawn RFQs are left out. Percentages are 0–100 with two decimals; a figure with nothing to divide by is null.
 */

export interface RecipientEvent {
  sentAt: Date | null
  repliedAt: Date | null
  /** RecipientStatus: quoted, partial_quote, regretted, no_reply, withdrawn, … */
  status: string
}

export interface QuoteEvent {
  receivedAt: Date
  linesAsked: number
  linesQuoted: number
}

export interface PoEvent {
  promisedDate: Date | null
  deliveredAt: Date | null
  status: string
}

export interface StatsInput {
  recipients: readonly RecipientEvent[]
  quotes: readonly QuoteEvent[]
  /** Quote lines this supplier offered, and how many of them were chosen on a won order. */
  quoteLines: number
  selectedOnWon: number
  pos: readonly PoEvent[]
}

export interface SupplierStats {
  rfqsAsked: number
  replies: number
  quotes: number
  regrets: number
  replyRatePct: number | null
  medianReplyHours: number | null
  linesQuotedPct: number | null
  winSharePct: number | null
  onTimePct: number | null
  posCount: number
  lastQuoteAt: Date | null
}

const round2 = (n: number) => Math.round(n * 100) / 100
const pct = (num: number, den: number) => (den > 0 ? round2((num / den) * 100) : null)

export function median(values: readonly number[]): number | null {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

const REPLIED = new Set(['quoted', 'partial_quote', 'regretted', 'replied_question'])

export function computeSupplierStats(input: StatsInput): SupplierStats {
  const asked = input.recipients.filter(
    (r) => r.status !== 'withdrawn' && r.status !== 'draft' && r.sentAt
  )
  const replied = asked.filter((r) => r.repliedAt || REPLIED.has(r.status))
  const hours = replied
    .filter((r) => r.repliedAt && r.sentAt && r.repliedAt >= r.sentAt)
    .map((r) => (r.repliedAt!.getTime() - r.sentAt!.getTime()) / 3_600_000)
  const linesAsked = input.quotes.reduce((s, q) => s + q.linesAsked, 0)
  const linesQuoted = input.quotes.reduce((s, q) => s + Math.min(q.linesQuoted, q.linesAsked), 0)
  const delivered = input.pos.filter((p) => p.deliveredAt && p.promisedDate)
  const onTime = delivered.filter((p) => p.deliveredAt!.getTime() <= endOfDay(p.promisedDate!))
  const last = input.quotes.reduce<Date | null>(
    (m, q) => (!m || q.receivedAt > m ? q.receivedAt : m),
    null
  )
  const med = median(hours)
  return {
    rfqsAsked: asked.length,
    replies: replied.length,
    quotes: input.quotes.length,
    regrets: asked.filter((r) => r.status === 'regretted').length,
    replyRatePct: pct(replied.length, asked.length),
    medianReplyHours: med === null ? null : round2(med),
    linesQuotedPct: pct(linesQuoted, linesAsked),
    winSharePct: pct(input.selectedOnWon, input.quoteLines),
    onTimePct: pct(onTime.length, delivered.length),
    posCount: input.pos.filter((p) => p.status !== 'cancelled' && p.status !== 'draft').length,
    lastQuoteAt: last,
  }
}

function endOfDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999)
}

/** A change worth a new reliability paragraph: reply rate ±10 points, median ±24 h, or a new PO. */
export function statsMovedMaterially(
  before: Pick<SupplierStats, 'replyRatePct' | 'medianReplyHours' | 'posCount'>,
  after: Pick<SupplierStats, 'replyRatePct' | 'medianReplyHours' | 'posCount'>
): boolean {
  const diff = (a: number | null, b: number | null, by: number) =>
    (a === null) !== (b === null) || (a !== null && b !== null && Math.abs(a - b) >= by)
  return (
    diff(before.replyRatePct, after.replyRatePct, 10) ||
    diff(before.medianReplyHours, after.medianReplyHours, 24) ||
    after.posCount > before.posCount
  )
}

/** The paragraph is shown only with this many replies (board 133 state 1 below it). */
export const RELIABILITY_MIN_REPLIES = 3

/** "From 29 RFQs, 25 quotes and 4 POs since Mar 2025": the basis line, built in code. */
export function reliabilityBasis(
  s: Pick<SupplierStats, 'rfqsAsked' | 'quotes' | 'posCount'>,
  since: Date | null
): string {
  const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`
  const month = since
    ? ` since ${new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' }).format(since).replace('Sept', 'Sep')}`
    : ''
  return `From ${n(s.rfqsAsked, 'RFQ', 'RFQs')}, ${n(s.quotes, 'quote', 'quotes')} and ${n(s.posCount, 'PO', 'POs')}${month}`
}

/** "3 d" / "0.4 d" for the list's Median column; null as an em dash in the UI. */
export function medianDays(hours: number | null): string | null {
  if (hours === null) return null
  const d = hours / 24
  return `${d >= 10 ? Math.round(d) : Math.round(d * 10) / 10} d`
}

// ── The reliability paragraph (board 129): the model writes words and placeholders; code fills every figure ───────

export const SUMMARY_PLACEHOLDERS = [
  'reply_days',
  'reply_rate',
  'lines_quoted',
  'win_share',
  'on_time',
  'late_count',
  'po_count',
] as const
export type SummaryPlaceholder = (typeof SUMMARY_PLACEHOLDERS)[number]

/** The values code puts into the paragraph; a figure with no data is absent (the model is told which exist). */
export function summaryValues(s: SupplierStats): Partial<Record<SummaryPlaceholder, string>> {
  const out: Partial<Record<SummaryPlaceholder, string>> = {}
  if (s.medianReplyHours !== null)
    out.reply_days = String(Math.max(1, Math.round(s.medianReplyHours / 24)))
  if (s.replyRatePct !== null) out.reply_rate = `${Math.round(s.replyRatePct)}%`
  if (s.linesQuotedPct !== null) out.lines_quoted = `${Math.round(s.linesQuotedPct)}%`
  if (s.winSharePct !== null) out.win_share = `${Math.round(s.winSharePct)}%`
  if (s.onTimePct !== null) {
    out.on_time = `${Math.round(s.onTimePct)}%`
    const delivered = s.posCount
    out.late_count = String(Math.round(((100 - s.onTimePct) / 100) * delivered))
    out.po_count = String(delivered)
  } else if (s.posCount) out.po_count = String(s.posCount)
  return out
}

/** Why the model's paragraph cannot be used, or null: unknown or unavailable placeholders, or a bare digit. */
export function checkSummary(text: string, available: readonly string[]): string | null {
  const used = [...text.matchAll(/\{([a-z_]+)\}/g)].map((m) => m[1]!)
  const bad = used.filter((u) => !available.includes(u))
  if (bad.length) return `uses {${bad[0]}}, which has no figure`
  const bare = text.replace(/\{[a-z_]+\}/g, '')
  if (/[{}]/.test(bare)) return 'has a broken placeholder'
  if (/\d/.test(bare)) return 'writes a figure itself'
  if (/https?:|@/.test(bare)) return 'carries a link or an address'
  return null
}

export function fillSummary(
  text: string,
  values: Readonly<Partial<Record<string, string>>>
): string {
  return text.replace(/\{([a-z_]+)\}/g, (m, k: string) => values[k] ?? m)
}
