/**
 * Wrap the first occurrence of a phrase in an article paragraph with a link.
 *
 * Works on the stored HTML fragment, splitting it into tags and text so that a
 * phrase is only ever matched in text — never inside an attribute — and never
 * inside an existing `<a>`. Matching is exact and case-sensitive on purpose:
 * the plan names the words as they appear in the article, and a miss is
 * reported rather than guessed at.
 */

export type LinkResult = { html: string; linked: boolean }

const TAG = /(<[^>]+>)/

export function linkFirstOccurrence(html: string, phrase: string, href: string): LinkResult {
  if (!phrase) return { html, linked: false }
  const parts = html.split(TAG)
  let insideAnchor = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (part.startsWith('<')) {
      if (/^<a[\s>]/i.test(part)) insideAnchor++
      else if (/^<\/a\s*>/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1)
      continue
    }
    if (insideAnchor > 0) continue
    const at = part.indexOf(phrase)
    if (at === -1) continue
    parts[i] =
      part.slice(0, at) +
      `<a href="${href}">${phrase}</a>` +
      part.slice(at + phrase.length)
    return { html: parts.join(''), linked: true }
  }
  return { html, linked: false }
}

/** Whether a fragment already links to `href`. */
export function linksTo(html: string, href: string): boolean {
  return html.includes(`href="${href}"`)
}
