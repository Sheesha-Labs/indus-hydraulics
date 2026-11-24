import { header, type HeaderMap } from './headers'

/**
 * Delivery failures (S05-T03, 08-map-integrations §1.11, board 96). A bounce marks the contact, fails the
 * outbound message and comes back to a person; it is never a reply.
 *
 *   From mailer-daemon@* or postmaster@*, or Content-Type multipart/report; report-type=delivery-status
 *   Final-Recipient / Status (5.x.x hard, 4.x.x soft) / Diagnostic-Code from the delivery-status part
 *   the original Message-ID and X-Indus-Outbound from the returned headers, to find our outbound row
 */
export interface BounceInput {
  fromAddress: string
  headers: HeaderMap
  /** The message's top-level Content-Type. */
  contentType?: string | null
  /** Text of the message/delivery-status part (server/gmail/mime keeps it, ≤ 16 KB). */
  dsnText?: string | null
  /** Text of the text/rfc822-headers part, or the returned message's headers. */
  returnedHeadersText?: string | null
  /** Plain body, for bounces that carry no DSN part (some servers write it in prose). */
  bodyText?: string | null
}

export interface BounceResult {
  isBounce: boolean
  hard: boolean
  finalRecipient?: string
  status?: string
  diagnostic?: string
  originalMessageId?: string
  xIndusOutbound?: string
}

const BOUNCE_SENDER = /^(mailer-daemon|postmaster|mail-daemon)@/i

function field(text: string, name: string): string | undefined {
  const re = new RegExp(`^${name}\\s*:\\s*(.+(?:\\n[ \\t].+)*)`, 'im')
  const m = re.exec(text)
  return m?.[1]?.replace(/\s*\n[ \t]+/g, ' ').trim() || undefined
}

function stripType(v: string | undefined): string | undefined {
  // "rfc822; buyer@example.test" → "buyer@example.test"
  return (
    v
      ?.replace(/^[a-z0-9-]+\s*;\s*/i, '')
      .replace(/^<|>$/g, '')
      .trim() || undefined
  )
}

export function parseBounce(input: BounceInput): BounceResult {
  const contentType = input.contentType ?? header(input.headers, 'content-type') ?? ''
  const report =
    /multipart\/report/i.test(contentType) &&
    /report-type\s*=\s*"?delivery-status/i.test(contentType)
  const sender = BOUNCE_SENDER.test(input.fromAddress.trim())
  if (!report && !sender) return { isBounce: false, hard: false }

  const dsn = (input.dsnText ?? '').replace(/\r/g, '')
  const body = (input.bodyText ?? '').replace(/\r/g, '')
  const statusRaw = field(dsn, 'Status') ?? /\b([245]\.\d{1,3}\.\d{1,3})\b/.exec(body)?.[1]
  const status = statusRaw ? /([245]\.\d{1,3}\.\d{1,3})/.exec(statusRaw)?.[1] : undefined
  const action = field(dsn, 'Action')?.toLowerCase()
  if (
    action === 'delayed' ||
    action === 'delivered' ||
    action === 'relayed' ||
    action === 'expanded'
  ) {
    // A delay notice is not a failure yet; a success notice is not a failure at all.
    if (action !== 'delayed') return { isBounce: false, hard: false }
  }
  const hard = status ? status.startsWith('5') : action === 'failed' && !status
  const returned = (input.returnedHeadersText ?? '').replace(/\r/g, '')

  const result: BounceResult = { isBounce: true, hard: action === 'delayed' ? false : hard }
  const finalRecipient = stripType(
    field(dsn, 'Final-Recipient') ?? field(dsn, 'Original-Recipient')
  )
  if (finalRecipient) result.finalRecipient = finalRecipient.toLowerCase()
  if (status) result.status = status
  const diagnostic = stripType(field(dsn, 'Diagnostic-Code'))
  if (diagnostic) result.diagnostic = diagnostic.slice(0, 500)
  const mid = field(returned, 'Message-ID')
  if (mid) result.originalMessageId = mid.replace(/^<|>$/g, '').trim()
  const xo = field(returned, 'X-Indus-Outbound')
  if (xo) result.xIndusOutbound = xo.trim()
  return result
}
