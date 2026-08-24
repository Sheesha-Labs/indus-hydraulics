export type { BlogArticleSeed } from '../2026-08-17-blog-articles/shared'

/**
 * Wave 1 of the hose content programme.
 *
 * Six reference articles, all in the specification/identification half of the
 * plan. The seed shape is reused from the August 17 import rather than
 * redefined — one article type, one runner contract.
 *
 * SOURCING RULE FOR THIS WAVE
 *
 * Every pressure, bore, diameter and bend-radius figure published here comes
 * from `HOSE_SIZE_TABLES` in `@indus/domain`, which is the Intertraco catalogue
 * extract already used by `hydraulic-hose-pressure-by-size`. Every thread
 * designation and pitch comes from `product_variants.portLabel` in our own
 * catalogue. Nothing on these pages is recalled, inferred or rounded from
 * memory.
 *
 * Where a figure was NOT available from either source, the article says so in
 * the body rather than filling the gap — see the male-thread-diameter note in
 * `hydraulic-thread-size-and-pitch-reference`, which is the one column a
 * reader would most like and the one we cannot yet stand behind.
 */
