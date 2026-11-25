/**
 * Bid-number and revision-token stripping.
 *
 * Portal subject lines glue the bid number and any revision token directly to
 * the title with no separator:
 *
 *     A6-Y260603007EYE DROP
 *     RF2FOR DOCK PUMP ROOM
 *
 * A trailing `\b` on the bid-number pattern does NOT work here, because the
 * character after the number is a letter — `\b` requires a word/non-word
 * boundary and there isn't one. The tokens have to be stripped positionally
 * from the front, iteratively, because a title can carry both.
 *
 * Order matters: punctuation is stripped BEFORE the revision pass, otherwise a
 * leading "-" left behind by the bid number blocks the revision match.
 */

/** e.g. `A6-Y260603007`, `C5-F-2026050004`, `RF2` handled separately. */
const BID_NO = /^([A-Z]{1,3}\d{0,3}(?:-[A-Z]{0,2}\d*)*-[A-Z]?\d{6,})/

/**
 * Revision tokens: `R1`, `R2`, `RF`, `RF2`, `CLONE`.
 *
 * Both `R` and `RF` require trailing digits, EXCEPT bare `RF` which is allowed
 * only when the next character is not a letter. Without that guard, `R\d*`
 * with an empty digit run eats the leading R of ordinary words — "REPAIR OF
 * PUMP" would become "EPAIR OF PUMP" — and bare `RF` would maul "RFQ FOR ...".
 */
const REVISION = /^(R\d+|RF\d+|CLONE\d*|RF(?=[^A-Za-z]))/i

const LEADING_PUNCT = /^[\s\-–—:;,./|]+/

export type BidTokens = {
  /** The title with recognised tokens removed. */
  title: string
  bidNo: string | null
  revision: string | null
}

/**
 * Strip a leading bid number and/or revision token from a raw subject or title.
 *
 * Iterates until nothing more can be removed, so `A6-Y260603007-R2ACTUAL TITLE`
 * yields both tokens. Never returns an empty title when input was non-empty:
 * if stripping would consume everything, the original is kept.
 */
export function stripBidTokens(raw: string): BidTokens {
  let rest = raw.trim()
  let bidNo: string | null = null
  let revision: string | null = null

  for (let pass = 0; pass < 4; pass++) {
    const before = rest
    rest = rest.replace(LEADING_PUNCT, '')

    if (!bidNo) {
      const m = BID_NO.exec(rest)
      if (m) {
        bidNo = m[1]!
        rest = rest.slice(m[1]!.length)
      }
    }

    // Punctuation strip must happen between the two passes, not only before
    // the first: the bid number commonly leaves a "-" that would block this.
    rest = rest.replace(LEADING_PUNCT, '')

    if (!revision) {
      const m = REVISION.exec(rest)
      if (m) {
        revision = m[1]!.toUpperCase()
        rest = rest.slice(m[1]!.length)
      }
    }

    if (rest === before) break
  }

  const title = rest.replace(LEADING_PUNCT, '').trim()
  return {
    title: title.length > 0 ? title : raw.trim(),
    bidNo,
    revision,
  }
}
