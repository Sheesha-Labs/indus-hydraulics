/**
 * Country-specific opening words for the homepage hero.
 *
 * The hero headline is "<possessive> premier supplier of <rotating term>".
 * The possessive half is chosen from the visitor's country, which Vercel
 * attaches to every request as `x-vercel-ip-country`.
 *
 * ## Why the possessive is written out per country, not generated
 *
 * There is no rule that turns a country name into its possessive. "The UAE's"
 * and "the DRC's" take a definite article; "Oman's" and "Qatar's" do not.
 * "The Ivory Coast's" does; "Ghana's" does not. Any generator gets one of
 * these wrong eventually, and it gets it wrong in the largest text on the most
 * visited page. So each variant carries its own hand-written string and the
 * test file asserts every one of them reads correctly.
 *
 * ## Why this list is short
 *
 * `markets.ts` has 75 countries. This has six. Every variant is a line of
 * prose somebody has to write and check, and analytics only started recording
 * usable country data on 2026-08-16 — so there is no evidence yet about which
 * of the other 69 are worth the copy. Adding one later is one entry here plus
 * one line in the test — deliberately the cheapest change in the codebase.
 *
 * ## Reading the wording
 *
 * "Saudi Arabia's premier supplier" is a founder decision, taken 2026-08-22
 * against the recommendation in the hero copy architecture. Note that it says
 * something the market pages deliberately do not: `markets.test.ts` blocks any
 * phrasing that implies premises outside Dubai, and a possessive country claim
 * sits close to that line. Those tests only scan `MARKETS` prose, so nothing
 * here fails the build — but if the two ever need to agree, this is the file
 * that moved first.
 */

export type HeroGeoVariant = {
  /** ISO 3166-1 alpha-2, matching `x-vercel-ip-country`. `XX` is the fallback. */
  code: string
  /** Country name. Used in the admin preview and in test failure output. */
  name: string
  /**
   * The possessive that opens the headline, including any definite article and
   * the apostrophe-s. Written by hand — see the note above.
   */
  possessive: string
}

/** The fixed remainder of the headline's first line. */
export const HERO_LEAD_SUFFIX = 'premier supplier of'

/**
 * The country code used when the visitor's country is unknown, unsupported, or
 * the geo header is absent (local development, and every request from a
 * crawler outside these six countries).
 *
 * `XX` is the ISO 3166-1 user-assigned code for "unknown", so it can never
 * collide with a real country we add later.
 */
export const HERO_GEO_FALLBACK_CODE = 'XX'

export const HERO_GEO_VARIANTS: readonly HeroGeoVariant[] = [
  // Home. The only variant where a possessive is literally true — this is a
  // UAE company with a UAE warehouse.
  { code: 'AE', name: 'United Arab Emirates', possessive: "The UAE's" },

  // The five GCC export markets, all on the three-day road lane out of Dubai.
  // Same five, in the same order, as the head of `MARKETS`.
  { code: 'SA', name: 'Saudi Arabia', possessive: "Saudi Arabia's" },
  { code: 'OM', name: 'Oman', possessive: "Oman's" },
  { code: 'QA', name: 'Qatar', possessive: "Qatar's" },
  { code: 'BH', name: 'Bahrain', possessive: "Bahrain's" },
  { code: 'KW', name: 'Kuwait', possessive: "Kuwait's" },

  // Everyone else, and every search crawler — they resolve to US addresses, so
  // this is the headline Google indexes. It has to be the strongest general
  // line we have, not a placeholder: "Dubai" is the higher-volume search term
  // for this business than "UAE".
  { code: HERO_GEO_FALLBACK_CODE, name: 'Fallback', possessive: "Dubai's" },
]

const VARIANTS_BY_CODE = new Map(HERO_GEO_VARIANTS.map((v) => [v.code, v]))

/** Every code we have wording for, including the fallback. */
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
 * Accepts any casing and anything at all — an absent header, a two-letter code
 * we do not cover, a repeated query param, a malformed value — and always
 * returns a usable code. There is no failure mode that renders an empty
 * headline, and no input that throws.
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
 * e.g. `heroLeadFor('SA')` → `"Saudi Arabia's premier supplier of"`.
 */
export function heroLeadFor(input: HeroGeoInput): string {
  return `${heroGeoVariant(input).possessive} ${HERO_LEAD_SUFFIX}`
}
