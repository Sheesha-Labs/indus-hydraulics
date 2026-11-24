import type { GmailMessage, GmailMessagePart } from './client'

/**
 * Walk a Gmail `format: 'full'` payload (S04-T05, 08-map-integrations §1.6): the headers Ops keeps, the
 * text/plain and text/html bodies (base64url decoded, charset honoured), attachment parts and inline `cid:`
 * parts. Pure apart from TextDecoder; JSON-safe output so it can cross an Inngest step boundary.
 */
export const KEPT_HEADERS = [
  'from',
  'to',
  'cc',
  'subject',
  'date',
  'message-id',
  'in-reply-to',
  'references',
  'authentication-results',
  'auto-submitted',
  'precedence',
  'x-autoreply',
  'x-autorespond',
  'x-ms-exchange-inbox-rules-loop',
  'list-id',
  'list-unsubscribe',
  'x-indus-outbound',
  'x-indus-intake',
  'content-type',
  // S05-T03: email service providers (mailing-list detector)
  'x-mc-user',
  'x-sg-eid',
  'feedback-id',
  'x-mailgun-sid',
  'x-campaign',
  'x-campaignid',
  'x-sfmc-stack',
] as const

/** Header-name prefixes kept as well (one ESP header is enough for the mailing-list detector). */
export const KEPT_HEADER_PREFIXES = [
  'x-mailchimp-',
  'x-ses-',
  'x-hs-',
  'x-sib-',
  'x-mailjet-',
  'x-cm-',
  'x-postmark-',
] as const

/** The delivery-status parts of a bounce, kept for the bounce detector (S05-T03), each ≤ 16 KB. */
export const DSN_PART_MAX = 16 * 1024

export type Address = { address: string; name: string | null }

export type AttachmentMeta = {
  partId: string
  filename: string
  mimeType: string
  size: number
  attachmentId: string | null
  /** Small parts arrive inline (base64url) instead of by attachmentId. */
  inlineData: string | null
  contentId: string | null
  inline: boolean
}

export type ParsedMessage = {
  gmailId: string
  threadId: string
  labelIds: string[]
  internalDate: string
  sizeEstimate: number | null
  headers: Record<string, string[]>
  from: Address
  to: string[]
  cc: string[]
  subject: string | null
  sentAt: string
  rfcMessageId: string | null
  inReplyTo: string | null
  references: string[]
  text: string | null
  html: string | null
  attachments: AttachmentMeta[]
  /** message/delivery-status text and the returned message's headers, when the message is a bounce. */
  dsn: { statusText: string | null; returnedHeadersText: string | null } | null
}

function decodeBody(data: string | null | undefined, charset: string | null): string {
  if (!data) return ''
  const bytes = Buffer.from(data, 'base64url')
  const label = (charset ?? 'utf8').toLowerCase().replace(/^"|"$/g, '')
  try {
    return new TextDecoder(label, { fatal: false }).decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes)
  }
}

function headerOf(part: GmailMessagePart | undefined, name: string): string | null {
  const h = part?.headers?.find((x) => (x.name ?? '').toLowerCase() === name)
  return h?.value ?? null
}

function charsetOf(contentType: string | null): string | null {
  return /charset\s*=\s*"?([^";\s]+)"?/i.exec(contentType ?? '')?.[1] ?? null
}

/** Split an address header on commas outside quotes and angle brackets. */
export function parseAddressList(value: string | null | undefined): Address[] {
  if (!value) return []
  const out: Address[] = []
  let current = ''
  let quoted = false
  let angle = 0
  for (const ch of value) {
    if (ch === '"') quoted = !quoted
    else if (ch === '<' && !quoted) angle += 1
    else if (ch === '>' && !quoted) angle = Math.max(0, angle - 1)
    if (ch === ',' && !quoted && angle === 0) {
      out.push(parseAddress(current))
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) out.push(parseAddress(current))
  return out.filter((a) => a.address.includes('@'))
}

export function parseAddress(raw: string): Address {
  const text = raw.trim()
  const angled = /^(.*)<([^>]+)>\s*$/.exec(text)
  if (angled) {
    const name = angled[1]!.trim().replace(/^"|"$/g, '').trim()
    return { address: angled[2]!.trim().toLowerCase(), name: name || null }
  }
  return { address: text.replace(/^mailto:/i, '').toLowerCase(), name: null }
}

function messageIds(value: string | null): string[] {
  return [...(value ?? '').matchAll(/<[^<>\s]+>/g)].map((m) => m[0])
}

export function parseGmailMessage(message: GmailMessage): ParsedMessage {
  const payload = message.payload ?? {}
  const headers: Record<string, string[]> = {}
  for (const h of payload.headers ?? []) {
    const name = (h.name ?? '').toLowerCase()
    const kept =
      (KEPT_HEADERS as readonly string[]).includes(name) ||
      KEPT_HEADER_PREFIXES.some((prefix) => name.startsWith(prefix))
    if (!kept || h.value == null) continue
    ;(headers[name] ??= []).push(h.value)
  }
  let text: string | null = null
  let html: string | null = null
  const attachments: AttachmentMeta[] = []
  let dsnStatus: string | null = null
  let dsnHeaders: string | null = null

  const walk = (part: GmailMessagePart, depth: number) => {
    if (depth > 30) return
    const mimeType = (part.mimeType ?? '').toLowerCase()
    const disposition = (headerOf(part, 'content-disposition') ?? '').toLowerCase()
    const contentId = headerOf(part, 'content-id')?.replace(/^<|>$/g, '') ?? null
    const filename = part.filename ?? ''
    const isAttachment =
      !!filename || !!part.body?.attachmentId || disposition.startsWith('attachment')
    // Bounce parts (S05-T03): the delivery status and the returned headers, as text, capped.
    if (mimeType === 'message/delivery-status' && dsnStatus === null && part.body?.data) {
      dsnStatus = decodeBody(part.body.data, null).slice(0, DSN_PART_MAX)
    }
    if (mimeType === 'text/rfc822-headers' && dsnHeaders === null && part.body?.data) {
      dsnHeaders = decodeBody(part.body.data, null).slice(0, DSN_PART_MAX)
    }
    if (mimeType === 'message/rfc822' && dsnHeaders === null && part.headers?.length) {
      dsnHeaders = part.headers
        .map((x) => `${x.name ?? ''}: ${x.value ?? ''}`)
        .join('\n')
        .slice(0, DSN_PART_MAX)
    }
    if (part.parts?.length) {
      for (const p of part.parts) walk(p, depth + 1)
      return
    }
    if (!isAttachment && mimeType === 'text/plain' && text === null) {
      text = decodeBody(part.body?.data, charsetOf(headerOf(part, 'content-type')))
      return
    }
    if (!isAttachment && mimeType === 'text/html' && html === null) {
      html = decodeBody(part.body?.data, charsetOf(headerOf(part, 'content-type')))
      return
    }
    if (isAttachment || contentId) {
      attachments.push({
        partId: part.partId ?? String(attachments.length),
        filename: filename || (contentId ? `${contentId}` : 'attachment'),
        mimeType: mimeType || 'application/octet-stream',
        size: part.body?.size ?? 0,
        attachmentId: part.body?.attachmentId ?? null,
        inlineData: part.body?.attachmentId ? null : (part.body?.data ?? null),
        contentId,
        inline:
          disposition.startsWith('inline') ||
          (!!contentId && !disposition.startsWith('attachment')),
      })
    }
  }
  walk(payload, 0)

  const first = (name: string) => headers[name]?.[0] ?? null
  const internal = new Date(Number(message.internalDate ?? Date.now()))
  const dateHeader = first('date')
  const parsedDate = dateHeader ? new Date(dateHeader) : null
  const sentAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : internal
  const from = parseAddressList(first('from'))[0] ?? { address: 'unknown@invalid', name: null }

  return {
    gmailId: message.id ?? '',
    threadId: message.threadId ?? message.id ?? '',
    labelIds: message.labelIds ?? [],
    internalDate: internal.toISOString(),
    sizeEstimate: message.sizeEstimate ?? null,
    headers,
    from,
    to: (headers.to ?? []).flatMap((v) => parseAddressList(v).map((a) => a.address)),
    cc: (headers.cc ?? []).flatMap((v) => parseAddressList(v).map((a) => a.address)),
    subject: first('subject'),
    sentAt: sentAt.toISOString(),
    rfcMessageId: messageIds(first('message-id'))[0] ?? null,
    inReplyTo: messageIds(first('in-reply-to'))[0] ?? null,
    references: messageIds((headers.references ?? []).join(' ')).slice(-50),
    text,
    html,
    attachments,
    dsn:
      dsnStatus !== null || dsnHeaders !== null
        ? { statusText: dsnStatus, returnedHeadersText: dsnHeaders }
        : null,
  }
}

/** The header signals S05's deterministic detectors read (auto-reply, bulk, list, bounce, Ops's own marks). */
export function headerFlags(
  p: ParsedMessage
): Record<
  string,
  string | boolean | { statusText: string | null; returnedHeadersText: string | null }
> {
  const h = (name: string) => p.headers[name]?.[0] ?? null
  const flags: Record<
    string,
    string | boolean | { statusText: string | null; returnedHeadersText: string | null }
  > = {}
  const autoSubmitted = h('auto-submitted')
  if (autoSubmitted && autoSubmitted.toLowerCase() !== 'no') flags.autoSubmitted = autoSubmitted
  const precedence = h('precedence')
  if (precedence) flags.precedence = precedence.toLowerCase()
  if (h('x-autoreply') || h('x-autorespond')) flags.xAutoreply = true
  if (h('x-ms-exchange-inbox-rules-loop')) flags.exchangeRulesLoop = true
  const listId = h('list-id')
  if (listId) flags.listId = listId
  if (h('list-unsubscribe')) flags.listUnsubscribe = true
  const contentType = h('content-type') ?? ''
  if (
    /multipart\/report/i.test(contentType) &&
    /report-type\s*=\s*"?delivery-status/i.test(contentType)
  ) {
    flags.deliveryReport = true
  }
  if (/^(mailer-daemon|postmaster)@/i.test(p.from.address)) flags.bounceSender = true
  const outbound = h('x-indus-outbound')
  if (outbound) flags.xIndusOutbound = outbound.trim()
  const intake = h('x-indus-intake')
  if (intake) flags.xIndusIntake = intake.trim()
  if (p.dsn) flags.dsn = p.dsn
  return flags
}
