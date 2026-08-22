import { getNavMenu, getNavBrands, getNavIndustries } from '../lib/navigation'
import { getStoreSettings } from '../lib/store-settings'
import SiteHeaderClient from './SiteHeaderClient'

/**
 * The site header, and nothing per-visitor in it.
 *
 * This used to `await customerSessionOrNull()` to decide between "Sign in" and
 * "My account", and to load the notification list. Because the header is
 * mounted in the storefront layout, that one cookie read made EVERY page under
 * (storefront) render dynamically — /privacy and /terms included, pages with
 * no per-visitor content at all. The whole catalogue was uncacheable to pay
 * for one button.
 *
 * Everything here is now either static or cross-request cached, so the header
 * prerenders. The signed-in half moved to SiteHeaderClient, which asks
 * /api/me after hydration. Do not reintroduce a session or cookie read in this
 * component or anything it renders on the server.
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
      headerItems={headerMenu?.items ?? []}
      megamenuItems={megamenu?.items ?? []}
      brands={brands}
      industries={industries}
      contactPhone={settings.contactPhone}
      contactHours={settings.contactHours}
      brandName={settings.name}
      logoUrl={settings.logoUrl}
      logoStyle={settings.logoStyle}
    />
  )
}
