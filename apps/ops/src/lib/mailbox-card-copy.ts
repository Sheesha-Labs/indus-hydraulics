/**
 * The words on a board 85 mailbox card (S04-T07, 02-map entry 85). Pure: the page passes the row and the clock,
 * so the same card renders the same way in tests, on the server and in the visual baselines.
 */
export type MailboxRoleValue = 'client' | 'supplier' | 'read_only' | 'personal'

export type MailboxStatusWord =
  | 'Connecting'
  | 'Backfilling'
  | 'Live'
  | 'Behind'
  | 'Limit reached'
  | 'Backfill paused'
  | 'Paused'
  | 'Disconnected'

export const ROLE_CARDS: ReadonlyArray<{ value: MailboxRoleValue; label: string; sub: string }> = [
  { value: 'client', label: 'Client', sub: 'Quotations, client replies, POs' },
  { value: 'supplier', label: 'Supplier', sub: 'RFQs, chasers, supplier POs' },
  { value: 'read_only', label: 'Read-only', sub: 'Reads, never sends' },
  { value: 'personal', label: 'Personal', sub: 'Only threads you link' },
]

/** "2 min", "3 h", "4 d"; under a minute is "now". */
export function sinceText(from: Date | string | null, now: Date): string | null {
  if (!from) return null
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(from).getTime()) / 60_000))
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes} min`
  if (minutes < 48 * 60) return `${Math.floor(minutes / 60)} h`
  return `${Math.floor(minutes / 1440)} d`
}

function clock(at: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(at))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "14 Sep" in GST. A fixed month table: ICU builds differ ("Sep" vs "Sept" for en-GB). */
function dayMonth(at: Date | string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    day: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date(at))
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '1')
  return `${day} ${MONTHS[month - 1] ?? ''}`
}

export function statusWord(status: string): MailboxStatusWord {
  switch (status) {
    case 'live':
      return 'Live'
    case 'behind':
    case 'resyncing':
      return 'Behind'
    case 'limit_reached':
      return 'Limit reached'
    case 'backfill_paused':
      return 'Backfill paused'
    case 'backfilling':
      return 'Backfilling'
    case 'paused':
      return 'Paused'
    case 'connecting':
      return 'Connecting'
    default:
      return 'Disconnected'
  }
}

/** The status chip: "Live · last message 2 min ago", "Paused since 14:20 by KB", "Limit reached · resets 04:00 GST". */
export function statusLine(input: {
  status: string
  lastMessageAt: Date | string | null
  lastSyncAt: Date | string | null
  pausedAt: Date | string | null
  pausedByInitials: string | null
  capReset: string
  now: Date
}): { word: MailboxStatusWord; text: string } {
  const word = statusWord(input.status)
  const ago = sinceText(input.lastMessageAt, input.now)
  switch (word) {
    case 'Live':
      return {
        word,
        text: ago ? `Live · last message ${ago === 'now' ? 'just now' : `${ago} ago`}` : 'Live',
      }
    case 'Behind': {
      const synced = sinceText(input.lastSyncAt, input.now)
      return {
        word,
        text:
          input.status === 'resyncing'
            ? 'Behind · catching up'
            : `Behind · last synced ${synced ?? 'never'}${synced && synced !== 'now' ? ' ago' : ''}`,
      }
    }
    case 'Limit reached':
      return { word, text: `Limit reached · resets ${input.capReset} GST` }
    case 'Paused':
      return {
        word,
        text: input.pausedAt
          ? `Paused since ${clock(input.pausedAt)}${input.pausedByInitials ? ` by ${input.pausedByInitials}` : ''}`
          : 'Paused',
      }
    default:
      return { word, text: word }
  }
}

export type BackfillView = {
  label: string
  text: string
  value: number
  total: number
  done: boolean
}

/**
 * "Done · 9,412 messages · 14 Sep" or "64% · 5,120 of 8,000 · about 40 min left" (board 85). The ETA is the
 * server's live estimate from the quota rate (C33), never a promise; null while counting.
 */
export function backfillView(input: {
  months: number
  total: number | null
  state: {
    phase?: string
    queued?: number
    skipped?: number
    alreadyStored?: number
    etaMinutes?: number | null
    updatedAt?: string
  } | null
}): BackfillView | null {
  if (!input.months) return null
  const label = `Backfill · ${input.months} months`
  const s = input.state
  if (!s) return { label, text: 'Not started', value: 0, total: 1, done: false }
  const handled = (s.queued ?? 0) + (s.skipped ?? 0) + (s.alreadyStored ?? 0)
  const total = input.total ?? 0
  if (s.phase === 'done') {
    const when = s.updatedAt ? ` · ${dayMonth(s.updatedAt)}` : ''
    return {
      label,
      text: `Done · ${handled.toLocaleString('en-US')} messages${when}`,
      value: 1,
      total: 1,
      done: true,
    }
  }
  if (s.phase === 'counting' || !total) {
    return { label, text: 'Counting past mail…', value: 0, total: 1, done: false }
  }
  const pct = Math.min(99, Math.floor((handled / total) * 100))
  const eta = s.etaMinutes == null ? '' : ` · about ${etaText(s.etaMinutes)} left`
  const paused = s.phase === 'paused' ? ' · paused' : ''
  return {
    label,
    text: `${pct}% · ${handled.toLocaleString('en-US')} of ${total.toLocaleString('en-US')}${eta}${paused}`,
    value: handled,
    total,
    done: false,
  }
}

export function etaText(minutes: number): string {
  if (minutes < 1) return 'a minute'
  if (minutes < 90) return `${Math.round(minutes)} min`
  return `${Math.round(minutes / 60)} hours`
}

/** "What the Assistant may do here": the Send line depends on the role (board 85). */
export function sendSub(role: MailboxRoleValue, ccAddress: string | null): string {
  if (role === 'client') return 'Only after your approval or an Autopilot rule'
  if (role === 'supplier')
    return `RFQs, chasers and supplier POs${ccAddress ? `, Cc ${ccAddress.split('@')[0]}@` : ''}`
  return 'Read-only and Personal mailboxes never send'
}

/** The Indus/ labels shown on a card, by role (02-map entry 85). */
export function labelKeysFor(
  role: MailboxRoleValue
): ReadonlyArray<
  'enquiry' | 'po' | 'needsOwner' | 'clientReply' | 'supplierQuote' | 'supplierQuestion'
> {
  if (role === 'supplier') return ['supplierQuote', 'supplierQuestion', 'needsOwner']
  if (role === 'client') return ['enquiry', 'po', 'needsOwner', 'clientReply']
  return ['enquiry', 'needsOwner']
}
