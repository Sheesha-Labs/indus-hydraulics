/**
 * Shared vocabulary for the Brand & identity settings panel.
 *
 * Deliberately free of `server-only` and of any DB import: the admin form is a
 * client component and the storefront header renders these same values, so the
 * labels and the style union have to be importable from both sides.
 */

/**
 * What the uploaded header logo actually is.
 *
 * A monogram and a finished lockup want opposite treatment in the top bar —
 * one sits beside the "Indus Hydraulics" wordmark, the other has the name
 * drawn into it already and must replace the type or the name appears twice.
 * The header cannot tell them apart from the bytes, so the operator says which.
 */
export const LOGO_STYLES = ['mark_and_name', 'logo_only'] as const
export type LogoStyle = (typeof LOGO_STYLES)[number]

export const DEFAULT_LOGO_STYLE: LogoStyle = 'mark_and_name'

export const LOGO_STYLE_LABEL: Record<LogoStyle, string> = {
  mark_and_name: 'Mark + wordmark',
  logo_only: 'Logo only',
}

export const LOGO_STYLE_DESCRIPTION: Record<LogoStyle, string> = {
  mark_and_name:
    'The logo sits to the left of the "Indus Hydraulics" wordmark. Best for a square icon or monogram.',
  logo_only:
    'The logo replaces the wordmark and its "Industrial Components Co." sublabel. Use when the file already contains the name.',
}

/** Narrows an arbitrary stored string to a style the header can render. */
export function asLogoStyle(value: string | null | undefined): LogoStyle {
  return value === 'logo_only' ? 'logo_only' : DEFAULT_LOGO_STYLE
}

/**
 * The mark a search engine should draw for this site, or null when the
 * operator has set none of the three.
 *
 * One function rather than a chain repeated at each call site, because the two
 * surfaces that consume it — the `<head>` icon links and the Organization
 * JSON-LD `logo` — must not disagree. A crawler that reads one mark from the
 * head and a different one from the structured data is exactly the case that
 * produces a blank generic icon in the result row.
 *
 * Absolutises a same-origin path, since structured data and icon links are
 * both read by crawlers that have no page context to resolve against.
 */
export function resolveSearchIcon(
  urls: {
    searchLogoUrl: string | null
    faviconUrl: string | null
    logoUrl: string | null
  },
  baseUrl: string,
): string | null {
  const picked = urls.searchLogoUrl ?? urls.faviconUrl ?? urls.logoUrl
  if (!picked) return null
  return picked.startsWith('/') ? `${baseUrl.replace(/\/+$/, '')}${picked}` : picked
}
