/**
 * Render an outbound RFQ to a supplier.
 *
 * Pure. Returns subject + plain-text body for a human to review and send from
 * their own mailbox.
 *
 * Plain text, not HTML, on purpose. These go to industrial suppliers whose
 * sales desks run on Outlook and whose replies quote the original inline; a
 * styled HTML mail is harder to quote, more likely to be filtered on a cold
 * first contact, and buys nothing the recipient wants.
 *
 * NOT sent by the application. The composer hands the text to a human who
 * sends it from the business mailbox. Two reasons, both load-bearing:
 * a cold list emailed at volume through the transactional sender would push
 * customer quotes into spam, and a supplier RFQ going out under the company's
 * name deserves a human read before it leaves.
 */

export type RfqDraftLine = {
  position: number
  description: string
  qty: number | null
  unit: string | null
  partNumber: string | null
  certification: string | null
}

export type RfqDraftInput = {
  supplierName: string
  /** Our reference, shown so replies can be attributed back. */
  enquiryCode: string
  lines: RfqDraftLine[]
  /** ISO date string, or null when the buyer set no closing date. */
  closingAt: string | null
  senderName: string
  senderTitle: string | null
  companyName: string
  senderEmail: string
  senderPhone: string | null
  /** Where the goods must be delivered. */
  destination: string
}

export type RfqDraft = {
  subject: string
  body: string
  /** A mailto: URL for the whole thing, when an address is known. */
  mailtoUrl: (to: string) => string
}

function formatQty(line: RfqDraftLine): string {
  if (line.qty == null) return 'qty to confirm'
  const qty = Number.isInteger(line.qty) ? String(line.qty) : String(line.qty)
  return line.unit ? `${qty} ${line.unit}` : qty
}

function formatLine(line: RfqDraftLine): string {
  const parts = [`${line.position}. ${line.description}`]
  if (line.partNumber) parts.push(`   Part no: ${line.partNumber}`)
  parts.push(`   Quantity: ${formatQty(line)}`)
  if (line.certification) parts.push(`   Certification required: ${line.certification}`)
  return parts.join('\n')
}

/** "5 March 2026" — unambiguous, since DD/MM vs MM/DD is a real hazard here. */
function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Build the RFQ.
 *
 * The wording asks for exactly what the comparison step needs — unit price,
 * currency, lead time, Incoterm, MOQ, validity, certification — because an
 * offer missing any of those cannot be ranked against the others without going
 * back to the supplier, and the response window rarely allows a second round.
 */
export function renderRfqDraft(input: RfqDraftInput): RfqDraft {
  const closing = formatDate(input.closingAt)

  const subject = `RFQ ${input.enquiryCode} — ${input.lines.length} ${
    input.lines.length === 1 ? 'item' : 'items'
  }${closing ? ` — quote required by ${closing}` : ''}`

  const greeting = `Dear ${input.supplierName} team,`

  const intro = [
    `${input.companyName} is sourcing the items below for a customer in ${input.destination}.`,
    'We would appreciate your best quotation.',
  ].join(' ')

  const itemBlock = input.lines.map(formatLine).join('\n\n')

  const asks = [
    'For each item, please confirm:',
    '  - Unit price and currency',
    '  - Minimum order quantity',
    '  - Lead time from order',
    '  - Incoterm and named place',
    '  - Validity of the quotation',
    '  - Whether you can supply the certification stated above',
    '',
    'If you cannot supply an item, please say so rather than omitting it — a',
    'partial quotation is useful, a silent gap is not.',
  ].join('\n')

  const deadline = closing
    ? `We need to respond to our customer by ${closing}, so an early reply — even a partial one — is genuinely helpful.`
    : 'An early reply is appreciated, as our customer works to a short deadline.'

  const signOff = [
    'Best regards,',
    '',
    input.senderName,
    ...(input.senderTitle ? [input.senderTitle] : []),
    input.companyName,
    input.senderEmail,
    ...(input.senderPhone ? [input.senderPhone] : []),
  ].join('\n')

  const body = [
    greeting,
    '',
    intro,
    '',
    `Our reference: ${input.enquiryCode}`,
    '',
    'ITEMS',
    '-----',
    itemBlock,
    '',
    asks,
    '',
    deadline,
    '',
    signOff,
  ].join('\n')

  return {
    subject,
    body,
    mailtoUrl: (to: string) =>
      `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}
