import type { MailClassValue } from '../assistant/schemas/classify'

/**
 * Mail pipeline rules (S05-T04): the handled state the Mail view filters on, and the `Indus/*` labels a
 * message should carry (08-map-integrations §1.8). Pure; the server diffs against what is applied.
 */
export type HandledState = 'unsure' | 'not_linked' | 'needs_you' | 'handled'

const QUIET: ReadonlySet<MailClassValue> = new Set([
  'not_business',
  'auto_reply',
  'bounce',
  'phishing',
])

export interface HandledInput {
  classification: MailClassValue
  confidence: 'sure' | 'likely' | 'unsure' | null
  /** Live (not removed) links to records. */
  linked: number
  /** An open proposal (Review card or Unsure item) about this message. */
  openProposal: boolean
  /** Something downstream still has to happen (create the enquiry, capture the quote …). */
  downstreamPending?: boolean
}

/**
 *   unsure      classification unsure (or not yet sorted with an Unsure item open)
 *   needs_you   a proposal about this message is open
 *   handled     quiet classes (not business, out of office, bounce, phishing), or linked with nothing pending
 *   not_linked  business mail with no link
 */
export function handledState(input: HandledInput): HandledState {
  if (
    input.confidence === 'unsure' ||
    (input.classification === 'unclassified' && input.openProposal)
  ) {
    return 'unsure'
  }
  if (input.openProposal) return 'needs_you'
  if (QUIET.has(input.classification)) return 'handled'
  if (input.linked > 0) return input.downstreamPending ? 'needs_you' : 'handled'
  return 'not_linked'
}

export const LABEL_KINDS = [
  'enquiry',
  'clientReply',
  'po',
  'supplierQuote',
  'supplierQuestion',
  'needsOwner',
  'notBusiness',
  'ignore',
] as const
export type LabelKind = (typeof LABEL_KINDS)[number]

/** Kinds the Assistant manages. `ignore` is the person's own label: Ops reads it and never sets or clears it. */
export const MANAGED_LABEL_KINDS: readonly LabelKind[] = LABEL_KINDS.filter((k) => k !== 'ignore')

export interface DesiredLabelInput {
  classification: MailClassValue
  confidence: 'sure' | 'likely' | 'unsure' | null
  mailboxRole: 'client' | 'supplier' | 'personal'
  /** Links by subject type: an enquiry link counts as intake for an enquiry-class message. */
  linkedTypes: readonly string[]
  openReviewCard: boolean
}

/** The managed label kinds a message should carry now (§1.8). Unsure mail carries none but Needs Krishan. */
export function desiredLabels(input: DesiredLabelInput): LabelKind[] {
  const out = new Set<LabelKind>()
  if (input.openReviewCard) out.add('needsOwner')
  if (input.confidence === 'unsure') return [...out]
  const c = input.classification
  if (c === 'not_business' || c === 'phishing') out.add('notBusiness')
  if (c === 'client_enquiry' && input.linkedTypes.includes('enquiry')) out.add('enquiry')
  if (c === 'client_reply' && input.mailboxRole !== 'supplier') out.add('clientReply')
  if (c === 'client_po') out.add('po')
  if (c === 'supplier_quote' && input.mailboxRole !== 'client') out.add('supplierQuote')
  if (c === 'supplier_question' && input.mailboxRole !== 'client') out.add('supplierQuestion')
  return LABEL_KINDS.filter((k) => out.has(k))
}

/** Gmail label ids to add and remove, from managed ids only: never a system label, never Indus/Ignore. */
export function labelDiff(input: {
  desired: readonly string[]
  applied: readonly string[]
  managed: readonly string[]
}): { add: string[]; remove: string[] } {
  const managed = new Set(input.managed)
  const desired = new Set(input.desired.filter((id) => managed.has(id)))
  const applied = new Set(input.applied.filter((id) => managed.has(id)))
  return {
    add: [...desired].filter((id) => !applied.has(id)).sort(),
    remove: [...applied].filter((id) => !desired.has(id)).sort(),
  }
}
