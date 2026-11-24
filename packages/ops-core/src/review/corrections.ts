/**
 * Board 114 · why a correction is sent (S06-T07): the chips of "Send a correction instead?". The label goes to
 * the drafting prompt and onto the card; the person's note says the rest.
 */
export const CORRECTION_REASONS = [
  'wrong_price',
  'wrong_quantity',
  'wrong_attachment',
  'wrong_person',
  'other',
] as const
export type CorrectionReason = (typeof CORRECTION_REASONS)[number]

export const CORRECTION_REASON_LABEL: Readonly<Record<CorrectionReason, string>> = {
  wrong_price: 'Wrong price',
  wrong_quantity: 'Wrong quantity',
  wrong_attachment: 'Wrong attachment',
  wrong_person: 'Sent to wrong person',
  other: 'Other',
}
