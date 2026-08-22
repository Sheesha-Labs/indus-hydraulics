/**
 * The two markup shapes a TipTap document cannot carry, moved in and out by
 * hand.
 *
 * A product's `descriptionLong` is HTML — the storefront renders it straight
 * into the page with `dangerouslySetInnerHTML` — and it was edited as raw
 * source in a monospace textarea labelled "Markdown supported", which it never
 * was: of the 1,376 descriptions in the catalogue, 1,355 contain HTML tags and
 * none contain Markdown. Swapping that textarea for a rich-text editor is only
 * safe if the editor gives back the markup it was handed, and two things in
 * the live catalogue do not survive a naive round-trip:
 *
 *   1. `<caption>` — TipTap's table content expression is `tableRow+`, so a
 *      caption inside a table has no legal position and the parser drops it.
 *   2. `<thead>` — prosemirror-tables renders every row into a single
 *      `<tbody>`. `.ih-rich-text thead th` in globals.css is what gives a spec
 *      table its header band, so losing the element loses the styling.
 *
 * Both are handled here as pure transforms around the editor rather than as
 * schema work, which keeps `StarterKit` and `@tiptap/extension-table` stock.
 * Attributes that DO fit on a node — `class="source-note"`, `scope="col"` —
 * are declared in `components/admin/rich-text/extensions.ts`.
 *
 * `product-rich-text.test.ts` round-trips both through a real editor schema
 * against markup taken verbatim from production.
 */

/** The rail a wide spec table scrolls inside. See `.ih-rich-text` in globals.css. */
const TABLE_RAIL_CLASS = 'ih-table-scroll'
/** The class the storefront's table styling hangs off. */
const TABLE_CLASS = 'ih-data-table'

function parseBody(html: string): { doc: Document; body: HTMLElement } {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  return { doc, body: doc.body }
}

function isEmptyParagraph(node: Element | null | undefined): boolean {
  return Boolean(
    node && node.tagName === 'P' && node.children.length === 0 && !node.textContent?.trim(),
  )
}

/**
 * Undo the paragraph ProseMirror puts inside every list item and table cell.
 *
 * `listItem`'s content expression is `paragraph block*` and a table cell's is
 * `block+`, so `<li>Bore: 12 mm</li>` comes back as `<li><p>Bore: 12
 * mm</p></li>`. That is not cosmetic: `.ih-rich-text p` carries a 16px bottom
 * margin, so every spec list on every product page would gain a blank line
 * between its bullets, and every table row would grow by a line.
 */
function unwrapSoleParagraph(host: Element): void {
  const paragraphs = Array.from(host.children).filter((child) => child.tagName === 'P')
  if (paragraphs.length !== 1) return
  const paragraph = paragraphs[0]!
  // A paragraph carrying attributes is saying something — `class="source-note"`
  // is the one that exists — so it stays a paragraph.
  if (paragraph.attributes.length > 0) return
  paragraph.replaceWith(...Array.from(paragraph.childNodes))
}

/**
 * Stored HTML → markup TipTap can parse without losing anything.
 *
 * Unwraps the scroll rail (the editor draws its own frame) and lifts each
 * `<caption>` onto its table as `data-caption`, where the schema has a slot
 * for it.
 */
export function toEditorHtml(stored: string | null | undefined): string {
  if (!stored || !stored.trim()) return ''
  const { body } = parseBody(stored)

  for (const rail of Array.from(body.querySelectorAll(`div.${TABLE_RAIL_CLASS}`))) {
    rail.replaceWith(...Array.from(rail.childNodes))
  }

  for (const table of Array.from(body.querySelectorAll('table'))) {
    const caption = table.querySelector(':scope > caption')
    if (!caption) continue
    const text = caption.textContent?.trim() ?? ''
    if (text) table.setAttribute('data-caption', text)
    caption.remove()
  }

  return body.innerHTML
}

/**
 * TipTap's HTML → the markup that goes in the database and onto the page.
 *
 * Rebuilds the `<thead>` from the leading all-`<th>` rows, puts the caption
 * back as a real element, and re-wraps every table in its scroll rail — which
 * also upgrades the six descriptions whose tables were never wrapped and
 * therefore widened the whole product column on a narrow screen.
 */
export function toStoredHtml(editorHtml: string): string {
  if (!editorHtml.trim()) return ''
  const { doc, body } = parseBody(editorHtml)

  for (const host of Array.from(body.querySelectorAll('li, td, th'))) {
    unwrapSoleParagraph(host)
  }

  for (const table of Array.from(body.querySelectorAll('table'))) {
    // prosemirror-tables writes a `<colgroup>` and a `min-width` on the table
    // even with resizing switched off, and stamps colspan/rowspan="1" on every
    // cell. The storefront table is fluid `width: 100%`, so all of it is dead
    // weight that would be added to 13 descriptions on their first save.
    table.removeAttribute('style')
    table.querySelector(':scope > colgroup')?.remove()
    for (const cell of Array.from(table.querySelectorAll('th, td'))) {
      for (const attribute of ['colspan', 'rowspan']) {
        if (cell.getAttribute(attribute) === '1') cell.removeAttribute(attribute)
      }
      cell.removeAttribute('colwidth')
      cell.removeAttribute('style')
    }

    const captionText = table.getAttribute('data-caption')?.trim() ?? ''
    table.removeAttribute('data-caption')

    const tbody = table.querySelector(':scope > tbody')
    if (tbody) {
      const headerRows: Element[] = []
      for (const row of Array.from(tbody.children)) {
        if (row.tagName !== 'TR') break
        const cells = Array.from(row.children)
        if (cells.length === 0 || !cells.every((cell) => cell.tagName === 'TH')) break
        headerRows.push(row)
      }
      if (headerRows.length > 0) {
        const thead = doc.createElement('thead')
        for (const row of headerRows) thead.appendChild(row)
        table.insertBefore(thead, tbody)
      }
      if (tbody.children.length === 0) tbody.remove()
    }

    if (captionText) {
      const caption = doc.createElement('caption')
      caption.textContent = captionText
      table.insertBefore(caption, table.firstChild)
    }

    table.setAttribute('class', TABLE_CLASS)

    const parent = table.parentElement
    if (!parent || parent.tagName !== 'DIV' || !parent.classList.contains(TABLE_RAIL_CLASS)) {
      const rail = doc.createElement('div')
      rail.className = TABLE_RAIL_CLASS
      table.replaceWith(rail)
      rail.appendChild(table)
    }
  }

  // ProseMirror keeps a trailing paragraph after a block node so there is
  // somewhere to put the caret. Storing it would print a blank line on the
  // product page.
  while (isEmptyParagraph(body.firstElementChild)) body.firstElementChild!.remove()
  while (isEmptyParagraph(body.lastElementChild)) body.lastElementChild!.remove()

  // One top-level block per line, matching what the importers write. TipTap
  // emits the whole document on a single line, which makes a hand-check of a
  // description in the database unreadable.
  return Array.from(body.children)
    .map((child) => child.outerHTML)
    .join('\n')
}

/** True when the editor holds nothing worth saving. */
export function isBlankRichText(editorHtml: string): boolean {
  return toStoredHtml(editorHtml).trim() === ''
}
