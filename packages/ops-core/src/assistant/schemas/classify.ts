import { z } from 'zod'

/**
 * Action #1 classify (S05-T04, 08-map-integrations §2.5): the model's structured output, versioned with the
 * prompt `classify-mail@1`. Auto-replies, bounces, phishing and newsletters never reach the model (the
 * detectors decide them), so their classes are not in this schema.
 */
export const CLASSIFY_MODEL_CLASSES = [
  'client_enquiry',
  'client_reply',
  'client_po',
  'supplier_quote',
  'supplier_question',
  'supplier_documents',
  'supplier_price_list',
  'supplier_other',
  'freight',
  'payment',
  'not_business',
  'other',
  'unsure',
] as const
export type ClassifyModelClass = (typeof CLASSIFY_MODEL_CLASSES)[number]

/** The stored classes (`ops."MailClass"`); classify writes one of these, never `unsure`. */
export const MAIL_CLASSES = [
  'unclassified',
  'client_enquiry',
  'client_reply',
  'client_po',
  'supplier_quote',
  'supplier_question',
  'supplier_documents',
  'supplier_price_list',
  'supplier_other',
  'freight',
  'payment',
  'auto_reply',
  'bounce',
  'phishing',
  'not_business',
  'other',
] as const
export type MailClassValue = (typeof MAIL_CLASSES)[number]

export const CONFIDENCES = ['sure', 'likely', 'unsure'] as const
export type ConfidenceValue = (typeof CONFIDENCES)[number]

const reason = z.strictObject({
  text: z.string().min(1).max(300),
  /** Verbatim words from the email; resolved to a source span or the reason is dropped. */
  quote: z.string().min(1).max(400),
})

export const classifySchema = z.strictObject({
  class: z.enum(CLASSIFY_MODEL_CLASSES),
  confidence: z.enum(CONFIDENCES),
  reasons: z.array(reason).min(1).max(3),
  alternatives: z
    .array(
      z.strictObject({ class: z.enum(CLASSIFY_MODEL_CLASSES), why: z.string().min(1).max(200) })
    )
    .max(2),
})
export type ClassifyOutput = z.infer<typeof classifySchema>

export const CLASS_LABEL: Readonly<Record<MailClassValue | 'unsure', string>> = {
  unclassified: 'Not sorted yet',
  client_enquiry: 'Client enquiry',
  client_reply: 'Client reply',
  client_po: 'Client PO',
  supplier_quote: 'Supplier quote',
  supplier_question: 'Supplier question',
  supplier_documents: 'Supplier documents',
  supplier_price_list: 'Supplier price list',
  supplier_other: 'Supplier, other',
  freight: 'Freight',
  payment: 'Payment',
  auto_reply: 'Out of office',
  bounce: 'Bounce',
  phishing: 'Phishing',
  not_business: 'Not business',
  other: 'Other',
  unsure: 'Unsure',
}

export type SenderRole = 'client' | 'supplier' | 'both' | 'unknown'

export interface ConfidenceInput {
  modelConfidence: ConfidenceValue
  modelClass: ClassifyModelClass
  /** Reasons whose quote resolved to a span. */
  resolvedReasons: number
  senderRole: SenderRole
}

export interface ComputedConfidence {
  confidence: ConfidenceValue
  why: string
}

/** A supplier class from a known client domain, or a client class from a known supplier domain. */
export function roleConflict(cls: ClassifyModelClass, role: SenderRole): boolean {
  if (role === 'client') return cls.startsWith('supplier_')
  if (role === 'supplier') return cls.startsWith('client_')
  return false
}

/**
 * Confidence is computed in code, never taken from the model (ADR-12):
 *   sure    the model said sure AND ≥ 1 reason resolved AND no role conflict
 *   likely  the model said sure or likely, with one signal missing (no resolved reason, or a conflict)
 *   unsure  anything else, and always when the model said unsure or answered `unsure`
 */
export function computeClassifyConfidence(input: ConfidenceInput): ComputedConfidence {
  if (input.modelClass === 'unsure' || input.modelConfidence === 'unsure') {
    return { confidence: 'unsure', why: 'The Assistant was not sure' }
  }
  const conflict = roleConflict(input.modelClass, input.senderRole)
  const resolved = input.resolvedReasons > 0
  const missing = (conflict ? 1 : 0) + (resolved ? 0 : 1)
  if (input.modelConfidence === 'sure' && missing === 0)
    return { confidence: 'sure', why: 'Quoted evidence, no conflict' }
  if (
    missing <= 1 &&
    (input.modelConfidence === 'sure' || (input.modelConfidence === 'likely' && missing === 0))
  ) {
    return {
      confidence: 'likely',
      why: conflict
        ? 'The sender’s role does not match the class'
        : resolved
          ? 'The model was fairly sure'
          : 'No quote could be found in the email',
    }
  }
  return {
    confidence: 'unsure',
    why: conflict && !resolved ? 'Role conflict and no quoted evidence' : 'Not enough evidence',
  }
}

/** "Client enquiry · Sure · from a known client domain" (the Mail list's Assistant note). */
export function assistantNote(
  cls: MailClassValue,
  confidence: ConfidenceValue,
  why: string
): string {
  const word = confidence === 'sure' ? 'Sure' : confidence === 'likely' ? 'Likely' : 'Unsure'
  return `${CLASS_LABEL[cls]} · ${word} · ${why}`.slice(0, 200)
}
