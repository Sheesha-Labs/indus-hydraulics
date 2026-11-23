import { convert } from 'html-to-text'
import sanitizeHtml from 'sanitize-html'

/**
 * Inbound HTML, made safe to store and later show in the sandboxed frame (S04-T05, 08-map-integrations §1.6):
 * no script, style, iframe, object, form or on* handler, no javascript: URL; remote images removed and marked
 * `data-blocked` (the S05 image proxy may show them on request); `cid:` images rewritten to `/api/files/<id>`
 * when the inline part was stored.
 */
export const MAIL_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    'a',
    'abbr',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'col',
    'colgroup',
    'dd',
    'div',
    'dl',
    'dt',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'q',
    's',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
    'font',
    'center',
  ],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height', 'data-blocked'],
    td: ['colspan', 'rowspan', 'align', 'valign'],
    th: ['colspan', 'rowspan', 'align', 'valign'],
    table: ['cellpadding', 'cellspacing', 'border', 'width'],
    font: ['color', 'size'],
    '*': ['dir', 'lang'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['cid', 'data'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'title', 'head'],
}

export function sanitizeMailHtml(
  html: string,
  cidMap: ReadonlyMap<string, string> = new Map()
): string {
  return sanitizeHtml(html, {
    ...MAIL_SANITIZE,
    transformTags: {
      img: (tagName, attribs) => {
        const src = attribs.src ?? ''
        if (src.toLowerCase().startsWith('cid:')) {
          const fileId = cidMap.get(src.slice(4).replace(/^<|>$/g, ''))
          if (fileId) return { tagName, attribs: { ...attribs, src: `/api/files/${fileId}` } }
        }
        if (src.startsWith('data:image/')) return { tagName, attribs }
        // Remote (or unresolved cid) image: no fetch from the console, ever.
        const { src: _src, ...rest } = attribs
        return { tagName, attribs: { ...rest, 'data-blocked': 'remote-image' } }
      },
    },
    // Keep the rewritten /api/files/<id> src (a relative URL is not a scheme).
    allowedSchemesAppliedToAttributes: ['href', 'cite'],
  })
}

/** The plain text of an HTML-only message (links kept as text, images dropped). */
export function htmlToText(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'img', format: 'skip' },
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true, ignoreHref: false } },
    ],
  })
}
