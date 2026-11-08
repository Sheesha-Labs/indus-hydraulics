import { toNavChromeItems } from '@indus/domain'
import { getNavMenu, getNavBrands, getNavIndustries } from '../lib/navigation'
import { getStoreSettings } from '../lib/store-settings'
import SiteHeaderClient from './SiteHeaderClient'

/**
 * The site header, and nothing per-visitor in it.
 *
 * The header is mounted in the storefront layout, so a single session or
 * cookie read here would make EVERY page under (storefront) render
 * dynamically — that happened once, to decide between "Sign in" and "My
 * account", and left the whole catalogue uncacheable. The storefront no longer
 * has customer accounts at all; keep everything here static or cross-request
 * cached so the header prerenders.
 */
export default async function SiteHeader() {
  const [headerMenu, megamenu, brands, industries, settings] = await Promise.all([
    getNavMenu('primary_header'),
    getNavMenu('primary_megamenu'),
    getNavBrands(),
    getNavIndustries(),
    getStoreSettings(),
  ])

  return (
    <SiteHeaderClient
      /*
        Projected, not passed whole. Everything below this line crosses into a
        client component and is therefore serialised into the RSC flight
        payload of every page on the site — see the note on `NavChromeItem`.
        The promo panel belongs to a top-level header item, so only that list
        carries the promo fields.
      */
      headerItems={toNavChromeItems(headerMenu?.items ?? [], { withPromo: true })}
      megamenuItems={toNavChromeItems(megamenu?.items ?? [])}
      brands={brands}
      industries={industries}
      contactPhone={settings.contactPhone}
      contactEmail={settings.contactEmail}
      brandName={settings.name}
      logoUrl={settings.logoUrl}
      logoStyle={settings.logoStyle}
    />
  )
}
