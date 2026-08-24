import 'server-only'

/**
 * The parts every designed-page enquiry action needs, and that none of them
 * should own a private copy of.
 *
 * The two actions themselves stay separate — `/industries/…` asks for an
 * application and `/manufacturing` asks for a process route, so their Zod
 * schemas and their RFQ context blocks genuinely differ. What does not differ
 * is the bot floor and the attachment manifest, and those are the two pieces
 * where a divergent copy would be a security bug rather than a styling one.
 */

/** The shape `RfqAttachments` posts, once validated. */
export type EnquiryAttachment = {
  path: string
  label: string
  size: number
  contentType: string
}

/**
 * Anti-spam floor. A human takes a few seconds over these fields; a bot posts
 * instantly. Generous, so a paste-and-go buyer is never blocked.
 *
 * A rejection cannot answer "success" on these forms: they render the returned
 * RFQ reference, and a fabricated one is worse for a real person who trips the
 * check than a plain "try again" is for a bot.
 */
const MIN_FORM_DURATION_MS = 1500

/** Matches only the paths /api/rfq/attachments/sign generates. */
const ATTACHMENT_PATH = /^rfq-attachments\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/

/** Most attachments a single enquiry may carry — matches the field's own cap. */
const MAX_ATTACHMENTS = 6

/**
 * The honeypot and timing checks, as one call.
 *
 * Returns the message to refuse with, or `null` to carry on. The honeypot's
 * reply is deliberately vague and names the sales inbox, so a person who
 * somehow trips it still has a way through.
 */
export function rejectAsBot(formData: FormData): string | null {
  // A real browser never populates an off-screen field with no label.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return 'Something went wrong. Email sales@indushydraulics.me and we will pick it up.'
  }

  const startedAtRaw = formData.get('formStartedAt')
  const startedAt = typeof startedAtRaw === 'string' ? Number(startedAtRaw) : Number.NaN
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FORM_DURATION_MS) {
    return 'That was quick — give the form a moment and try again.'
  }

  return null
}

/**
 * Attachments arrive as a manifest of storage paths, never as bytes — the
 * browser uploaded them straight to the private documents bucket against a
 * single-use signed URL.
 *
 * Everything here is still untrusted. The path must match the shape the server
 * itself generates, so a caller cannot point an `RfqAttachment` at an arbitrary
 * object elsewhere in the bucket.
 */
export function readAttachments(raw: FormDataEntryValue | null): EnquiryAttachment[] {
  if (typeof raw !== 'string' || !raw.trim() || raw === '[]') return []
  const out: EnquiryAttachment[] = []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    for (const entry of parsed.slice(0, MAX_ATTACHMENTS)) {
      if (!entry || typeof entry !== 'object') continue
      const { path, label, size, contentType } = entry as Record<string, unknown>
      if (typeof path !== 'string' || !ATTACHMENT_PATH.test(path)) continue
      out.push({
        path,
        label: typeof label === 'string' ? label.slice(0, 180) : 'attachment',
        size: typeof size === 'number' && Number.isFinite(size) ? size : 0,
        contentType: typeof contentType === 'string' ? contentType.slice(0, 120) : 'application/octet-stream',
      })
    }
  } catch {
    // A malformed manifest loses the attachments but must never lose the
    // enquiry — the enquiry is what matters commercially.
  }
  return out
}

/**
 * The `Media.kind` a stored attachment should take.
 *
 * Three buckets, because that is all the enum offers and all the admin's
 * attachment list distinguishes: an image previews, a PDF opens in a viewer,
 * everything else is a CAD-ish download.
 */
export function attachmentMediaKind(contentType: string): 'image' | 'document' | 'cad' {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType === 'application/pdf') return 'document'
  return 'cad'
}

/**
 * Only a choice the page actually offered.
 *
 * A typed or tampered value is dropped rather than recorded, so the desk never
 * reads a routing hint the form could not have produced.
 */
export function allowedChoice(value: string | undefined, choices: readonly string[]): string {
  return value && choices.includes(value) ? value : ''
}
