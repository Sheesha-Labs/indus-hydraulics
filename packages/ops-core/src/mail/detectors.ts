import { detectAutoReply, type AutoReplyResult } from './auto-reply'
import { parseBounce, type BounceResult } from './bounce'
import type { HeaderMap } from './headers'
import { detectBulk, type BulkResult } from './mailing-list'
import { assessPhishing, type KnownDomain, type PhishingResult } from './phishing'
import { findReference, type FindReferenceResult } from './reply-attribution'

/**
 * Every deterministic detector over one message (S05-T03). Runs before any model call; its result is stored in
 * `mail_message.flags` and handed to classify (#1) and link (#2) as facts.
 */
export interface DetectorMessage {
  fromAddress: string
  fromName: string | null
  subject: string | null
  bodyText: string | null
  headers: HeaderMap
  gmailLabels: readonly string[]
  auth: { spf?: string | null; dkim?: string | null; dmarc?: string | null }
  links?: ReadonlyArray<{ text: string; href: string }>
  /** server/gmail/mime keeps these (≤ 16 KB each). */
  dsn?: { statusText?: string | null; returnedHeadersText?: string | null } | null
  attachments?: ReadonlyArray<{ filename: string; passwordProtected?: boolean }>
}

export interface DetectorContext {
  knownDomains: readonly KnownDomain[]
  firstSeenDomainDays?: number | undefined
}

export interface MailFacts {
  autoReply: AutoReplyResult
  bounce: BounceResult
  bulk: BulkResult
  phishing: PhishingResult
  reference: FindReferenceResult
  attachments: { count: number; passwordProtected: string[] }
}

export function runDetectors(message: DetectorMessage, ctx: DetectorContext): MailFacts {
  const attachments = message.attachments ?? []
  return {
    autoReply: detectAutoReply({
      headers: message.headers,
      subject: message.subject,
      bodyText: message.bodyText,
    }),
    bounce: parseBounce({
      fromAddress: message.fromAddress,
      headers: message.headers,
      dsnText: message.dsn?.statusText ?? null,
      returnedHeadersText: message.dsn?.returnedHeadersText ?? null,
      bodyText: message.bodyText,
    }),
    bulk: detectBulk({ headers: message.headers }),
    phishing: assessPhishing({
      fromAddress: message.fromAddress,
      fromName: message.fromName,
      auth: message.auth,
      gmailLabels: message.gmailLabels,
      knownDomains: ctx.knownDomains,
      ...(ctx.firstSeenDomainDays === undefined
        ? {}
        : { firstSeenDomainDays: ctx.firstSeenDomainDays }),
      links: message.links ?? [],
      bodyText: message.bodyText,
    }),
    reference: findReference(message.bodyText, message.subject),
    attachments: {
      count: attachments.length,
      passwordProtected: attachments.filter((a) => a.passwordProtected).map((a) => a.filename),
    },
  }
}

/** Links in an HTML body as { text, href }, for the link-mismatch check. Regex, not a DOM: text only. */
export function linksFromHtml(html: string | null): Array<{ text: string; href: string }> {
  if (!html) return []
  const out: Array<{ text: string; href: string }> = []
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  for (let m = re.exec(html); m && out.length < 200; m = re.exec(html)) {
    const text = (m[2] ?? '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (/^https?:/i.test(m[1] ?? '')) out.push({ href: m[1]!, text })
  }
  return out
}
