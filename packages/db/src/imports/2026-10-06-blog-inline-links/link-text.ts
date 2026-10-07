/**
 * Link the first suitable occurrence of a phrase in a stored HTML fragment.
 *
 * A sibling of `linkFirstOccurrence` in ../2026-10-06-seo-content-fixes, which
 * worked on paragraph blocks only. This one also runs over prose and lead
 * blocks, so it has to refuse three more things:
 *
 *   - text inside a heading — a prose run can carry an h3, and a link in a
 *     heading reads as navigation rather than as part of the argument;
 *   - a match inside a longer token — "R5" inside "100R5", "BSP" inside
 *     "BSPP", "ferrule" inside "ferrules" — so the anchor always covers a
 *     whole word;
 *   - a match before `minOffset` characters of text, which keeps a link out
 *     of the lead's opening words, where the drop cap is drawn.
 *
 * Matching is exact and case-sensitive, and a phrase is only ever matched in
 * text — never in an attribute, never inside an existing `<a>`.
 */

export type LinkResult = { html: string; linked: boolean }

const TAG = /(<[^>]+>)/
const WORD = /[A-Za-z0-9]/

export function linkPhraseInHtml(
  html: string,
  phrase: string,
  href: string,
  opts: { minOffset?: number } = {},
): LinkResult {
  if (!phrase) return { html, linked: false }
  const minOffset = opts.minOffset ?? 0
  const parts = html.split(TAG)
  let insideAnchor = 0
  let insideHeading = 0
  let textSeen = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (part.startsWith('<')) {
      if (/^<a[\s>]/i.test(part)) insideAnchor++
      else if (/^<\/a\s*>/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1)
      else if (/^<h[1-6][\s>]/i.test(part)) insideHeading++
      else if (/^<\/h[1-6]\s*>/i.test(part)) insideHeading = Math.max(0, insideHeading - 1)
      continue
    }
    const start = textSeen
    textSeen += part.length
    if (insideAnchor > 0 || insideHeading > 0) continue
    let from = 0
    for (;;) {
      const at = part.indexOf(phrase, from)
      if (at === -1) break
      from = at + 1
      const before = at > 0 ? part[at - 1]! : ''
      const after = part[at + phrase.length] ?? ''
      if ((before && WORD.test(before)) || (after && WORD.test(after))) continue
      if (start + at < minOffset) continue
      parts[i] = `${part.slice(0, at)}<a href="${href}">${phrase}</a>${part.slice(at + phrase.length)}`
      return { html: parts.join(''), linked: true }
    }
  }
  return { html, linked: false }
}

/** Visible text of a fragment, for locating a paragraph by what it says. */
export function htmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Every href in a fragment, in order. */
export function hrefsIn(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!)
}
