/**
 * Where enquiries go — one place for every surface that sends one.
 *
 * Every storefront form emails these two addresses (with the submitter in CC),
 * and every "Enquire" button opens a mail to them. Change an address here and
 * the forms, the buttons and the tests follow.
 */

export const ENQUIRY_EMAIL_TO = 'sales@indushydraulics.me'
export const ENQUIRY_EMAIL_CC = 'purchase@indushydraulics.me'

/** Both inboxes, in send order. */
export const ENQUIRY_RECIPIENTS: readonly string[] = [ENQUIRY_EMAIL_TO, ENQUIRY_EMAIL_CC]

export type EnquiryMailtoInput = {
  subject: string
  /** Plain text; line breaks are kept. */
  body?: string
}

/**
 * `mailto:` link for an "Enquire" button: to sales, purchase in CC, subject
 * and body prefilled.
 *
 * Every value is percent-encoded with encodeURIComponent — never `+` for a
 * space, which mail clients show literally — and line breaks are sent as CRLF
 * (RFC 6068 §5).
 */
export function enquiryMailto({ subject, body }: EnquiryMailtoInput): string {
  const params = [`cc=${encodeURIComponent(ENQUIRY_EMAIL_CC)}`, `subject=${encodeURIComponent(subject)}`]
  if (body) params.push(`body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`)
  return `mailto:${ENQUIRY_EMAIL_TO}?${params.join('&')}`
}

/**
 * Starter body for an enquiry about one page — product, category, brand,
 * article or industry. Gives the buyer the lines the desk always asks for, so
 * the first reply can be a price rather than a question.
 */
export function enquiryBody(input: { about: string; url: string; partNumber?: string | null }): string {
  return [
    'Hello Indus Hydraulics,',
    '',
    `I would like a quote for: ${input.about}`,
    input.partNumber ? `Part number: ${input.partNumber}` : null,
    `Page: ${input.url}`,
    '',
    'Quantity:',
    'Delivery to (city, country):',
    'Required by:',
    '',
    'Name:',
    'Company:',
    'Phone / WhatsApp:',
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
}

/** Default for CMS link fields that used to point at the retired quote cart. */
export const ENQUIRY_LINK = enquiryMailto({ subject: 'Parts enquiry' })

/**
 * The visitor's own filename, made safe for a MIME header, ending in the
 * extension the server assigned at upload (the allow-listed type, not
 * whatever the original name claimed).
 */
export function enquiryAttachmentFilename(file: { path: string; label: string }): string {
  const ext = /\.([a-z0-9]{2,5})$/.exec(file.path)?.[1] ?? 'bin'
  const base =
    file.label
      .replace(/[\\/:*?"<>|\r\n\t]+/g, '_')
      .replace(/\.[a-z0-9]{2,5}$/i, '')
      .trim()
      .slice(0, 100) || 'attachment'
  return `${base}.${ext}`
}
