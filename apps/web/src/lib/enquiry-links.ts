/**
 * The two enquiry routes the storefront offers for a part: WhatsApp and email.
 *
 * Moved out of the product page so the category cards' "Inquire" button, the
 * PDP's buttons and the PDP's bottom pop-up all build the same links.
 */

/**
 * wa.me link with the enquiry prefilled. The StoreSettings phone may carry
 * `+`, spaces and dashes; wa.me wants digits only. Null when no usable number
 * is configured, so callers hide the route rather than ship a dead link.
 *
 * The message (owner wording, 2026-11-19) names the product and ends with its
 * page URL on a line of its own. WhatsApp builds a link preview from the FIRST
 * URL in a message, using the page's Open Graph tags — on a product page that
 * is the product's hero image (generateMetadata → ogImagePath), so the person
 * at our end sees which part it is before opening anything.
 */
export function whatsappHref(
  phone: string | null,
  product: { title: string; url?: string | null } | string,
): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null
  const p = typeof product === 'string' ? { title: product, url: null } : product
  const lines = [`Hi, I would like to inquire and receive a quotation on ${p.title}.`]
  if (p.url) lines.push('', p.url)
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`
}

/** mailto: with the quotation subject line. Always returns a link. */
export function mailtoQuoteHref(email: string | null, sku: string): string {
  const to = email ?? 'enquiries@indushydraulics.me'
  const subject = encodeURIComponent(`Quotation for ${sku}`)
  return `mailto:${to}?subject=${subject}`
}

/** The single "Inquire" route on a product card: WhatsApp when set up, else email. */
export function inquireHref(
  settings: { contactPhone: string | null; contactEmail: string | null },
  product: { sku: string; title: string; url: string },
): { href: string; external: boolean } {
  const wa = whatsappHref(settings.contactPhone, { title: product.title, url: product.url })
  return wa
    ? { href: wa, external: true }
    : { href: mailtoQuoteHref(settings.contactEmail, product.sku), external: false }
}
