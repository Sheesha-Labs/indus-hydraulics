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
 */
export function whatsappHref(phone: string | null, sku: string, title?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null
  const text = encodeURIComponent(title ? `Enquiry on ${title} (${sku})` : `Enquiry on ${sku}`)
  return `https://wa.me/${digits}?text=${text}`
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
  sku: string,
  title: string,
): { href: string; external: boolean } {
  const wa = whatsappHref(settings.contactPhone, sku, title)
  return wa ? { href: wa, external: true } : { href: mailtoQuoteHref(settings.contactEmail, sku), external: false }
}
