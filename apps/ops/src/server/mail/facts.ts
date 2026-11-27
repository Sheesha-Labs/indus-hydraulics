import 'server-only'
import { matchCompanyBySender } from '../directory/match-company'
import { opsDb } from '@indus/ops-db'
import {
  domainOf,
  runDetectors,
  splitQuoted,
  type HeaderMap,
  type KnownDomain,
  type MailFacts,
  type SenderRole,
} from '@indus/ops-core'

/**
 * One message as the Assistant sees it (S05-T04): plain JSON (it crosses Inngest steps), read in at most four
 * short queries, with the detectors' facts. Classify (#1), link (#2) and the eval exporter share it.
 *
 * Headers are not stored whole; the S04 fetch keeps the detector signals in `headerFlags`, which are turned
 * back into the header names the detectors read. HTML links are not loaded here (the body HTML is in storage),
 * so the link-mismatch check runs only where a caller passes links.
 */
export interface MailInput {
  messageId: string
  mailboxId: string
  mailboxRole: 'client' | 'supplier' | 'personal'
  threadId: string
  origin: string
  rfcMessageId: string | null
  inReplyTo: string | null
  references: string[]
  fromAddress: string
  fromName: string | null
  senderDomain: string | null
  to: string[]
  cc: string[]
  subject: string
  /** The sender's own words: bodyText above any quoted part, capped. */
  newText: string
  /** The whole stored body (normalised), for resolving quotes. */
  bodyText: string
  bodyTextHash: string | null
  attachments: Array<{ filename: string; mimeType: string; passwordProtected: boolean }>
  previousClass: string | null
  sender: { companyId: string | null; companyName: string | null; role: SenderRole }
  facts: MailFacts
  gmailLabelIds: string[]
}

export const NEW_TEXT_MAX = 6_000

type Flags = Record<string, unknown> | null

/** headerFlags (S04 mime.ts) → the header map the detectors read. */
export function headersFromFlags(flags: Flags): HeaderMap {
  const f = flags ?? {}
  const h: Record<string, string[]> = {}
  const put = (name: string, value: unknown) => {
    if (typeof value === 'string' && value) h[name] = [value]
    else if (value === true) h[name] = ['yes']
  }
  put('auto-submitted', f.autoSubmitted)
  put('precedence', f.precedence)
  put('x-autoreply', f.xAutoreply)
  put('x-ms-exchange-inbox-rules-loop', f.exchangeRulesLoop)
  put('list-id', f.listId)
  put('list-unsubscribe', f.listUnsubscribe)
  put('x-indus-outbound', f.xIndusOutbound)
  if (f.deliveryReport === true)
    h['content-type'] = ['multipart/report; report-type=delivery-status']
  if (typeof f.esp === 'string') h[f.esp] = ['yes']
  return h
}

function roleOf(c: { isClient: boolean; isSupplier: boolean } | null): SenderRole {
  if (!c) return 'unknown'
  if (c.isClient && c.isSupplier) return 'both'
  return c.isClient ? 'client' : c.isSupplier ? 'supplier' : 'unknown'
}

/** Companies with domains, for the phishing look-alike check (cached briefly per process). */
let known: { at: number; rows: KnownDomain[] } | null = null
async function knownDomains(): Promise<KnownDomain[]> {
  if (known && Date.now() - known.at < 5 * 60_000) return known.rows
  const companies = await opsDb.company.findMany({
    where: { domains: { isEmpty: false } },
    select: { name: true, domains: true, isClient: true, isSupplier: true },
    take: 5_000,
  })
  const rows = companies.flatMap((c) =>
    c.domains.map((domain) => ({
      domain: domain.toLowerCase(),
      companyName: c.name,
      role: (c.isClient ? 'client' : c.isSupplier ? 'supplier' : 'other') as KnownDomain['role'],
    }))
  )
  known = { at: Date.now(), rows }
  return rows
}

/** Test seam. */
export function resetKnownDomains(): void {
  known = null
}

export async function loadMailInput(messageId: string, now = new Date()): Promise<MailInput> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      mailboxId: true,
      threadId: true,
      origin: true,
      rfcMessageId: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
      fromAddress: true,
      fromName: true,
      toAddresses: true,
      ccAddresses: true,
      subject: true,
      bodyText: true,
      bodyTextHash: true,
      sentAt: true,
      headerFlags: true,
      authSummary: true,
      gmailLabelIds: true,
      mailbox: { select: { role: true } },
      attachments: { select: { filename: true, mimeType: true, extractionStatus: true } },
    },
  })
  const domain = domainOf(m.fromAddress)
  const [previous, company, firstSeen, domains] = await Promise.all([
    opsDb.mailMessage.findFirst({
      where: { threadId: m.threadId, sentAt: { lt: m.sentAt }, id: { not: m.id } },
      orderBy: { sentAt: 'desc' },
      select: { classification: true },
    }),
    // S10-T01: the directory matcher (contact, then registrable domain; merged → survivor; unique or nothing).
    matchCompanyBySender(m.fromAddress).then((r) =>
      r.match
        ? {
            id: r.match.companyId,
            name: r.match.name,
            isClient: r.match.isClient,
            isSupplier: r.match.isSupplier,
          }
        : null
    ),
    domain
      ? opsDb.mailMessage.findFirst({
          where: {
            fromAddress: { endsWith: `@${domain}`, mode: 'insensitive' },
            id: { not: m.id },
          },
          orderBy: { sentAt: 'asc' },
          select: { sentAt: true },
        })
      : Promise.resolve(null),
    knownDomains(),
  ])

  const body = m.bodyText ?? ''
  const newText = splitQuoted(body).fresh.slice(0, NEW_TEXT_MAX)
  const flags = (m.headerFlags as Flags) ?? null
  const dsn =
    (flags?.dsn as
      { statusText?: string | null; returnedHeadersText?: string | null } | undefined) ?? null
  const auth =
    (m.authSummary as {
      spf?: string | null
      dkim?: string | null
      dmarc?: string | null
    } | null) ?? {}
  const attachments = m.attachments.map((a) => ({
    filename: a.filename,
    mimeType: a.mimeType ?? 'application/octet-stream',
    passwordProtected: a.extractionStatus === 'password_protected',
  }))
  const firstSeenDays = firstSeen
    ? Math.max(0, Math.floor((now.getTime() - firstSeen.sentAt.getTime()) / 86_400_000))
    : undefined

  const facts = runDetectors(
    {
      fromAddress: m.fromAddress,
      fromName: m.fromName,
      subject: m.subject,
      bodyText: body,
      headers: headersFromFlags(flags),
      gmailLabels: m.gmailLabelIds,
      auth,
      dsn,
      attachments,
    },
    { knownDomains: domains, firstSeenDomainDays: firstSeenDays }
  )

  const mailboxRole =
    m.mailbox.role === 'client' || m.mailbox.role === 'supplier' ? m.mailbox.role : 'personal'
  return {
    messageId: m.id,
    mailboxId: m.mailboxId,
    mailboxRole,
    threadId: m.threadId,
    origin: m.origin,
    rfcMessageId: m.rfcMessageId,
    inReplyTo: m.inReplyToRfcId,
    references: m.referencesRfcIds,
    fromAddress: m.fromAddress,
    fromName: m.fromName,
    senderDomain: domain,
    to: m.toAddresses,
    cc: m.ccAddresses,
    subject: m.subject ?? '',
    newText,
    bodyText: body,
    bodyTextHash: m.bodyTextHash,
    attachments,
    previousClass: previous?.classification ?? null,
    sender: {
      companyId: company?.id ?? null,
      companyName: company?.name ?? null,
      role: roleOf(company),
    },
    facts,
    gmailLabelIds: m.gmailLabelIds,
  }
}
