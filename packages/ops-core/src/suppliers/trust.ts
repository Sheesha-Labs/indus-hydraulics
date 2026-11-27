/**
 * Supplier trust rules (S10-T05, boards 51, 130; C21, C40). Pure, 100% branch-tested. Thresholds come from the
 * `suppliers.trust` setting and are passed in; nothing here is a default the UI could drift from.
 */

/** The manual screening checklist of board 51, in order (C40: no paid screening API in v1). */
export const SCREENING_LISTS = [
  {
    key: 'un',
    kind: 'sanctions',
    label: 'UN Security Council consolidated list',
    scope: 'Company, owners, directors',
  },
  {
    key: 'ofac',
    kind: 'sanctions',
    label: 'US OFAC SDN and sectoral lists',
    scope: 'Company, owners, bank',
  },
  {
    key: 'eu_uk',
    kind: 'sanctions',
    label: 'EU and UK consolidated lists',
    scope: 'Company, owners',
  },
  { key: 'uae', kind: 'sanctions', label: 'UAE local terrorist list', scope: 'Company, owners' },
  {
    key: 'origin',
    kind: 'country_of_origin',
    label: 'Country of origin',
    scope: 'Origin of the goods',
  },
  {
    key: 're_export',
    kind: 're_export',
    label: 'Re-export risk',
    scope: 'End use and destinations',
  },
  { key: 'media', kind: 'adverse_media', label: 'Adverse media', scope: 'The last 5 years' },
] as const
export type ScreeningListKey = (typeof SCREENING_LISTS)[number]['key']

export type ScreeningResultValue = 'clear' | 'possible_match' | 'hit' | 'open' | 'error'

export interface ScreeningRow {
  listName: string
  result: ScreeningResultValue
}

/** Complete: every required list has a row that is not open or error. Hits and possible matches are listed. */
export function screeningComplete(
  rows: readonly ScreeningRow[],
  required: readonly string[] = SCREENING_LISTS.map((l) => l.label)
): { complete: boolean; hits: string[]; possible: string[]; open: string[] } {
  const latest = new Map<string, ScreeningResultValue>()
  for (const r of rows) latest.set(r.listName, r.result)
  const open = required.filter((l) => {
    const v = latest.get(l)
    return v === undefined || v === 'open' || v === 'error'
  })
  return {
    complete: open.length === 0,
    hits: required.filter((l) => latest.get(l) === 'hit'),
    possible: required.filter((l) => latest.get(l) === 'possible_match'),
    open,
  }
}

export type Decision = 'approve' | 'approve_trial' | 'reject'

export interface ApproveInput {
  decision: Decision
  screening: { complete: boolean; hits: readonly string[]; possible: readonly string[] }
  bankVerified: boolean
  /** Documents still open, by kind. */
  openDocuments: readonly string[]
  rejectReason?: string | null
}

export interface ApproveCheck {
  allowed: boolean
  reasons: string[]
  /** Conditions that go on the approval ("first PO blocked until …"). */
  conditions: string[]
}

/** Documents a trial approval may still lack; the first PO waits for them. */
const TRIAL_MAY_LACK = new Set(['code_of_conduct', 'ownership_declaration'])

export function canApprove(i: ApproveInput): ApproveCheck {
  if (i.decision === 'reject') {
    return i.rejectReason?.trim()
      ? { allowed: true, reasons: [], conditions: [] }
      : { allowed: false, reasons: ['Write the reason for the rejection'], conditions: [] }
  }
  const reasons: string[] = []
  if (!i.screening.complete) reasons.push('Finish the screening checklist')
  if (i.screening.hits.length) reasons.push(`Screening hit: ${i.screening.hits.join(', ')}`)
  if (i.screening.possible.length)
    reasons.push(`Resolve the possible match: ${i.screening.possible.join(', ')}`)
  if (!i.bankVerified) reasons.push('Record a genuine call-back on the bank details')
  const conditions: string[] = []
  if (i.decision === 'approve') {
    if (i.openDocuments.length) reasons.push('Full approval needs every document in')
  } else {
    const blocking = i.openDocuments.filter((d) => !TRIAL_MAY_LACK.has(d))
    if (blocking.length)
      reasons.push(
        'Trial approval needs the documents in, except the code of conduct and ownership declaration'
      )
    const waiting = i.openDocuments.filter((d) => TRIAL_MAY_LACK.has(d))
    if (waiting.length)
      conditions.push(
        `first PO blocked until ${waiting.map((d) => d.replace(/_/g, ' ')).join(' and ')} ${waiting.length === 1 ? 'is' : 'are'} in`
      )
  }
  return { allowed: reasons.length === 0, reasons, conditions }
}

export interface TrustSettings {
  trialPos: number
  trialPerPoUsd: number
  trialTpiEachPo: boolean
  rescreenDays: number
  rescreenAboveUsd: number
  reproposeMonths: number
  approvedAfterPos: number
  coolingOffHours: number
}

export function trialLimits(
  s: Pick<TrustSettings, 'trialPos' | 'trialPerPoUsd' | 'trialTpiEachPo'>
) {
  return { pos: s.trialPos, perPoUsd: s.trialPerPoUsd, tpiEachPo: s.trialTpiEachPo }
}

/** Re-screen after the configured days, and before any PO above the configured value. */
export function requiresRescreen(i: {
  lastScreenedAt: Date | null
  now: Date
  poValueUsd?: number | null
  settings: Pick<TrustSettings, 'rescreenDays' | 'rescreenAboveUsd'>
}): boolean {
  if (!i.lastScreenedAt) return true
  if (i.now.getTime() - i.lastScreenedAt.getTime() > i.settings.rescreenDays * 86_400_000)
    return true
  return (i.poValueUsd ?? 0) > i.settings.rescreenAboveUsd
}

/** The first day a rejected supplier may be proposed again. */
export function reproposeAfter(rejectedAt: Date, months: number): Date {
  const d = new Date(rejectedAt)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}

export function reproposeAllowed(rejectedAt: Date | null, now: Date, months: number): boolean {
  return !rejectedAt || now >= reproposeAfter(rejectedAt, months)
}

/** C21: a call-back number must come from the registry or a verified record, and never from the change email. */
export function callbackRefusal(i: {
  numberSource: 'registry' | 'verified_record' | 'other'
  numberDialled: string
  numbersInEmail: readonly string[]
  registryPhone: string | null
}): string | null {
  const digits = (p: string) => p.replace(/\D/g, '').replace(/^00/, '')
  if (i.numberSource === 'other')
    return 'Call a number from the registry or a verified record, never another one'
  const dialled = digits(i.numberDialled)
  if (dialled.length < 7) return 'Write the number you dialled'
  if (
    i.numbersInEmail.some(
      (n) =>
        digits(n) &&
        (digits(n).endsWith(dialled.slice(-7)) || dialled.endsWith(digits(n).slice(-7)))
    )
  )
    return 'That number appears in the email asking for the change: call the number on file instead'
  if (
    i.numberSource === 'registry' &&
    i.registryPhone &&
    !digits(i.registryPhone).endsWith(dialled.slice(-7))
  )
    return 'That is not the registry number on file'
  return null
}
