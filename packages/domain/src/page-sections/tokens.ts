/**
 * Live figures inside editable copy.
 *
 * Several headlines and stat tiles quote numbers that come from the catalogue
 * — the active SKU count, the number of published brands, the years since
 * 2003. Freezing those into an editable string would be a slow-motion lie: the
 * moment an editor touched the sentence the number would stop tracking.
 *
 * So editable copy may carry `{skus}`, `{brands}`, `{categories}`,
 * `{industries}`, `{countries}`, `{markets}` or `{years}`, and the renderer
 * substitutes the live value. An unknown token is left VERBATIM rather than
 * blanked — a stray brace in prose ("{see note}") must survive, and a typo'd
 * token should be visible to whoever typed it rather than silently deleting
 * itself.
 */

/**
 * The named tokens are the ones documented in the editor's help text. The
 * index signature is what lets a page add its own — the contact page's
 * `{hours}`, `{phone}` and `{email}` come from store settings, not from the
 * catalogue, and inventing a union member per page would mean editing this
 * file every time a page grew a figure.
 */
export type CopyTokens = Partial<
  Record<
    | 'skus'
    | 'skusFloor'
    | 'brands'
    | 'categories'
    | 'industries'
    | 'countries'
    | 'markets'
    | 'years',
    string | number
  >
> &
  Record<string, string | number | undefined>

const TOKEN = /\{([a-zA-Z]+)\}/g

export function interpolate(text: string, tokens: CopyTokens): string
export function interpolate(text: null | undefined, tokens: CopyTokens): null
export function interpolate(
  text: string | null | undefined,
  tokens: CopyTokens,
): string | null
export function interpolate(
  text: string | null | undefined,
  tokens: CopyTokens,
): string | null {
  if (text === null || text === undefined) return null
  return text.replace(TOKEN, (whole, name: string) => {
    const value = tokens[name as keyof CopyTokens]
    if (value === undefined || value === null) return whole
    return typeof value === 'number' ? value.toLocaleString('en-GB') : value
  })
}

/** The token names an editor may use, for the help text under a copy field. */
export const COPY_TOKEN_NAMES = [
  'skus',
  'skusFloor',
  'brands',
  'categories',
  'industries',
  'countries',
  'markets',
  'years',
] as const
