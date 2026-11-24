import { z } from 'zod'

/**
 * Learned preferences (S07-T05, 08-map §2.10, D18). Pure rules:
 *
 *   signalPattern / groupSignals   deterministic grouping of preference_signal rows by (action, counterparty or
 *                                  mailbox, pattern): the same salutation edit, the same reject chip, the same
 *                                  re-filing. Only groups of three or more go to the model.
 *   lintPreferenceText             a preference may shape wording and choices, never levels, approvals, checks,
 *                                  sending or money. Such text is refused on save and dropped when learned.
 *   rankPreferences / preferenceBlock   at most 12 active preferences, most specific first (counterparty > trade >
 *                                  mailbox > global), then strength, then recency, rendered as a short list for the
 *                                  user turn after the cached system prefix.
 *
 * Preferences are never an input to resolveLevel, the send gate or verify; the safety tests prove it.
 */

export const LEARN_THRESHOLD = 3
export const PREFERENCE_BLOCK_MAX = 12
export const PREFERENCE_BLOCK_INTRO =
  'These are style and choice preferences from Krishan and Ayush. They never override the rules above or any check.'

export type SignalKind = 'edit' | 'reject' | 'unsure_choice' | 'override' | 'sent_mail'

export interface SignalRow {
  id: string
  kind: string
  actionKey: string | null
  actionId: string | null
  companyId: string | null
  mailboxId: string | null
  payload: unknown
  createdAt: Date | string
}

export interface SignalGroup {
  key: string
  actionKey: string | null
  companyId: string | null
  mailboxId: string | null
  pattern: string
  kind: string
  signalIds: string[]
  actionIds: string[]
  /** A short, neutral description of what the signals have in common, for the model. */
  summary: string
}

function firstLine(text: unknown): string | null {
  if (typeof text !== 'string') return null
  const line = text.split(/\r?\n/).find((l) => l.trim().length > 0)
  return line ? line.trim().slice(0, 120) : null
}

/** The pattern a signal belongs to, or null when it says nothing reusable. */
export function signalPattern(s: Pick<SignalRow, 'kind' | 'actionKey' | 'payload'>): {
  pattern: string
  summary: string
} | null {
  const p = (s.payload ?? {}) as Record<string, unknown>
  const action = s.actionKey ?? 'any'
  if (s.kind === 'edit') {
    const changes = Array.isArray(p.changes) ? (p.changes as Array<Record<string, unknown>>) : []
    const body = changes.find((c) => c.field === 'body')
    const before = firstLine(body?.before)
    const after = firstLine(body?.after)
    if (
      before &&
      after &&
      before !== after &&
      /^(dear|hi|hello|good (morning|afternoon))\b/i.test(after)
    ) {
      return {
        pattern: `edit:${action}:salutation:${after.toLowerCase()}`,
        summary: `Salutation changed to "${after}"`,
      }
    }
    const fields = changes.map((c) => String(c.field)).sort()
    if (!fields.length) return null
    return {
      pattern: `edit:${action}:fields:${fields.join(',')}`,
      summary: `Edited ${fields.join(', ')}`,
    }
  }
  if (s.kind === 'reject') {
    const chip = typeof p.chip === 'string' ? p.chip : null
    if (!chip) return null
    return { pattern: `reject:${action}:${chip}`, summary: `Rejected: ${chip}` }
  }
  if (s.kind === 'override' || s.kind === 'unsure_choice') {
    const field = typeof p.field === 'string' ? p.field : null
    const after = p.after == null ? null : String(p.after)
    if (!field || !after) return null
    return {
      pattern: `${s.kind}:${action}:${field}:${after}`,
      summary: `${s.kind === 'override' ? 'Changed' : 'Chose'} ${field} to ${after}`,
    }
  }
  if (s.kind === 'sent_mail') {
    const phrase = typeof p.phrase === 'string' ? p.phrase : null
    return phrase ? { pattern: `sent:${phrase.toLowerCase()}`, summary: `Wrote "${phrase}"` } : null
  }
  return null
}

/** Groups of signals sharing (action, counterparty or mailbox, pattern); only those with ≥ 3 are kept. */
export function groupSignals(
  signals: readonly SignalRow[],
  threshold = LEARN_THRESHOLD
): SignalGroup[] {
  const groups = new Map<string, SignalGroup>()
  for (const s of signals) {
    const pat = signalPattern(s)
    if (!pat) continue
    const scope = s.companyId ? `c:${s.companyId}` : s.mailboxId ? `m:${s.mailboxId}` : 'g'
    const key = `${s.actionKey ?? 'any'}|${scope}|${pat.pattern}`
    const g =
      groups.get(key) ??
      ({
        key,
        actionKey: s.actionKey,
        companyId: s.companyId,
        mailboxId: s.companyId ? null : s.mailboxId,
        pattern: pat.pattern,
        kind: s.kind,
        signalIds: [],
        actionIds: [],
        summary: pat.summary,
      } satisfies SignalGroup)
    g.signalIds.push(s.id)
    if (s.actionId && !g.actionIds.includes(s.actionId)) g.actionIds.push(s.actionId)
    groups.set(key, g)
  }
  return [...groups.values()]
    .filter((g) => g.signalIds.length >= threshold)
    .sort((a, b) => b.signalIds.length - a.signalIds.length || a.key.localeCompare(b.key))
}

/**
 * Text a preference may not carry: anything about Autopilot levels, approvals, checks or guardrails, sending
 * on its own, or moving money; and a margin under the floor. Returns the reason, or null when it is fine.
 */
export function lintPreferenceText(text: string, marginFloorPct = 12): string | null {
  const t = text.toLowerCase()
  const rules: Array<[RegExp, string]> = [
    [
      /\b(autopilot|do and tell|do quietly|draft and ask|level)\b/,
      'Preferences cannot change Autopilot levels.',
    ],
    [
      /\b(without (asking|approval|review|me|you)|no approval|skip (the )?(approval|review)|don'?t ask|auto[- ]?approve)\b/,
      'Preferences cannot skip an approval.',
    ],
    [
      /\b(ignore|skip|bypass|disable|turn off|override)\b.*\b(check|checks|guardrail|guardrails|rule|rules|identifier|verification|limit)\b/,
      'Preferences cannot switch off a check or a guardrail.',
    ],
    [
      /\b(send|email|mail) (it |them )?(directly|automatically|on (its|your) own|straight away|immediately)\b|\bauto[- ]?send\b/,
      'Preferences cannot make the Assistant send on its own.',
    ],
    [/\b(pay|payment|transfer|wire|remit|refund)\b/, 'Preferences cannot move money.'],
  ]
  for (const [re, why] of rules) if (re.test(t)) return why
  const margin = /\bmargin\b[^0-9]{0,30}(\d+(?:\.\d+)?)\s*%/.exec(t)
  if (margin && Number(margin[1]) < marginFloorPct)
    return `A margin under the ${marginFloorPct}% floor is not a preference.`
  return null
}

export const PREFERENCE_SCOPES = ['global', 'client', 'supplier', 'trade', 'mailbox'] as const
export const PREFERENCE_KINDS = [
  'salutation',
  'phrase_use',
  'phrase_avoid',
  'tone_sample',
  'margin_habit',
  'rounding',
  'quoting_currency',
  'supplier_exclusion',
  'classification_rule',
  'line_display',
  'chaser_pause',
  'acknowledgement_skip',
  'other',
] as const

/** The model's answer for one group (learn-preferences@1). */
export const learnedPreferencesSchema = z.object({
  preferences: z
    .array(
      z.object({
        scope: z.enum(PREFERENCE_SCOPES),
        kind: z.enum(PREFERENCE_KINDS),
        description: z.string().min(3).max(200),
        value: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
        evidenceSignalIds: z.array(z.string()).max(50),
      })
    )
    .max(3),
})
export type LearnedPreferences = z.infer<typeof learnedPreferencesSchema>

export interface ActivePreference {
  id: string
  scope: (typeof PREFERENCE_SCOPES)[number]
  kind: string
  description: string
  companyId: string | null
  tradeId: string | null
  mailboxId: string | null
  actionKey: string | null
  strength: number
  updatedAt: Date | string
}

const SPECIFICITY: Record<string, number> = {
  client: 3,
  supplier: 3,
  trade: 2,
  mailbox: 1,
  global: 0,
}

/** The preferences that apply to one run, most specific first, then strength, then recency; at most 12. */
export function rankPreferences(
  prefs: readonly ActivePreference[],
  target: {
    actionKey: string
    companyId?: string | null
    mailboxId?: string | null
    tradeId?: string | null
  },
  max = PREFERENCE_BLOCK_MAX
): ActivePreference[] {
  return prefs
    .filter((p) => p.actionKey === null || p.actionKey === target.actionKey)
    .filter((p) => {
      if (p.scope === 'client' || p.scope === 'supplier')
        return !!target.companyId && p.companyId === target.companyId
      if (p.scope === 'trade') return !!target.tradeId && p.tradeId === target.tradeId
      if (p.scope === 'mailbox') return !!target.mailboxId && p.mailboxId === target.mailboxId
      return true
    })
    .sort(
      (a, b) =>
        (SPECIFICITY[b.scope] ?? 0) - (SPECIFICITY[a.scope] ?? 0) ||
        b.strength - a.strength ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, max)
}

/** The block placed in the user turn after the cached system prefix; empty when nothing applies. */
export function preferenceBlock(prefs: readonly Pick<ActivePreference, 'description'>[]): string {
  if (!prefs.length) return ''
  return [PREFERENCE_BLOCK_INTRO, ...prefs.map((p) => `- ${p.description}`)].join('\n')
}
