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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
