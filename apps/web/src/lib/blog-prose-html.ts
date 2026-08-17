import sanitizeHtml from 'sanitize-html'

/**
 * Allow-list sanitiser for author-written article HTML.
 *
 * `prose`, `paragraph` and `lead` blocks all carry HTML that the article page
 * injects with `dangerouslySetInnerHTML`. Nothing between the editor and that
 * injection constrains it: the body reaches the server action as a plain
 * string, so the editor's extension set is a client-side convention, not a
 * boundary. Import scripts and hand-edited rows write the column directly too.
 *
 * So this is the boundary, and it runs on save rather than on render — the
 * article page is prerendered and revalidated, and paying for a sanitiser pass
 * on every reader to protect against something only a writer can introduce is
 * the wrong trade. It is idempotent, so re-sanitising already-clean HTML is a
 * no-op and a second call anywhere is harmless.
 *
 * The tag list must stay a superset of what the editor can produce, or an
 * author's next save silently destroys their own formatting.
 */
const ALLOWED_TAGS = [
  'p',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'strong',
  'b',
  'em',
  'i',
  's',
  'code',
  'pre',
  'br',
  'a',
]

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  // http/https/mailto/tel only. This is what keeps `javascript:` out of href.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href'],
  // Drop the CONTENTS of a stripped tag, not just the tag. Without this,
  // `<script>alert(1)</script>` sanitises down to a bare `alert(1)` text node
  // sitting in the middle of the article.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
  transformTags: {
    // An author-written link can point anywhere. `noopener` closes the
    // reverse-tabnabbing hole that `target="_blank"` opens; every external
    // link the editor writes carries it.
    a: (tagName, attribs) => {
      const out: Record<string, string> = { ...attribs }
      if (out.target === '_blank') out.rel = 'noopener noreferrer'
      return { tagName, attribs: out }
    },
  },
}

export function sanitizeBlogProseHtml(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, OPTIONS)
}

/**
 * True when the fragment carries no visible content — only empty tags and
 * whitespace. An empty paragraph is what TipTap leaves behind when a writer
 * clears a line, and storing it produces a stray gap on the article.
 */
export function isBlankHtml(html: string): boolean {
  return (
    html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim().length === 0
  )
}
