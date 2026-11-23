/**
 * The rows of board 87's sending table (S04-T07, 02-map entry 87). One row may cover several outbound kinds
 * ("Quotation and revisions" is the quotation and its corrections); saving a row writes every kind in it.
 * Order and labels are the board's. Pure.
 */
export type SendingRuleRow = {
  key: string
  label: string
  audience: 'client' | 'supplier'
  kinds: readonly string[]
}

export const SENDING_RULE_ROWS: readonly SendingRuleRow[] = [
  {
    key: 'client_acknowledgement',
    label: 'Client acknowledgement',
    audience: 'client',
    kinds: ['client_acknowledgement'],
  },
  {
    key: 'client_questions',
    label: 'Questions to the client',
    audience: 'client',
    kinds: ['client_questions', 'client_question_reminder'],
  },
  {
    key: 'quotation',
    label: 'Quotation and revisions',
    audience: 'client',
    kinds: ['quotation', 'quotation_correction'],
  },
  { key: 'follow_up', label: 'Follow-up', audience: 'client', kinds: ['follow_up'] },
  {
    key: 'order_acknowledgement',
    label: 'Order acknowledgement and proforma',
    audience: 'client',
    kinds: ['order_acknowledgement'],
  },
  {
    key: 'invoice',
    label: 'Invoice and payment reminders',
    audience: 'client',
    kinds: ['invoice', 'payment_reminder'],
  },
  { key: 'supplier_rfq', label: 'Supplier RFQ', audience: 'supplier', kinds: ['supplier_rfq'] },
  { key: 'supplier_chaser', label: 'Chaser', audience: 'supplier', kinds: ['supplier_chaser'] },
  {
    key: 'supplier_question_relay',
    label: 'Question relay to supplier',
    audience: 'supplier',
    kinds: ['supplier_question_relay'],
  },
  { key: 'supplier_po', label: 'Supplier PO', audience: 'supplier', kinds: ['supplier_po'] },
  {
    key: 'forwarder_request',
    label: 'Freight forwarder request',
    audience: 'supplier',
    kinds: ['forwarder_request'],
  },
]

export const THREAD_MODE_LABELS = {
  client_thread: "Client's thread",
  rfq_thread: 'The RFQ thread',
  new_thread_per_recipient: 'New thread per supplier',
  new_thread: 'New thread',
} as const

export type ThreadModeValue = keyof typeof THREAD_MODE_LABELS

/** The mailbox roles a rule may send from. Read-only and Personal mailboxes never send (board 87). */
export const SENDING_ROLES = ['client', 'supplier'] as const
export type SendingRole = (typeof SENDING_ROLES)[number]

export function mayRoleSend(role: string): role is SendingRole {
  return (SENDING_ROLES as readonly string[]).includes(role)
}

/** The CC choices: nobody, the other business mailbox, or the client's accounts contact. */
export const CC_CHOICES = ['none', 'client', 'supplier', 'accounts_contact'] as const
export type CcChoice = (typeof CC_CHOICES)[number]

export function rowForKind(kind: string): SendingRuleRow | undefined {
  return SENDING_RULE_ROWS.find((r) => r.kinds.includes(kind))
}

/** Attachment file names (board 87): `{n}` is the number, `{ref}` the reference; unsafe characters dropped. */
export function attachmentName(pattern: string, values: { n?: string; ref?: string }): string {
  const name = pattern
    .replaceAll('{n}', values.n ?? '')
    .replaceAll('{ref}', values.ref ?? '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .trim()
  return name || 'attachment.pdf'
}
