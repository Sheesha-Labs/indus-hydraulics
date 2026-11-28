/**
 * Assistant action keys (ADR-10, architecture §4.6, apps/ops/CLAUDE.md §17).
 *
 * Every key a later sprint seeds is appended here in that sprint's commit, next to its INSERT in
 * <ts>_ops_sNN_action_defs.sql. `packages/ops-db/src/autopilot-catalogue.guard.test.ts` parses every
 * migration that inserts into `ops.autopilot_action_def` and fails when the union of keys differs from
 * ACTION_KEYS, when a key is inserted twice, or when a locked / capped row disagrees with this file.
 *
 * A key that emails anyone outside Indus also goes into SENDS_EXTERNALLY, in the same commit.
 */

/** The 32 Autopilot catalogue rows (board 98), in catalogue order: `position` = index + 1. */
export const CATALOGUE_KEYS = [
  'classify_mail',
  'link_mail',
  'label_gmail',
  'create_enquiry',
  'extract_lines',
  'ack_email',
  'ask_client_questions',
  'remind_client_questions',
  'group_lines',
  'pick_suppliers',
  'research_suppliers',
  'send_supplier_rfqs',
  'chase_suppliers',
  'relay_supplier_questions',
  'share_client_answers',
  'remind_supplier_documents',
  'capture_supplier_quotes',
  'recommend_sources',
  'price_quotation',
  'send_quotation',
  'follow_up_reminders',
  'follow_up_emails',
  'ask_price_hold',
  'recognise_client_po',
  'ack_po_receipt',
  'order_ack_proforma',
  'advance_reminders',
  'supplier_pos',
  'production_chasing',
  'document_checklist_reminders',
  'payment_reminders',
  'supplier_payments',
] as const

/** The system actions of architecture §4.6, seeded at positions 101+ in this order. */
export const SYSTEM_KEYS = [
  'qualify_enquiry',
  'ack_website',
  'regret_client',
  'client_line_give_up',
  'decide_equivalent',
  'promote_supplier',
  'withdraw_rfq',
  'rfq_change_followup',
  'negotiate_supplier_price',
  'ask_open_copy',
  'resend_alternate_contact',
  'capture_supplier_ack_proforma',
  'request_freight_quotes',
  'capture_freight_quote',
  'propose_split_shipment',
  'capture_pod',
  'check_certificates',
  'claim_draft',
  'cancel_reissue_document',
  'tender_plan',
  'tender_requirements',
  'tender_query_draft',
  'approved_makes_check',
  'bid_pack',
  'month_pack',
  'learn_from_sent_mail',
  'catalogue_suggestion',
  'import_history',
  'update_fx_rates',
  'link_move_merge',
  'revert_change',
  'correction_email',
  'bank_change_alert',
  'log_call_follow_up',
  // S05
  'manual_reply',
  'ooo_facts',
  // S06
  'override_value',
  'outbound_attention',
  'instruction',
  // S08
  'request_original',
  'resolve_extracted_line',
  // S09 (board 171: a client's reply read against the open questions; the fallback before the last useful day)
  'match_client_answers',
  'client_question_fallback',
  // S10 (board 50: the /u upload link to a new supplier; board 132: the warning after a not-genuine call-back;
  // board 129: the internal reliability paragraph)
  'request_supplier_documents',
  'bank_change_warning',
  'supplier_reliability_summary',
  // S11 (board 39: candidate clauses read from an uploaded offer, for a person to accept)
  'import_terms',
] as const

/** Every seeded action key. Later sprints append their keys at the end. */
export const ACTION_KEYS = [...CATALOGUE_KEYS, ...SYSTEM_KEYS] as const

export type CatalogueKey = (typeof CATALOGUE_KEYS)[number]
export type SystemKey = (typeof SYSTEM_KEYS)[number]
export type ActionKey = (typeof ACTION_KEYS)[number]

const KEY_SET: ReadonlySet<string> = new Set(ACTION_KEYS)

export function isActionKey(key: string): key is ActionKey {
  return KEY_SET.has(key)
}

/** First system position; catalogue rows are 1–32. */
export const SYSTEM_POSITION_BASE = 101

/** `autopilot_action_def.position` for a seeded key: catalogue #n, system 101+. */
export function actionPosition(key: ActionKey): number {
  const n = (CATALOGUE_KEYS as readonly string[]).indexOf(key)
  if (n >= 0) return n + 1
  return SYSTEM_POSITION_BASE + (SYSTEM_KEYS as readonly string[]).indexOf(key)
}

/**
 * Actions whose effect is an email (or a document by email) to someone outside Indus: a client, a
 * supplier, a shipping agent, a tender issuer, the external accountant, a website visitor. Under
 * Careful none of them may run above Draft and ask, except the two in CAREFUL_SEND_EXCEPTIONS.
 */
export const SENDS_EXTERNALLY = [
  // catalogue
  'ack_email',
  'ask_client_questions',
  'remind_client_questions',
  'send_supplier_rfqs',
  'chase_suppliers',
  'relay_supplier_questions',
  'share_client_answers',
  'remind_supplier_documents',
  'send_quotation',
  'follow_up_emails',
  'ask_price_hold',
  'ack_po_receipt',
  'order_ack_proforma',
  'advance_reminders',
  'supplier_pos',
  'production_chasing',
  'payment_reminders',
  // system (§4.6)
  'ack_website',
  'regret_client',
  'client_line_give_up',
  'withdraw_rfq',
  'rfq_change_followup',
  'negotiate_supplier_price',
  'ask_open_copy',
  'resend_alternate_contact',
  'request_freight_quotes',
  'tender_query_draft',
  'claim_draft',
  'month_pack',
  'correction_email',
  // S05
  'manual_reply',
  // S06 (coverage gap G6: a failed send's Retry emails the recipient)
  'outbound_attention',
  // S08 (board 17: ask the client for a clearer copy)
  'request_original',
  // S10 (board 50 document request; board 132 warning to the address on file)
  'request_supplier_documents',
  'bank_change_warning',
] as const satisfies readonly ActionKey[]

export type ExternalSendKey = (typeof SENDS_EXTERNALLY)[number]

/**
 * The only externally-sending actions Careful runs above Draft and ask, each with its reason:
 *   chase_suppliers  Do and tell only after the person approved the first chaser of an RFQ
 *                    (`rules.firstNeedsApproval`, board 83 "Except supplier reminders you have
 *                    approved once");
 *   ack_website      the website visitor's acknowledgement from the system sender, a template with no
 *                    price or terms (architecture C15: Do and tell in every mode).
 */
export const CAREFUL_SEND_EXCEPTIONS = {
  chase_suppliers: 'firstNeedsApproval',
  ack_website: 'C15 system acknowledgement',
} as const satisfies Partial<Record<ExternalSendKey, string>>

/**
 * Priced client sends (coverage gap G2): a client price or amount goes in front of a client. #20 is
 * locked Draft and ask; #26, #27 and #31 are capped at Draft and ask (maxLevel). No preset, Custom
 * choice or earned suggestion may raise them; the send gate also refuses a priced client email without
 * a person's approvedById.
 */
export const PRICED_CLIENT_SENDS = [
  'send_quotation',
  'order_ack_proforma',
  'advance_reminders',
  'payment_reminders',
] as const satisfies readonly ExternalSendKey[]

export type PricedClientSendKey = (typeof PRICED_CLIENT_SENDS)[number]

export function sendsExternally(key: string): boolean {
  return (SENDS_EXTERNALLY as readonly string[]).includes(key)
}

export function isPricedClientSend(key: string): boolean {
  return (PRICED_CLIENT_SENDS as readonly string[]).includes(key)
}
