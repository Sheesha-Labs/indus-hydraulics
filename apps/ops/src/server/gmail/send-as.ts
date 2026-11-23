import 'server-only'
import sanitizeHtml from 'sanitize-html'
import type { GmailApi, GmailSendAs } from './client'

/**
 * Send-as aliases and the signature (S04-T02, 08-map-integrations §1.2 "After connecting", §1.9). The Gmail API
 * does not add the Gmail signature to API sends, so Ops inserts the sender's block itself (board 85 note); the
 * default alias's signature seeds it, sanitised, and is edited in Settings › Sending.
 */
export const SIGNATURE_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'div', 'span', 'a', 'ul', 'ol', 'li'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['https', 'mailto', 'tel'],
  // No remote images, styles or scripts in a signature Ops will send.
  disallowedTagsMode: 'discard',
}

export function sanitizeSignature(html: string | null | undefined): string | null {
  const clean = sanitizeHtml(html ?? '', SIGNATURE_SANITIZE).trim()
  return clean.length ? clean : null
}

export type SendAsSummary = {
  /** Accepted aliases, the primary first. */
  aliases: string[]
  defaultAlias: string | null
  signatureHtml: string | null
}

export function summariseSendAs(list: GmailSendAs[]): SendAsSummary {
  const accepted = list.filter(
    (s) => s.sendAsEmail && (s.isPrimary || s.verificationStatus === 'accepted')
  )
  accepted.sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
  const def = accepted.find((s) => s.isDefault) ?? accepted[0] ?? null
  return {
    aliases: accepted.map((s) => (s.sendAsEmail as string).toLowerCase()),
    defaultAlias: def?.sendAsEmail?.toLowerCase() ?? null,
    signatureHtml: sanitizeSignature(def?.signature),
  }
}

export async function detectSendAs(client: GmailApi): Promise<SendAsSummary> {
  return summariseSendAs(await client.settings.sendAs.list())
}

/** A signature as plain lines for the board 86 / 80 preview (no HTML enters the console DOM). */
export function signatureLines(html: string | null | undefined): string[] {
  if (!html) return []
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
  const text = sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12)
}
