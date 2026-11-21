// The document an email body renders in (architecture §4.11, 08 §10.3). Pure, so it is unit-tested without a
// browser. Colours and the type stack come from the generated token values: the frame cannot see the console's
// CSS custom properties.
import { IO_VALUES } from '../tokens.generated'
import type { SanitizedHtml } from './types'

/**
 * The frame's own policy. Nothing loads: no scripts, no fonts, no frames, no remote images (tracking pixels
 * never fire); only data:/blob: images and the base stylesheet. It is ANDed with the console policy the
 * srcdoc document inherits, so it can only narrow it.
 */
export const FRAME_CSP = "default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'"

/** `sandbox=""`: every restriction on, no allow-* token (no scripts, no same-origin, no forms, no popups). */
export const FRAME_SANDBOX = ''

const v = (name: string): string => {
  const value = IO_VALUES[name]
  if (value === undefined) throw new Error(`frame-document: unknown token ${name}`)
  return value
}

/**
 * Base styles for the body, matching the kit's Message body (`km-ml .bd`): 12.5/1.6 ink, p 12×14, 8px between
 * paragraphs, quoted text with a 2px line on the left in ink-3 12px. Fonts cannot load inside the frame, so
 * Geist applies only where it is installed; otherwise the system UI sans.
 */
function baseCss(): string {
  return [
    `html,body{margin:0;background:${v('--io-card')};color:${v('--io-ink')}}`,
    `body{padding:12px 14px;font:12.5px/1.6 ${v('--io-sans')};letter-spacing:-.005em;overflow-wrap:anywhere}`,
    'p{margin:0 0 8px}p:last-child{margin-bottom:0}',
    `blockquote{margin:0 0 8px;padding-left:10px;border-left:2px solid ${v('--io-line')};color:${v('--io-ink-3')};font-size:12px}`,
    'blockquote p{margin:0}',
    'ul,ol{margin:0 0 8px;padding-left:20px}',
    'body>:last-child{margin-bottom:0}',
    `a{color:${v('--io-accent')}}`,
    'img{max-width:100%;height:auto}',
    'table{border-collapse:collapse;max-width:100%}',
  ].join('')
}

const attr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** The srcdoc for one body. The nonce (when given) admits the base stylesheet under the inherited CSP. */
export function frameDocument(html: SanitizedHtml, nonce?: string): string {
  const nonceAttr = nonce ? ` nonce="${attr(nonce)}"` : ''
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">` +
    '<meta name="referrer" content="no-referrer">' +
    `<style${nonceAttr}>${baseCss()}</style>` +
    `</head><body>${html}</body></html>`
  )
}
