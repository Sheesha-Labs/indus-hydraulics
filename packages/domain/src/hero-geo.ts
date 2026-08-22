/**
 * Country-specific opening words for the homepage hero.
 *
 * The hero headline is "<possessive> premier supplier of <rotating term>".
 * The possessive half is chosen from the visitor's country, which Vercel
 * attaches to every request as `x-vercel-ip-country`.
 *
 * ## Why every possessive is written out, and none is generated
 *
 * There is no rule that turns a country name into its possessive, and the
 * failure mode would be the largest text on the most visited page.
 *
 *   - Some take a definite article and some do not: "The Ivory Coast's" and
 *     "The Netherlands'" against "Ghana's" and "Oman's".
 *   - Plural country names take a bare apostrophe — "The United States'",
 *     "The Philippines'" — while singular names that merely end in s take the
 *     full 's: "Laos's", "Belarus's", "Cyprus's", "Honduras's".
 *   - Several official names are unusable at 56px. "The Democratic Republic of
 *     the Congo's premier supplier of hydraulic hoses" is not a headline, and
 *     "Republic of the Congo" reads as the neighbouring country. Those ship as
 *     the short form people actually use: "The DRC's", "Congo-Brazzaville's",
 *     "The UK's".
 *
 * A generator gets one of these wrong eventually and nothing catches it, so
 * the list below is literal data. `hero-geo.test.ts` asserts that every market
 * has an entry — add a country to `markets.ts` without wording here and the
 * build fails rather than silently falling back to Dubai.
 *
 * ## Coverage
 *
 * Home, every export market in `markets.ts`, and a fallback. The GCC six
 * shipped first on 2026-08-22; the rest followed the same day, on the founder's
 * call to cover the whole export list in one pass rather than wait for traffic
 * data to justify each one.
 *
 * ## Reading the wording
 *
 * "premier supplier" is a founder decision, taken 2026-08-22 against the
 * recommendation. It is a superlative the market pages deliberately avoid:
 * `markets.test.ts` blocks any phrasing implying premises outside Dubai, and a
 * possessive country claim sits close to that line. Those tests only scan
 * `MARKETS` prose, so nothing here fails the build — but the two surfaces now
 * say different things, and this is the file that moved.
 *
 * Note also what this does *not* do. Search crawlers resolve to US addresses
 * and so read the fallback, which means none of these variants is ever
 * indexed. They change what a buyer sees once they arrive, not how the site
 * ranks in their country — that is what `/markets/<country>` is for.
 */

export type HeroGeoVariant = {
  /** ISO 3166-1 alpha-2, matching `x-vercel-ip-country`. `XX` is the fallback. */
  code: string
  /**
   * The possessive that opens the headline, including any definite article and
   * the apostrophe. Written by hand — see the note above.
   */
  possessive: string
}

/** The fixed remainder of the headline's first line. */
export const HERO_LEAD_SUFFIX = 'premier supplier of'

/**
 * The country code used when the visitor's country is unknown or unsupported,
 * or the geo header is absent — local development, any non-Vercel host, and
 * every request the edge cannot place.
 *
 * `XX` is the ISO 3166-1 user-assigned code for "unknown", so it can never
 * collide with a real country added later.
 */
export const HERO_GEO_FALLBACK_CODE = 'XX'

export const HERO_GEO_VARIANTS: readonly HeroGeoVariant[] = [
  // Home. The only variant where the possessive is literally true — this is a
  // UAE company with a UAE warehouse. Everywhere else is an export lane.
  { code: 'AE', possessive: "The UAE's" }, // United Arab Emirates

  // GCC — the original five, on the three-day road lane out of Dubai.
  { code: 'SA', possessive: "Saudi Arabia's" }, // Saudi Arabia
  { code: 'OM', possessive: "Oman's" }, // Oman
  { code: 'QA', possessive: "Qatar's" }, // Qatar
  { code: 'BH', possessive: "Bahrain's" }, // Bahrain
  { code: 'KW', possessive: "Kuwait's" }, // Kuwait

  // Wider Middle East and North Africa.
  { code: 'IQ', possessive: "Iraq's" }, // Iraq
  { code: 'EG', possessive: "Egypt's" }, // Egypt
  { code: 'MA', possessive: "Morocco's" }, // Morocco
  { code: 'DZ', possessive: "Algeria's" }, // Algeria
  { code: 'LY', possessive: "Libya's" }, // Libya
  { code: 'TN', possessive: "Tunisia's" }, // Tunisia
  { code: 'TR', possessive: "Turkey's" }, // Turkey
  { code: 'CY', possessive: "Cyprus's" }, // Cyprus

  // East, Central and Southern Africa.
  { code: 'KE', possessive: "Kenya's" }, // Kenya
  { code: 'TZ', possessive: "Tanzania's" }, // Tanzania
  { code: 'RW', possessive: "Rwanda's" }, // Rwanda
  { code: 'BI', possessive: "Burundi's" }, // Burundi
  { code: 'ZA', possessive: "South Africa's" }, // South Africa
  { code: 'SD', possessive: "Sudan's" }, // Sudan
  { code: 'SS', possessive: "South Sudan's" }, // South Sudan
  { code: 'ER', possessive: "Eritrea's" }, // Eritrea
  { code: 'UG', possessive: "Uganda's" }, // Uganda
  { code: 'CD', possessive: "The DRC's" }, // DR Congo
  { code: 'ZM', possessive: "Zambia's" }, // Zambia
  { code: 'ZW', possessive: "Zimbabwe's" }, // Zimbabwe
  { code: 'MZ', possessive: "Mozambique's" }, // Mozambique
  { code: 'NA', possessive: "Namibia's" }, // Namibia
  { code: 'BW', possessive: "Botswana's" }, // Botswana
  { code: 'ET', possessive: "Ethiopia's" }, // Ethiopia
  { code: 'DJ', possessive: "Djibouti's" }, // Djibouti
  { code: 'MG', possessive: "Madagascar's" }, // Madagascar

  // West and Atlantic Africa.
  { code: 'GH', possessive: "Ghana's" }, // Ghana
  { code: 'GN', possessive: "Guinea's" }, // Guinea
  { code: 'CI', possessive: "The Ivory Coast's" }, // Ivory Coast
  { code: 'NG', possessive: "Nigeria's" }, // Nigeria
  { code: 'SN', possessive: "Senegal's" }, // Senegal
  { code: 'MR', possessive: "Mauritania's" }, // Mauritania
  { code: 'AO', possessive: "Angola's" }, // Angola
  { code: 'GA', possessive: "Gabon's" }, // Gabon
  { code: 'CG', possessive: "Congo-Brazzaville's" }, // Republic of the Congo
  { code: 'GQ', possessive: "Equatorial Guinea's" }, // Equatorial Guinea
  { code: 'ML', possessive: "Mali's" }, // Mali
  { code: 'BF', possessive: "Burkina Faso's" }, // Burkina Faso
  { code: 'NE', possessive: "Niger's" }, // Niger
  { code: 'LR', possessive: "Liberia's" }, // Liberia
  { code: 'SL', possessive: "Sierra Leone's" }, // Sierra Leone
  { code: 'CM', possessive: "Cameroon's" }, // Cameroon
  { code: 'TD', possessive: "Chad's" }, // Chad

  // CIS and the Caucasus.
  { code: 'RU', possessive: "Russia's" }, // Russia
  { code: 'KZ', possessive: "Kazakhstan's" }, // Kazakhstan
  { code: 'UZ', possessive: "Uzbekistan's" }, // Uzbekistan
  { code: 'UA', possessive: "Ukraine's" }, // Ukraine
  { code: 'AM', possessive: "Armenia's" }, // Armenia
  { code: 'BY', possessive: "Belarus's" }, // Belarus
  { code: 'MD', possessive: "Moldova's" }, // Moldova
  { code: 'GE', possessive: "Georgia's" }, // Georgia
  { code: 'AZ', possessive: "Azerbaijan's" }, // Azerbaijan

  // South America.
  { code: 'CL', possessive: "Chile's" }, // Chile
  { code: 'PE', possessive: "Peru's" }, // Peru
  { code: 'BO', possessive: "Bolivia's" }, // Bolivia
  { code: 'AR', possessive: "Argentina's" }, // Argentina
  { code: 'CO', possessive: "Colombia's" }, // Colombia
  { code: 'EC', possessive: "Ecuador's" }, // Ecuador
  { code: 'GY', possessive: "Guyana's" }, // Guyana
  { code: 'SR', possessive: "Suriname's" }, // Suriname
  { code: 'BR', possessive: "Brazil's" }, // Brazil
  { code: 'VE', possessive: "Venezuela's" }, // Venezuela
  { code: 'PY', possessive: "Paraguay's" }, // Paraguay
  { code: 'UY', possessive: "Uruguay's" }, // Uruguay

  // South-East Asia.
  { code: 'SG', possessive: "Singapore's" }, // Singapore
  { code: 'MY', possessive: "Malaysia's" }, // Malaysia
  { code: 'ID', possessive: "Indonesia's" }, // Indonesia
  { code: 'TH', possessive: "Thailand's" }, // Thailand
  { code: 'VN', possessive: "Vietnam's" }, // Vietnam
  { code: 'PH', possessive: "The Philippines'" }, // Philippines
  { code: 'MM', possessive: "Myanmar's" }, // Myanmar
  { code: 'KH', possessive: "Cambodia's" }, // Cambodia
  { code: 'LA', possessive: "Laos's" }, // Laos
  { code: 'BN', possessive: "Brunei's" }, // Brunei
  { code: 'TL', possessive: "Timor-Leste's" }, // Timor-Leste

  // North America, Central America and the Caribbean.
  { code: 'US', possessive: "The United States'" }, // the United States
  { code: 'CA', possessive: "Canada's" }, // Canada
  { code: 'MX', possessive: "Mexico's" }, // Mexico
  { code: 'PA', possessive: "Panama's" }, // Panama
  { code: 'TT', possessive: "Trinidad and Tobago's" }, // Trinidad and Tobago
  { code: 'JM', possessive: "Jamaica's" }, // Jamaica
  { code: 'DO', possessive: "The Dominican Republic's" }, // the Dominican Republic
  { code: 'CR', possessive: "Costa Rica's" }, // Costa Rica
  { code: 'GT', possessive: "Guatemala's" }, // Guatemala
  { code: 'HN', possessive: "Honduras's" }, // Honduras

  // Europe.
  { code: 'GB', possessive: "The UK's" }, // the United Kingdom
  { code: 'NO', possessive: "Norway's" }, // Norway
  { code: 'NL', possessive: "The Netherlands'" }, // the Netherlands
  { code: 'DE', possessive: "Germany's" }, // Germany
  { code: 'FR', possessive: "France's" }, // France
  { code: 'IT', possessive: "Italy's" }, // Italy
  { code: 'ES', possessive: "Spain's" }, // Spain
  { code: 'PT', possessive: "Portugal's" }, // Portugal
  { code: 'IE', possessive: "Ireland's" }, // Ireland
  { code: 'BE', possessive: "Belgium's" }, // Belgium
  { code: 'LU', possessive: "Luxembourg's" }, // Luxembourg
  { code: 'DK', possessive: "Denmark's" }, // Denmark
  { code: 'SE', possessive: "Sweden's" }, // Sweden
  { code: 'FI', possessive: "Finland's" }, // Finland
  { code: 'IS', possessive: "Iceland's" }, // Iceland
  { code: 'AT', possessive: "Austria's" }, // Austria
  { code: 'CH', possessive: "Switzerland's" }, // Switzerland
  { code: 'PL', possessive: "Poland's" }, // Poland
  { code: 'CZ', possessive: "Czechia's" }, // Czechia
  { code: 'SK', possessive: "Slovakia's" }, // Slovakia
  { code: 'HU', possessive: "Hungary's" }, // Hungary
  { code: 'RO', possessive: "Romania's" }, // Romania
  { code: 'BG', possessive: "Bulgaria's" }, // Bulgaria
  { code: 'GR', possessive: "Greece's" }, // Greece
  { code: 'MT', possessive: "Malta's" }, // Malta
  { code: 'HR', possessive: "Croatia's" }, // Croatia
  { code: 'SI', possessive: "Slovenia's" }, // Slovenia
  { code: 'RS', possessive: "Serbia's" }, // Serbia
  { code: 'BA', possessive: "Bosnia and Herzegovina's" }, // Bosnia and Herzegovina
  { code: 'MK', possessive: "North Macedonia's" }, // North Macedonia
  { code: 'ME', possessive: "Montenegro's" }, // Montenegro
  { code: 'AL', possessive: "Albania's" }, // Albania
  { code: 'XK', possessive: "Kosovo's" }, // Kosovo
  { code: 'EE', possessive: "Estonia's" }, // Estonia
  { code: 'LV', possessive: "Latvia's" }, // Latvia
  { code: 'LT', possessive: "Lithuania's" }, // Lithuania

  // Everyone else, and every search crawler. "Dubai" is the higher-volume
  // search term for this business than "UAE", and this is the only headline
  // Google ever indexes, so it carries all of the search value.
  { code: HERO_GEO_FALLBACK_CODE, possessive: "Dubai's" }, // Fallback
]

const VARIANTS_BY_CODE = new Map(HERO_GEO_VARIANTS.map((v) => [v.code, v]))

/** Every code we have wording for, including home and the fallback. */
export const HERO_GEO_CODES: readonly string[] = HERO_GEO_VARIANTS.map((v) => v.code)

/**
 * What the two callers can actually hand us.
 *
 * A request header is `string | null`. A Next.js search param is
 * `string | string[] | undefined` — repeat it in the query (`?geo=a&geo=b`)
 * and it arrives as an array, which is why this is not just `string`.
 */
export type HeroGeoInput = string | string[] | null | undefined

/** First value of a repeated query param; the value itself otherwise. */
function firstValue(input: HeroGeoInput): string | undefined {
  return Array.isArray(input) ? input[0] : (input ?? undefined)
}

/**
 * Normalise an incoming country code to one we have wording for.
 *
 * Accepts any casing and anything at all — an absent header, a country we do
 * not cover, a repeated query param, a malformed value — and always returns a
 * usable code. There is no failure mode that renders an empty headline, and no
 * input that throws.
 */
export function resolveHeroGeoCode(input: HeroGeoInput): string {
  const raw = firstValue(input)
  if (!raw) return HERO_GEO_FALLBACK_CODE
  const code = raw.trim().toUpperCase()
  return VARIANTS_BY_CODE.has(code) ? code : HERO_GEO_FALLBACK_CODE
}

export function heroGeoVariant(input: HeroGeoInput): HeroGeoVariant {
  return VARIANTS_BY_CODE.get(resolveHeroGeoCode(input)) ?? VARIANTS_BY_CODE.get(HERO_GEO_FALLBACK_CODE)!
}

/**
 * The full first line of the hero headline for a visitor in `input`.
 *
 * e.g. `heroLeadFor('SA')` -> `"Saudi Arabia's premier supplier of"`.
 */
export function heroLeadFor(input: HeroGeoInput): string {
  return `${heroGeoVariant(input).possessive} ${HERO_LEAD_SUFFIX}`
}
