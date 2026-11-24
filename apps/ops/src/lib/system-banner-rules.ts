/**
 * Board 89 · which system banners a mailbox state raises, and their words (S04-T08, C23). Pure: the page passes
 * the rows and the clock. The shell's BannerSlot shows the most severe one with "+n more" (order in the kit:
 * disconnected > Assistant paused > mailbox paused > behind > failed send > limit > Zoho > offline > past mail
 * > info).
 *
 * Copy decisions against the board:
 *   limit reached   it is Operations' own daily limit (Mailbox.dailySendCap), not "Google's daily sending limit"
 *   backfill        C33: no "daily quota", no "resumes at 04:00" — the read is slowed to stay within Google's
 *                   limits and resumes by itself
 */
export type BannerKind =
  | 'mailbox-disconnected'
  | 'assistant-paused'
  | 'mailbox-paused'
  | 'sync-delayed'
  | 'send-failed'
  | 'limit-reached'
  | 'backfill-paused'

export type BannerSpec = {
  kind: BannerKind
  tone: 'bad' | 'warn' | 'info'
  title: string
  text: string
  action?: { label: string; href: string }
  /** The Owner's "Resume" on the paused banner (S05-T08): a button, not a link. */
  resume?: boolean
  mailboxId?: string
}

export type BannerMailbox = {
  id: string
  address: string
  role: string
  status: string
  /** When it was disconnected (or the row last changed, for a token that expired). */
  brokenAt: Date | null
  pausedAt: Date | null
  pausedByInitials: string | null
  lastSuccessfulSyncAt: Date | null
  backfillPhase: string | null
  heldForCap: number
  failedRecently: number
  /** Sent, then bounced back, in the last day (S05-T07); the first bounced address for the title. */
  bouncedRecently?: number
  bouncedTo?: string | null
  sentToday: number
  dailySendCap: number
}

export type BannerInput = {
  mailboxes: readonly BannerMailbox[]
  assistantPause: {
    pausedAt: string
    byInitials: string | null
    /** The viewer paused it ("by you"). */
    byYou?: boolean
    /** The viewer may resume (the Owner). */
    canResume?: boolean
  } | null
  capReset: string
  now: Date
}

/** A sync older than this is "behind" (board 89; S04-T09 uses the same line for the health state). */
export const BEHIND_AFTER_MINUTES = 30

const BROKEN = new Set(['disconnected', 'token_expired', 'revoked'])

function clock(at: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(at))
}

export function lagText(minutes: number): string {
  if (minutes < 60) {
    const m = Math.max(1, Math.round(minutes))
    return m === 1 ? '1 minute' : `${m} minutes`
  }
  const hours = Math.round(minutes / 60)
  return hours === 1 ? '1 hour' : `${hours} hours`
}

const MAIL_OF_ROLE: Record<string, string> = {
  client: 'client mail',
  supplier: 'supplier mail',
}

export function bannerSpecs(input: BannerInput): BannerSpec[] {
  const out: BannerSpec[] = []
  if (input.assistantPause) {
    // Board 102 state 2 / S05A: the same banner on every page while paused.
    const p = input.assistantPause
    const by = p.byYou ? 'you' : (p.byInitials ?? 'the Owner')
    out.push({
      kind: 'assistant-paused',
      tone: 'warn',
      title: `Assistant paused by ${by} at ${clock(p.pausedAt)}.`,
      text: `Nothing is read or sent until ${p.canResume ? 'you resume' : 'it resumes'}. Mail keeps arriving in Gmail.`,
      ...(p.canResume ? { resume: true } : {}),
    })
  }
  for (const m of input.mailboxes) {
    const local = `${m.address.split('@')[0]}@`
    if (BROKEN.has(m.status)) {
      const mail = MAIL_OF_ROLE[m.role]
      out.push({
        kind: 'mailbox-disconnected',
        tone: 'bad',
        title: `${local} disconnected${m.brokenAt ? ` ${clock(m.brokenAt)}` : ''}.`,
        text: mail
          ? `The Assistant can’t read or send ${mail}.`
          : 'The Assistant can’t read this mailbox.',
        action: { label: 'Reconnect', href: '/settings/mailboxes' },
        mailboxId: m.id,
      })
      continue
    }
    if (m.status === 'paused') {
      out.push({
        kind: 'mailbox-paused',
        tone: 'info',
        title: `${local} reading is paused${m.pausedAt ? ` since ${clock(m.pausedAt)}` : ''}${
          m.pausedByInitials ? ` by ${m.pausedByInitials}` : ''
        }.`,
        text: `New mail waits in Gmail; nothing is sent from ${local}.`,
        action: { label: 'Resume', href: '/settings/mailboxes' },
        mailboxId: m.id,
      })
      continue
    }
    const lag = m.lastSuccessfulSyncAt
      ? (input.now.getTime() - m.lastSuccessfulSyncAt.getTime()) / 60_000
      : null
    if (
      m.status === 'behind' ||
      m.status === 'resyncing' ||
      (lag !== null && lag > BEHIND_AFTER_MINUTES)
    ) {
      out.push({
        kind: 'sync-delayed',
        tone: 'warn',
        title:
          lag !== null && lag > 1
            ? `${local} is ${lagText(lag)} behind.`
            : `${local} is catching up.`,
        text: 'Google is slow to notify us. Checking every 5 minutes.',
        mailboxId: m.id,
      })
    }
    const bounced = m.bouncedRecently ?? 0
    if (m.failedRecently > 0 || bounced > 0) {
      const total = m.failedRecently + bounced
      out.push({
        kind: 'send-failed',
        tone: 'bad',
        title:
          m.failedRecently === 0 && bounced === 1 && m.bouncedTo
            ? `Email to ${m.bouncedTo} bounced.`
            : total === 1
              ? 'A message failed to send.'
              : `${total} messages failed to send.`,
        text: `From ${local}. Fix the contact or resend from Review.`,
        action: { label: 'Open Review', href: '/review' },
        mailboxId: m.id,
      })
    }
    if (m.heldForCap > 0 || (m.dailySendCap > 0 && m.sentToday >= m.dailySendCap)) {
      const n = m.heldForCap
      out.push({
        kind: 'limit-reached',
        tone: 'warn',
        title: `${local} reached its daily sending limit.`,
        text: `${n === 1 ? '1 send is' : `${n} sends are`} queued. Sending resumes at ${input.capReset} GST.`,
        mailboxId: m.id,
      })
    }
    if (m.status === 'backfill_paused' || m.backfillPhase === 'paused') {
      out.push({
        kind: 'backfill-paused',
        tone: 'info',
        title: `Reading past mail on ${local} slowly to stay within Google’s limits.`,
        text: 'New mail is still read live.',
        mailboxId: m.id,
      })
    }
  }
  return out
}
