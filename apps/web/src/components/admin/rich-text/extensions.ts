import { Extension } from '@tiptap/core'

/**
 * Attributes the product catalogue's stored HTML carries that TipTap's own
 * schema has no slot for.
 *
 * These are declared as GLOBAL attributes rather than by extending the node
 * classes, so `StarterKit` and `@tiptap/extension-table` stay stock. An
 * attribute TipTap does not model is not "ignored" — it is DELETED the first
 * time the document is serialised back out, silently, on save. Everything in
 * here was measured against the 1,376 live product descriptions; see
 * `lib/product-rich-text.ts` for the two shapes that need markup surgery
 * rather than an attribute.
 */
export const CatalogueHtmlAttributes = Extension.create({
  name: 'catalogueHtmlAttributes',

  addGlobalAttributes() {
    return [
      {
        // 152 descriptions end on `<p class="source-note">Source: …</p>` — the
        // provenance line under a spec table. Without this it round-trips as
        // an ordinary paragraph and the styling is gone.
        types: ['paragraph'],
        attributes: {
          variant: {
            default: null,
            parseHTML: (element) =>
              element.classList.contains('source-note') ? 'source-note' : null,
            renderHTML: (attributes) =>
              attributes.variant === 'source-note' ? { class: 'source-note' } : {},
          },
        },
      },
      {
        // The `<caption>` is lifted onto the table as `data-caption` before the
        // editor ever sees the markup: TipTap's table content expression is
        // `tableRow+`, so a caption element inside a table has nowhere to live
        // and the parser drops it. `lib/product-rich-text.ts` moves it in and
        // back out again.
        types: ['table'],
        attributes: {
          dataCaption: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-caption'),
            renderHTML: (attributes) =>
              attributes.dataCaption ? { 'data-caption': attributes.dataCaption } : {},
          },
        },
      },
      {
        // Every header cell in the catalogue's tables is `scope="col"`. Losing
        // it costs screen-reader users the column association.
        types: ['tableHeader'],
        attributes: {
          scope: {
            default: 'col',
            parseHTML: (element) => element.getAttribute('scope') ?? 'col',
            renderHTML: (attributes) => (attributes.scope ? { scope: attributes.scope } : {}),
          },
        },
      },
    ]
  },
})
