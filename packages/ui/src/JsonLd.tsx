/**
 * Renders one or more JSON-LD blocks as `<script type="application/ld+json">`.
 *
 * Usage in a server component:
 *   <JsonLd data={[buildProductLd(...), buildBreadcrumbLd(...)]} />
 *
 * Nulls are filtered out so callers can pass `buildFaqLd(...)` (which returns
 * null when there are no FAQs) without an extra branch.
 */
import * as React from 'react'

export type JsonLdItem = Record<string, unknown> | null | undefined

export interface JsonLdProps {
  data: JsonLdItem | JsonLdItem[]
}

/**
 * JSON for the inside of a `<script>` element.
 *
 * `JSON.stringify` leaves `<` alone, so a string field carrying `</script>` —
 * a product title, an FAQ answer or a `jsonLdOverride` pasted in the SEO
 * console — would end the element early and spill the rest of the payload into
 * the page as markup. `\u003c` is the same character to a JSON parser and is
 * inert to the HTML one. U+2028/U+2029 are escaped for the same reason in
 * older script parsers.
 */
export function serializeJsonLd(item: Record<string, unknown>): string {
  return JSON.stringify(item)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function JsonLd({ data }: JsonLdProps) {
  const items = (Array.isArray(data) ? data : [data]).filter(
    (x): x is Record<string, unknown> => !!x,
  )
  if (items.length === 0) return null
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Server-rendered, payload comes from server-side builders.
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  )
}
