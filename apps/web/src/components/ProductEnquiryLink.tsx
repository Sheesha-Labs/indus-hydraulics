'use client'

import type { ReactNode } from 'react'
import { productEnquiryHref } from '../lib/enquiry-links'

type ProductEnquiryLinkProps = {
  product: { sku: string; title: string; url: string }
  className?: string
  children: ReactNode
}

/**
 * The email "Inquire" link for one product, built from the part's three facts.
 *
 * A client component for payload size only — 2026-11-20. Rendered on the
 * server, the finished `mailto:` (subject plus the eleven-line body, all
 * percent-encoded) is ~900 bytes, and a Server Component's output is written
 * twice: once as HTML and again, JSON-escaped, in the RSC payload. 48 cards a
 * shelf made that ~90 KB of every category page. As a client component the
 * RSC payload carries only `sku`, `title` and `url`; the HTML is identical,
 * because the server still renders the full href.
 */
export default function ProductEnquiryLink({
  product,
  className,
  children,
}: ProductEnquiryLinkProps) {
  return (
    <a
      href={productEnquiryHref(product)}
      aria-label={`Inquire about ${product.title}`}
      className={className}
    >
      {children}
    </a>
  )
}
