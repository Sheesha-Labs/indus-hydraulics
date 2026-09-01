/**
 * Body normalisation for inbound procurement mail.
 *
 * This runs before every other parsing step, and getting it wrong is the
 * difference between a parseable body and one long line.
 */

/**
 * Normalise the line endings of a `text/plain` MIME part.
 *
 * The ProcureWare plain-text part separates lines with a **bare `\r`**, not
 * `\r\n`. Measured across 9,707 real messages: skip this and every body
 * collapses to a single line, which silently defeats every line-oriented
 * parser downstream — no exception, just zero items.
 *
 * One regex covers all three conventions: `\r\n` (Windows), a bare `\r`
 * (ProcureWare, and classic Mac), and `\n` (already correct, left alone).
 */
export function normaliseBody(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * Collapse runs of spaces and tabs without touching line structure.
 *
 * Deliberately does NOT collapse newlines: `walkItemMarkers` scans the whole
 * string unanchored, but callers that slice by line still need them intact.
 */
export function collapseInlineWhitespace(text: string): string {
  return text.replace(/[^\S\n]+/g, ' ')
}

/**
 * Full normalisation for a plain-text body: line endings, inline whitespace,
 * trailing spaces, and runs of blank lines.
 */
export function normaliseForParsing(text: string): string {
  return collapseInlineWhitespace(normaliseBody(text))
    .replace(/ +$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
