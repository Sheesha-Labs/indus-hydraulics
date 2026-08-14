/**
 * Allow-list HTML sanitiser for `Product.descriptionLong`.
 *
 * Why this exists: the storefront PDP renders descriptionLong via
 * `dangerouslySetInnerHTML` (apps/web/src/components/ProductTabs.tsx:106).
 * If a malicious value lands in the DB — through a future CSV import, a
 * compromised data file, or bad copy-paste from a vendor's site — it would
 * execute in users' browsers. We sanitise at import time so that only safe
 * tags/attributes survive.
 *
 * Note on `Product.descriptionLong` schema comment: it says "markdown/rich
 * text" but the storefront treats it as raw HTML. If anyone later wires in a
 * Markdown parser, the import path will need to switch from "store HTML
 * directly" to "store Markdown verbatim, render via parser". This file's
 * sanitiser still works as a defence-in-depth check for either case.
 *
 * Why not DOMPurify: the `jsdom` + `DOMPurify` combo adds ~5 MB to the deps
 * tree for what is essentially a 60-line allow-list filter for a known set
 * of marketing-copy tags. The allow-list approach is pinned to exactly the
 * tags our PDP design uses, so it's stricter than DOMPurify's defaults.
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'span',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'blockquote',
  'code',
  'pre',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
])

/** Per-tag allow-list of attributes. Tags not listed here keep no attributes. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  span: new Set(['class']),
  th: new Set(['scope']),
}

/** Tag/attr regex — quick-and-dirty parse, NOT a full HTML parser. Sufficient
 *  for input we're already trusted to provide (our own data files); the goal
 *  is defence-in-depth, not parsing arbitrary attacker input. */
const TAG_RX = /<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g
const ATTR_RX = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase()
  // Allow relative URLs and anchors
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true
  // Allow http/https/mailto/tel
  if (/^https?:\/\//.test(trimmed)) return true
  if (/^mailto:/.test(trimmed)) return true
  if (/^tel:/.test(trimmed)) return true
  return false
}

/**
 * Sanitise an HTML string for storage in `Product.descriptionLong`. Removes:
 *   - Disallowed tags (whole element with content kept as text)
 *   - Inline event handlers (`onclick="…"`)
 *   - `javascript:` and `data:` URLs
 *   - Non-allow-listed attributes
 */
export function sanitiseProductHtml(html: string): string {
  if (!html) return html

  // Strip <script>…</script> entirely (content removed)
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  // Strip <style>…</style> entirely (PDP has its own styling)
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '')
  // Strip HTML comments (which can hide IE conditionals etc.)
  out = out.replace(/<!--[\s\S]*?-->/g, '')

  return out.replace(TAG_RX, (match, tagNameRaw: string, attrsRaw: string) => {
    const tagName = tagNameRaw.toLowerCase()
    if (!ALLOWED_TAGS.has(tagName)) {
      // Disallowed tag — drop the markup, keep nothing for the tag itself
      return ''
    }
    const isClosing = match.startsWith('</')
    if (isClosing) return `</${tagName}>`

    const allowedAttrs = ALLOWED_ATTRS[tagName] ?? new Set<string>()
    const safeAttrs: string[] = []
    let attrMatch: RegExpExecArray | null
    ATTR_RX.lastIndex = 0
    while ((attrMatch = ATTR_RX.exec(attrsRaw)) !== null) {
      const attrName = (attrMatch[1] ?? '').toLowerCase()
      if (!attrName) continue
      const value = attrMatch[3] ?? attrMatch[4] ?? ''
      // Drop event handlers and other dangerous attrs
      if (attrName.startsWith('on')) continue
      if (!allowedAttrs.has(attrName)) continue
      // URL-bearing attrs must be safe
      if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(value)) continue
      // Escape quotes in the value
      const escaped = value.replace(/"/g, '&quot;')
      safeAttrs.push(`${attrName}="${escaped}"`)
    }

    return safeAttrs.length > 0
      ? `<${tagName} ${safeAttrs.join(' ')}>`
      : `<${tagName}>`
  })
}
