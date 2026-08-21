import type { Metadata } from 'next'

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

/** The three brand images an operator can upload, as stored. */
export type BrandUrls = {
  searchLogoUrl: string | null
  faviconUrl: string | null
  logoUrl: string | null
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
export function resolveSearchIcon(urls: BrandUrls, baseUrl: string): string | null {
  const picked = urls.searchLogoUrl ?? urls.faviconUrl ?? urls.logoUrl
  if (!picked) return null
  return picked.startsWith('/') ? `${baseUrl.replace(/\/+$/, '')}${picked}` : picked
}

/**
 * The paths the crawlable copies of the two brand marks are served from. Same
 * origin, and fixed forever — see the route handlers for why both matter.
 *
 * Two rather than one because the operator uploads two files for two jobs: a
 * favicon authored to survive 16px in a tab strip, and a search mark authored
 * to stand for the brand in a result row. They are declared as two icon links
 * of different sizes, which is the documented way to offer both.
 */
export const BRAND_ICON_PATH = '/brand-icon.png'
export const TAB_ICON_PATH = '/tab-icon.png'

/**
 * The tab favicon's source of truth, resolved the other way round from
 * `resolveSearchIcon`: the file authored for the tab wins, and the search mark
 * or the header logo stand in when there is none.
 */
export function resolveTabIcon(urls: BrandUrls, baseUrl: string): string | null {
  return resolveSearchIcon(
    { searchLogoUrl: urls.faviconUrl, faviconUrl: urls.searchLogoUrl, logoUrl: urls.logoUrl },
    baseUrl,
  )
}

/**
 * The URL to hand a crawler for the search mark: this site's own
 * `/brand-icon.png`, or null when the operator has uploaded nothing at all.
 *
 * A same-origin indirection rather than the storage URL `resolveSearchIcon`
 * returns, because Supabase Storage answers public objects with
 * `x-robots-tag: none` — Googlebot-Image is told not to index the file, so the
 * result row keeps its generic globe no matter how correct the markup is. The
 * route re-serves the same bytes from a response this app controls.
 *
 * Both consumers — the `<head>` icon links and the Organization JSON-LD
 * `logo` — go through here, so they cannot disagree.
 */
export function searchIconUrl(urls: BrandUrls, baseUrl: string): string | null {
  if (!resolveSearchIcon(urls, baseUrl)) return null
  return `${baseUrl.replace(/\/+$/, '')}${BRAND_ICON_PATH}`
}

/**
 * The URL to declare for the tab favicon: this site's own `/tab-icon.png`, or
 * null when nothing is uploaded.
 *
 * Same-origin for the same two reasons the search mark is, and both of them
 * apply to this link too, because Google reads *every* `rel="icon"` on the
 * page — not only the sized one:
 *
 *  - a storage URL answers `x-robots-tag: none`, so the icon Google is most
 *    likely to treat as *the* favicon (the unsized one) resolves to a file it
 *    has been told not to index;
 *  - storage keys are minted `${Date.now()}-${filename}`, so the URL changed on
 *    every re-upload, and Google's favicon guidance asks for a stable one.
 *
 * The browser-cache argument for keeping the volatile storage URL here does
 * not survive the route: it answers with `max-age=3600`, so a re-uploaded
 * favicon reaches a returning visitor within the hour, and immediately for
 * everyone else.
 */
export function tabIconUrl(urls: BrandUrls, baseUrl: string): string | null {
  if (!resolveTabIcon(urls, baseUrl)) return null
  return `${baseUrl.replace(/\/+$/, '')}${TAB_ICON_PATH}`
}

/**
 * `Metadata['icons']` is a union: a bare URL, an array of icons, or the keyed
 * block with `icon` / `shortcut` / `apple`. We always build the keyed block —
 * narrowing here is what lets a caller (and a test) read `.icon` off the
 * result without asserting.
 */
type IconsBlock = Exclude<NonNullable<Metadata['icons']>, string | URL | readonly unknown[]>

/**
 * The whole `icons` block for the document head, or undefined when the
 * operator has uploaded nothing.
 *
 * Every href it emits is same-origin, fixed, and served with
 * `x-robots-tag: all`. That is the whole point: the head used to mix three
 * URLs across four links — two of them on a host that answers `noindex` and
 * changes on re-upload — and a crawler resolving one site's favicon from a set
 * like that is the case that leaves the generic mark in the result row.
 *
 * Pure and here rather than inline in the root layout so it can be tested
 * without booting a layout, a font loader or a database — the bug this exists
 * to prevent (icons declared on one layout, absent on the surfaces that do not
 * nest under it) is invisible to typecheck, lint and every rendering test.
 *
 * Undefined means the browser falls back to requesting /favicon.ico, which
 * `public/favicon.ico` answers with the brand mark. That file lives in
 * `public/` and NOT in `app/` on purpose: under the `app/favicon.ico` file
 * convention Next emits its own `<link rel="icon">` unconditionally, so an
 * operator who uploads a favicon would get two competing icon links and no say
 * in which one the browser picks. Do not move it back.
 */
export function buildIconMetadata(urls: BrandUrls, baseUrl: string): IconsBlock | undefined {
  const tab = tabIconUrl(urls, baseUrl)
  const search = searchIconUrl(urls, baseUrl)
  if (!tab && !search) return undefined

  return {
    // Two entries, distinguished by `sizes`: two `rel="icon"` tags that both
    // omit it is an ambiguity, two that declare different sizes is the
    // standard way to offer a tab-sized and a result-row-sized mark. Both
    // resolve even when the operator uploaded only one file — the chains fall
    // back to each other, and the two routes then serve the same bytes.
    icon: [
      ...(tab ? [{ url: tab, type: 'image/png' }] : []),
      ...(search ? [{ url: search, sizes: '192x192', type: 'image/png' }] : []),
    ],
    ...(tab ? { shortcut: tab } : {}),
    // Home-screen bookmarks want a bigger square than a tab strip does — the
    // search-result mark is authored at exactly that size, so it serves here
    // too and iOS scales it. Google documents reading this link for the
    // favicon as well, which is the second reason it must not be a storage URL.
    ...(search || tab ? { apple: search ?? tab! } : {}),
  }
}
