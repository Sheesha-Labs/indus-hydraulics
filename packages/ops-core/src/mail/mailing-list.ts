import { header, headersWithPrefix, type HeaderMap } from './headers'

/**
 * Newsletters and mailing lists (S05-T03, 08-map-integrations §1.11): `not business`, quietly. Signals:
 * List-Id, List-Unsubscribe, Precedence list | bulk, and the headers common email service providers add.
 */
export interface BulkResult {
  isBulk: boolean
  signals: string[]
}

const ESP_HEADERS = [
  'x-mc-user',
  'x-sg-eid',
  'feedback-id',
  'x-mailgun-sid',
  'x-campaign',
  'x-campaignid',
  'x-sfmc-stack',
]
const ESP_PREFIXES = [
  'x-mailchimp-',
  'x-ses-',
  'x-hs-',
  'x-sib-',
  'x-mailjet-',
  'x-cm-',
  'x-postmark-',
]

export function detectBulk(input: { headers: HeaderMap }): BulkResult {
  const signals: string[] = []
  if (header(input.headers, 'list-id') !== null) signals.push('List-Id')
  if (header(input.headers, 'list-unsubscribe') !== null) signals.push('List-Unsubscribe')
  const precedence = header(input.headers, 'precedence')?.trim().toLowerCase()
  if (precedence === 'list' || precedence === 'bulk') signals.push(`Precedence: ${precedence}`)
  for (const h of ESP_HEADERS)
    if (header(input.headers, h) !== null) signals.push(`ESP header ${h}`)
  for (const p of ESP_PREFIXES) {
    const found = headersWithPrefix(input.headers, p)
    if (found.length) signals.push(`ESP header ${found[0]}`)
  }
  return { isBulk: signals.length > 0, signals }
}
