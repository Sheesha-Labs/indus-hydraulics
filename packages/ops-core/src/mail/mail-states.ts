import type { MailFacts } from './detectors'

/**
 * Pure rules for the mail states of boards 96 and 97 (S05-T07).
 */

export type Script = 'latin' | 'arabic' | 'chinese' | 'japanese' | 'cyrillic' | 'other'

const RANGES: Array<[Script, RegExp]> = [
  ['arabic', /[؀-ۿݐ-ݿࢠ-ࣿ]/g],
  ['chinese', /[一-鿿㐀-䶿]/g],
  ['japanese', /[぀-ヿ]/g],
  ['cyrillic', /[Ѐ-ӿ]/g],
]

/** The dominant non-Latin script of a text, or 'latin' when most letters are Latin (or there are few letters). */
export function dominantScript(text: string): Script {
  const letters = (text.match(/\p{L}/gu) ?? []).length
  if (letters < 12) return 'latin'
  let best: Script = 'latin'
  let bestCount = 0
  for (const [script, re] of RANGES) {
    const n = (text.match(re) ?? []).length
    if (n > bestCount) {
      best = script
      bestCount = n
    }
  }
  return bestCount / letters >= 0.3 ? best : 'latin'
}

/** Board 97 (9): offer "Original / English" for a message mostly in another script. */
export function needsTranslation(text: string): boolean {
  return dominantScript(text) !== 'latin'
}

export const SCRIPT_LANGUAGE: Readonly<Record<Script, string>> = {
  latin: 'English',
  arabic: 'Arabic',
  chinese: 'Chinese',
  japanese: 'Japanese',
  cyrillic: 'Russian',
  other: 'another language',
}

/** A model's return date stands only inside [today, today + 120 days]; anything else is null (Unsure). */
export function boundedReturnDate(
  value: string | null,
  today: string,
  maxDays = 120
): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = Date.parse(`${value}T00:00:00Z`)
  const t = Date.parse(`${today}T00:00:00Z`)
  if (Number.isNaN(d) || Number.isNaN(t)) return null
  if (d < t || d > t + maxDays * 86_400_000) return null
  return value
}

/** "21 Sep" for a YYYY-MM-DD date. */
export function shortDate(iso: string): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${months[Number(m) - 1] ?? ''}`.trim()
}

/** What mail_message.flags keeps of the detectors' facts: small, and enough for the cards of board 96. */
export interface StoredMailFlags {
  autoReply?: { kind: string | null; returnDateText?: string; alternateContactText?: string }
  bounce?: {
    hard: boolean
    finalRecipient?: string
    status?: string
    diagnostic?: string
    xIndusOutbound?: string
    originalMessageId?: string
  }
  phishing?: { reasons: Array<{ code: string; text: string }> }
  bulk?: { signals: string[] }
  reference?: string | null
  passwordProtected?: string[]
}

export function compactFlags(f: MailFacts): StoredMailFlags {
  const out: StoredMailFlags = {}
  if (f.autoReply.isAutoReply) {
    out.autoReply = {
      kind: f.autoReply.kind,
      ...(f.autoReply.returnDateText ? { returnDateText: f.autoReply.returnDateText } : {}),
      ...(f.autoReply.alternateContactText
        ? { alternateContactText: f.autoReply.alternateContactText }
        : {}),
    }
  }
  if (f.bounce.isBounce) {
    const { isBounce: _b, ...rest } = f.bounce
    out.bounce = rest
  }
  if (f.phishing.flagged) out.phishing = { reasons: f.phishing.reasons }
  if (f.bulk.isBulk) out.bulk = { signals: f.bulk.signals.slice(0, 4) }
  if (f.reference.match) out.reference = f.reference.match.canonical
  if (f.attachments.passwordProtected.length)
    out.passwordProtected = f.attachments.passwordProtected
  return out
}
