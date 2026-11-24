/**
 * Review filter families (S06-T02, board 104): every Review card belongs to one, by its action key. The chips
 * show them in this order with counts; "All" is every card. (decision) "Mail" holds the S05 cards that fit no
 * board family yet (a Helper's reply for the Owner, a correction, a failed send).
 */
export const REVIEW_FAMILIES = [
  'chasers',
  'captured',
  'judgement',
  'rfqs',
  'quotations',
  'relay',
  'supplier-asks',
  'mail',
] as const
export type ReviewFamily = (typeof REVIEW_FAMILIES)[number]

export const FAMILY_LABEL: Readonly<Record<ReviewFamily, string>> = {
  chasers: 'Chasers',
  captured: 'Captured quotes',
  judgement: 'Judgement',
  rfqs: 'Supplier RFQs',
  quotations: 'Quotations',
  relay: 'Relay questions',
  'supplier-asks': 'Supplier asks',
  mail: 'Mail',
}

const FAMILY_OF: Readonly<Record<string, ReviewFamily>> = {
  chase_suppliers: 'chasers',
  follow_up_reminders: 'chasers',
  follow_up_emails: 'chasers',
  remind_client_questions: 'chasers',
  remind_supplier_documents: 'chasers',
  production_chasing: 'chasers',
  document_checklist_reminders: 'chasers',
  advance_reminders: 'chasers',
  payment_reminders: 'chasers',
  capture_supplier_quotes: 'captured',
  capture_supplier_ack_proforma: 'captured',
  capture_freight_quote: 'captured',
  capture_pod: 'captured',
  decide_equivalent: 'judgement',
  recommend_sources: 'judgement',
  client_line_give_up: 'judgement',
  promote_supplier: 'judgement',
  negotiate_supplier_price: 'judgement',
  qualify_enquiry: 'judgement',
  send_supplier_rfqs: 'rfqs',
  withdraw_rfq: 'rfqs',
  rfq_change_followup: 'rfqs',
  request_freight_quotes: 'rfqs',
  price_quotation: 'quotations',
  send_quotation: 'quotations',
  ask_price_hold: 'quotations',
  order_ack_proforma: 'quotations',
  regret_client: 'quotations',
  relay_supplier_questions: 'relay',
  share_client_answers: 'relay',
  ask_client_questions: 'relay',
  ask_open_copy: 'supplier-asks',
  resend_alternate_contact: 'supplier-asks',
}

export function familyOf(actionKey: string): ReviewFamily {
  return FAMILY_OF[actionKey] ?? 'mail'
}

/** Chasers and Sure captures may be batched (behaviour.md); a quotation or a locked action never. */
export function isBatchableFamily(f: ReviewFamily): boolean {
  return f === 'chasers' || f === 'captured'
}

/** "2 h 10 min", "12 min", "3 d": the age of the oldest waiting card. */
export function ageText(fromMs: number, nowMs: number): string {
  const min = Math.max(0, Math.floor((nowMs - fromMs) / 60_000))
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return min % 60 ? `${h} h ${min % 60} min` : `${h} h`
  return `${Math.floor(h / 24)} d`
}
