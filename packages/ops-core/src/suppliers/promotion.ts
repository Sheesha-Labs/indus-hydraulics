import { findIbans } from './iban'

/**
 * Tiers, payments and bank-change mail (S10-T07, boards 130–133; C21). Pure, 100% branch-tested.
 *
 *   tierChecklist              Contact only → Trial evidence rows (licence, domain, blocked list, sanctions, bank)
 *   suggestApprovedPromotion   Trial → Approved after N POs delivered on time with no quality claim (suggested only)
 *   canPaySupplier             S27's gate: no verified account, a pending change, the cooling-off, or a block stops it
 *   detectBankChangeRequest    an email asking to change bank details, with its risk flags (board 132)
 */
export type Mark = 'ok' | 'none' | 'bad'
export interface ChecklistRow {
  key: 'licence' | 'domain' | 'blocked_list' | 'sanctions' | 'bank'
  mark: Mark
  text: string
}

export function tierChecklist(i: {
  licenceEvidence: boolean
  domainAgeDays: number | null
  domainMatchesName: boolean
  blocked: boolean
  screening: 'clear' | 'open' | 'hit'
  bank: 'verified' | 'pending' | 'none'
}): ChecklistRow[] {
  return [
    {
      key: 'licence',
      mark: i.licenceEvidence ? 'ok' : 'none',
      text: i.licenceEvidence
        ? 'Trade licence or registry entry on record'
        : 'No licence or registry entry on record yet',
    },
    {
      key: 'domain',
      mark:
        i.domainAgeDays !== null && i.domainAgeDays < 90
          ? 'bad'
          : i.domainMatchesName
            ? 'ok'
            : 'none',
      text:
        i.domainAgeDays !== null && i.domainAgeDays < 90
          ? `Domain registered ${i.domainAgeDays} days ago`
          : i.domainMatchesName
            ? 'Domain matches the company name'
            : 'Domain not checked against the company name',
    },
    {
      key: 'blocked_list',
      mark: i.blocked ? 'bad' : 'ok',
      text: i.blocked ? 'On our blocked list' : 'Not on our blocked list',
    },
    {
      key: 'sanctions',
      mark: i.screening === 'clear' ? 'ok' : i.screening === 'hit' ? 'bad' : 'none',
      text:
        i.screening === 'clear'
          ? 'Sanctions screening clear'
          : i.screening === 'hit'
            ? 'Sanctions screening hit'
            : 'Sanctions screening not done',
    },
    {
      key: 'bank',
      mark: i.bank === 'verified' ? 'ok' : i.bank === 'pending' ? 'bad' : 'none',
      text:
        i.bank === 'verified'
          ? 'Bank details verified by call-back'
          : i.bank === 'pending'
            ? 'Bank change waiting for a call-back'
            : 'No bank details yet (needed before a payment)',
    },
  ]
}

/** Trial → Approved may be promoted (Trial only: never in the list → nothing). */
export function checklistAllowsTrial(rows: readonly ChecklistRow[]): boolean {
  return !rows.some((r) => r.mark === 'bad')
}

export function suggestApprovedPromotion(i: {
  tier: string
  deliveredOnTime: number
  deliveredLate: number
  qualityClaims: number
  approvedAfterPos: number
}): boolean {
  return (
    i.tier === 'trial' &&
    i.deliveredLate === 0 &&
    i.qualityClaims === 0 &&
    i.deliveredOnTime >= i.approvedAfterPos
  )
}

export type PayRefusal = 'bank_change_pending' | 'cooling_off' | 'no_verified_account' | 'blocked'

export function canPaySupplier(i: {
  tier: string
  currency?: string | null
  now: Date
  accounts: ReadonlyArray<{
    status: string
    currency: string | null
    coolingOffUntil: Date | null
    supersededAt: Date | null
  }>
}): { allowed: true } | { allowed: false; reason: PayRefusal; until?: Date } {
  if (i.tier === 'blocked') return { allowed: false, reason: 'blocked' }
  const live = i.accounts.filter((a) => !a.supersededAt)
  if (live.some((a) => a.status === 'pending_verification'))
    return { allowed: false, reason: 'bank_change_pending' }
  const verified = live.filter(
    (a) => a.status === 'verified' && (!i.currency || !a.currency || a.currency === i.currency)
  )
  if (!verified.length) return { allowed: false, reason: 'no_verified_account' }
  const cooling = verified.find((a) => a.coolingOffUntil && a.coolingOffUntil > i.now)
  if (cooling) return { allowed: false, reason: 'cooling_off', until: cooling.coolingOffUntil! }
  return { allowed: true }
}

const PHRASES = [
  /\b(new|updated|changed?|different)\s+(bank|banking|account)\s+(details|information|account|number)/i,
  /\bbank\s+(details|account)\s+(have|has)\s+(changed|been\s+(updated|changed))/i,
  /\bour\s+bank\s+has\s+changed/i,
  /\b(remit|transfer|pay)\b.{0,40}\b(new|following|below)\s+(account|iban|bank)/i,
  /\bplease\s+(update|amend)\s+(our|the)\s+(bank|banking|account)/i,
]
const URGENCY =
  /\b(urgent(ly)?|immediately|today|asap|as soon as possible|balance now|kindly remit)\b/i

export interface BankChangeDetection {
  isRequest: boolean
  ibans: string[]
  phrases: string[]
  flags: {
    lookalikeDomain: boolean
    firstEmailFromAddress: boolean
    urgency: boolean
    domainAgeDays: number | null
  }
}

/**
 * A bank-change request: a change phrase, or a valid IBAN that is not one we hold, in mail from a supplier. Flags
 * come from the caller's facts (look-alike domain, first email from this address, domain age) and the text.
 */
export function detectBankChangeRequest(i: {
  text: string
  knownIbanLast4: readonly string[]
  lookalikeDomain: boolean
  firstEmailFromAddress: boolean
  domainAgeDays: number | null
}): BankChangeDetection {
  const phrases = PHRASES.flatMap((re) => {
    const m = re.exec(i.text)
    return m ? [m[0]] : []
  })
  const ibans = findIbans(i.text)
  const newIban = ibans.some((b) => !i.knownIbanLast4.includes(b.slice(-4)))
  return {
    isRequest: phrases.length > 0 || newIban,
    ibans,
    phrases,
    flags: {
      lookalikeDomain: i.lookalikeDomain,
      firstEmailFromAddress: i.firstEmailFromAddress,
      urgency: URGENCY.test(i.text),
      domainAgeDays: i.domainAgeDays,
    },
  }
}

/** High risk: a look-alike domain, a first email from the address, or a domain younger than 30 days. */
export function bankChangeRisk(d: BankChangeDetection): 'high' | 'medium' {
  const f = d.flags
  return f.lookalikeDomain ||
    f.firstEmailFromAddress ||
    (f.domainAgeDays !== null && f.domainAgeDays < 30)
    ? 'high'
    : 'medium'
}
