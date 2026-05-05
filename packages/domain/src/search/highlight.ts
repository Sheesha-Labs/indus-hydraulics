/**
 * Sanitises highlighted text returned by Postgres `ts_headline`. The page
 * uses `dangerouslySetInnerHTML` to render `<mark>foo</mark>` snippets,
 * so this allow-list is the single XSS surface for the search results
 * page. EVERY callsite that injects HTML from server-side highlighting
 * MUST go through this function — no exceptions.
 *
 * Allowed: text content, plus PROPERLY BALANCED `<mark>` … `</mark>`
 * pairs (case-insensitive, no attributes). Everything else — other
 * tags, attributes, scripts, event handlers, stray unmatched close
 * tags, encoded entities — is escaped to plain text.
 *
 * The implementation deliberately doesn't accept any attributes on
 * `<mark>` — even seemingly-safe ones like `class`. We don't need them
 * (CSS targets `mark` directly via tag selector), and accepting them
 * would multiply the surface for attribute injection bugs.
 *
 * Strategy: escape the entire input first, then selectively unescape
 * balanced `&lt;mark&gt; … &lt;/mark&gt;` pairs back to real tags. Inner
 * content stays escaped, so `<mark><script></mark>` round-trips as
 * `<mark>&lt;script&gt;</mark>` — visually the user sees the literal
 * text inside the highlight, never executable HTML.
 */

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c] ?? c)
}

export function sanitiseHighlight(input: string | null | undefined): string {
  if (!input) return ''
  const escaped = escapeHtml(input)
  return escaped.replace(/&lt;mark&gt;([\s\S]*?)&lt;\/mark&gt;/gi, '<mark>$1</mark>')
}
