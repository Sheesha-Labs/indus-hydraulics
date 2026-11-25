import 'server-only'
import { isForwardSubject, segmentEmail, type ForwardHeader } from '@indus/ops-core'
import type { ParsedDocument } from './types'

/**
 * An email body for intake (S08-T01, board 36). The text is the stored `mail_message.bodyText` — the exact text
 * spans point into, with its hash so a later change is detected. Segments mark what may be read (fresh text and
 * forwarded enquiries) and what is shown greyed and ignored (earlier replies, the signature).
 */
export interface EmailForParse {
  bodyText: string | null
  bodyTextHash: string | null
  subject: string | null
}

export function parseEmail(m: EmailForParse): ParsedDocument {
  const text = m.bodyText ?? ''
  if (!text.trim()) return { kind: 'unreadable', detail: 'The email has no text body' }
  const segments = segmentEmail(text, { isForward: isForwardSubject(m.subject) })
  const forwards: ForwardHeader[] = segments.flatMap((s) =>
    s.kind === 'forwarded' && s.header ? [s.header] : []
  )
  return { kind: 'email', text, textHash: m.bodyTextHash, segments, forwards }
}

/** The text a reader may extract from, with each piece's offset kept: fresh and forwarded segments only. */
export function readableText(
  doc: Extract<ParsedDocument, { kind: 'email' }>
): Array<{ start: number; text: string }> {
  return doc.segments
    .filter((s) => s.kind === 'fresh' || s.kind === 'forwarded')
    .map((s) => ({ start: s.start, text: doc.text.slice(s.start, s.end) }))
}
