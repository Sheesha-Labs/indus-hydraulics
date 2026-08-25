/**
 * Deriving a SERP-safe title and meta description for a category.
 *
 * Both are pure string work on copy that already exists. Nothing here invents
 * a fact about a product range: a title is cut down from the title the
 * category already has, and a description is cut down from the description or
 * the on-page paragraph it already has. A category with nothing to cut down
 * gets null back, and the caller leaves it alone.
 *
 * WHY THE TITLES NEED CUTTING. The storefront layout sets Next's title
 * template to `%s | Indus Hydraulics`, so nineteen characters are appended to
 * every stored title. 97 of 195 category titles ran past what Google shows
 * once that happened, and the part it cut was the end — which on this
 * catalogue is where the specific terms live: "…— Cameron U / Shaffer SL /
 * Coiled Tubing / Snubbing" simply vanished.
 *
 * The shape of these titles is consistent and useful: a head phrase, a
 * separator, then an enumeration of what is on the shelf. So the cut keeps the
 * head, then re-adds as many enumerated items as still fit. "Ram BOPs —
 * Cameron U / Shaffer SL / Coiled Tubing / Snubbing" becomes "Ram BOPs —
 * Cameron U / Shaffer SL", which is a real title rather than a truncated one.
 */

/** Google renders roughly this many characters of a title. */
export const TITLE_BUDGET = 60
/** ` | Indus Hydraulics`, appended by the layout to every page title. */
export const TITLE_SUFFIX_COST = 19
/** What a stored title may occupy before the suffix pushes it over. */
export const STORED_TITLE_BUDGET = TITLE_BUDGET - TITLE_SUFFIX_COST

/** Meta descriptions are cut around here in the result. */
export const DESCRIPTION_MAX = 160
/** Below this a description is too thin to be worth serving. */
export const DESCRIPTION_MIN = 70

/**
 * Where a title's head phrase ends.
 *
 * Dash and pipe only — NOT an opening bracket. These titles use brackets for a
 * short gloss the head needs ("Blowout Preventers (BOP)", "Well Control Hoses
 * (API 16C)"), and splitting there threw the gloss away along with everything
 * after it.
 */
const SEPARATORS = /\s*[—–|]\s*/

/** Split at the first occurrence only, keeping the remainder whole. */
function splitOnce(value: string, mark: string): [string, string] {
  const at = value.indexOf(mark)
  return at < 0 ? [value, ''] : [value.slice(0, at), value.slice(at + mark.length)]
}

/** Trim a cut that ended on a joining word or a dangling mark. */
function tidyEnd(value: string): string {
  return value
    .trim()
    .replace(/[\s,;:·—–-]+$/, '')
    .replace(/\s+(and|or|with|for|plus|to|in|on|of)$/i, '')
    .trim()
}

/** Remove a site-name suffix baked into stored copy. */
export function stripSiteName(title: string, siteName = 'Indus Hydraulics'): string {
  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  const suffix = new RegExp(`\\s*[|—–]\\s*${escaped}\\s*$`, 'i')
  let out = title.trim()
  while (suffix.test(out)) {
    const next = out.replace(suffix, '').trim()
    if (!next) break
    out = next
  }
  return out
}

/**
 * A title that survives the suffix, or null when the stored one already does.
 *
 * Order of attempts: strip the site name; keep it if it now fits; otherwise
 * take the head phrase and re-add whole enumerated items while they fit;
 * failing that fall back to the category's own name; failing that cut the head
 * at a word boundary. Never mid-word, and never with an ellipsis — a title
 * ending in "…" tells a reader we could not be bothered.
 */
export function fitCategoryTitle(
  storedTitle: string | null,
  name: string,
  budget = STORED_TITLE_BUDGET,
): string | null {
  const source = stripSiteName(storedTitle?.trim() || name.trim())
  if (!source) return null
  if (source.length <= budget) return source === storedTitle?.trim() ? null : source

  // Two title shapes in this catalogue: "Head — a, b, c" and "Head, a, b, c".
  // Keep whichever punctuation the title already uses, so the shortened one
  // reads like the original rather than like a rewrite.
  const dashed = SEPARATORS.test(source)
  const [headRaw = '', ...restParts] = dashed
    ? source.split(SEPARATORS)
    : splitOnce(source, ', ')
  const tail = restParts.join(' ').trim()
  const headTrimmed = headRaw.trim()

  if (headTrimmed && headTrimmed.length <= budget) {
    // Re-add enumerated items — "A / B / C" or "A, B, C" — while they fit.
    const items = tail
      .split(/\s*[/,]\s*/)
      .map((i) => i.trim())
      .filter(Boolean)
    let out = headTrimmed
    const appended: string[] = []
    for (const item of items) {
      const joiner = appended.length === 0 ? (dashed ? ' — ' : ', ') : dashed ? ' / ' : ', '
      const next = `${out}${joiner}${item}`
      if (next.length > budget) break
      out = next
      appended.push(item)
    }
    /*
      A LONE short item on the end reads as truncation rather than as a title —
      "Well Service & Intervention Hoses — Frac" looks cut off. A run of short
      items does not: "BOP Ram Blocks — Pipe / VBR / Blind" is a list. So the
      test is on the result, not on each item as it goes on.
    */
    if (appended.length === 1 && appended[0]!.length < 6) return headTrimmed
    return out
  }

  const bareName = stripSiteName(name.trim())
  if (bareName && bareName.length <= budget) return bareName

  const words = (headTrimmed || bareName || source).split(/\s+/)
  let out = ''
  for (const word of words) {
    const next = out ? `${out} ${word}` : word
    if (next.length > budget) break
    out = next
  }
  return out || null
}

/**
 * A description inside the SERP budget, or null when the stored one is fine.
 *
 * Cuts at a sentence end where there is one, then at a clause boundary — this
 * catalogue's copy is full of `·`-separated clauses — and only then at a word
 * boundary. A description cut mid-clause reads worse than a shorter one that
 * ends cleanly, so the boundary is preferred even when it costs characters.
 */
export function fitCategoryDescription(
  storedDescription: string | null,
  fallbackParagraph: string | null,
  max = DESCRIPTION_MAX,
): string | null {
  const stored = storedDescription?.trim() || ''
  const source = stored || fallbackParagraph?.trim() || ''
  if (!source) return null
  if (stored && stored.length <= max) return null
  if (source.length <= max) return source === stored ? null : source

  const window = source.slice(0, max + 1)

  /*
    Take the LONGEST clean cut, not the first kind of cut that matches.
    Preferring sentence ends over everything else threw away half of some
    descriptions: a 236-character one whose only early comma sat at 84 got cut
    to 84 while a clause boundary at 118 was sitting there unused.
  */
  const candidates: number[] = []
  const sentence = window.match(/^.*[.!?](?=\s|$)/s)
  if (sentence) candidates.push(sentence[0].length)
  for (const mark of [' — ', ' · ', ', ']) {
    const at = window.lastIndexOf(mark)
    if (at > 0) candidates.push(at)
  }
  const viable = candidates.filter((n) => n >= DESCRIPTION_MIN && n <= max).sort((a, b) => b - a)
  const best = viable[0]
  if (best) {
    /*
      A full stop beats a comma even when it costs a few characters. Taking the
      longest cut alone ended one description on "…casing hangers. 2K-20K",
      where stopping at the sentence would have read as a finished thought.
      Fifteen per cent is the point where the extra words stop being worth an
      unfinished clause.
    */
    const sentenceEnd = sentence ? sentence[0].length : 0
    if (sentenceEnd >= DESCRIPTION_MIN && sentenceEnd >= best * 0.85) {
      return tidyEnd(source.slice(0, sentenceEnd))
    }
    return tidyEnd(source.slice(0, best))
  }

  const space = window.lastIndexOf(' ')
  if (space >= DESCRIPTION_MIN) return tidyEnd(source.slice(0, space))

  return tidyEnd(source.slice(0, max))
}
