import 'server-only'
import type { SanitizedHtml } from '@indus/ops-ui/mail'
import { sanitizeMailHtml } from '../gmail/html'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * Email bodies for the reading pane (S05-T05, architecture §4.11). The ONLY producer of SanitizedHtml in the
 * app: stored HTML (already sanitized at fetch) is sanitized again on the way out, and a text-only message is
 * escaped into paragraphs. Bodies render only inside SandboxedBody's `<iframe sandbox="" srcdoc>`; remote
 * images stay blocked (the sanitizer strips their src).
 */
const MAX_BODY_BYTES = 512 * 1024

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Plain text → `<p>` per paragraph, line breaks kept, then sanitized. */
export function textToSanitizedHtml(text: string): SanitizedHtml {
  const html = text
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeText(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
  return sanitizeMailHtml(html) as SanitizedHtml
}

/** The stored HTML body, sanitized again; null when it is missing or too large to show inline. */
export async function readSanitizedBody(
  file: { bucket: string; path: string } | null
): Promise<SanitizedHtml | null> {
  if (!file || file.bucket !== OPS_BUCKETS.mail) return null
  const stream = await getStorage().openRead(OPS_BUCKETS.mail, file.path)
  if (!stream) return null
  const text = await new Response(stream).text()
  if (text.length > MAX_BODY_BYTES) return null
  return sanitizeMailHtml(text) as SanitizedHtml
}
