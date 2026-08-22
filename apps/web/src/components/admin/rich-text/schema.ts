import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'

import { CatalogueHtmlAttributes } from './extensions'

/**
 * The one schema a product description is parsed and serialised with.
 *
 * Exported separately from the editor component so the round-trip test can
 * build the same document TipTap builds in the browser. A test that asserted
 * against a schema assembled a second time by hand would pass while the real
 * editor dropped markup — which is exactly the failure this feature has to
 * avoid, since every save overwrites a description that took real work to
 * write.
 */
export const richTextExtensions = [
  StarterKit.configure({
    // The catalogue's descriptions top out at h3 — the product title is the
    // page's h1 and the PDP's own "Product description" is the h2. Offering
    // h1 would let a description outrank the product name in the outline.
    heading: { levels: [2, 3] },
    // Configured below with the storefront's own link handling.
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: 'noopener noreferrer' },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  // `resizable` off deliberately: it writes a `colwidth` attribute onto every
  // cell, and the storefront table is a fluid `width: 100%` — the pixel widths
  // would be both invisible in the admin and wrong on a phone.
  Table.configure({ resizable: false, HTMLAttributes: { class: 'ih-data-table' } }),
  TableRow,
  TableHeader,
  TableCell,
  CatalogueHtmlAttributes,
]
