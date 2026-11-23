/**
 * Priced client sends (coverage gap G2, ADR-07 consequences): an email that puts a price or an amount in front
 * of a client never leaves without a PERSON's approval, whatever the Autopilot level. The send gate checks both
 * lists. Pure.
 */
export const PRICED_CLIENT_KINDS = [
  'quotation',
  'quotation_correction',
  'order_acknowledgement',
  'advance_request',
  'advance_reminder',
  'invoice',
  'payment_reminder',
  'client_document_correction',
] as const

export const PRICED_DOCUMENT_KINDS = [
  'quotation',
  'order_acknowledgement',
  'proforma_invoice',
  'tax_invoice',
  'credit_note',
] as const

export function isPricedKind(kind: string): boolean {
  return (PRICED_CLIENT_KINDS as readonly string[]).includes(kind)
}

export function isPricedDocument(kind: string | null | undefined): boolean {
  return !!kind && (PRICED_DOCUMENT_KINDS as readonly string[]).includes(kind)
}
