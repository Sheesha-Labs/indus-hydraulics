/**
 * Types shared by the designed pages — the hand-built pages that carry their
 * own sections and their own content record rather than being driven by an
 * editable database row.
 *
 * There are two so far: `/industries/data-center-liquid-cooling` and
 * `/manufacturing`. They are siblings by design — same tokens, same section
 * rhythm, same one-navy-panel rule, same enquiry card — so the pieces they
 * genuinely share live here rather than in whichever of them happened to be
 * written first.
 *
 * Deliberately holds NO page records and imports nothing. That is what keeps
 * it free of cycles: each page file imports these types, and the enquiry
 * registry imports the page files.
 */

/** The frames the designed pages draw. A closed set, see the focus note below. */
export type DesignedPageImageRatio = '4/3' | '16/9' | '16/10' | '1/1' | '3/4'

/**
 * Where the subject sits when `object-cover` has to crop.
 *
 * A closed union rather than a free `object-position` string, because the
 * renderer maps it to a Tailwind class and Tailwind cannot generate a class
 * from a value it never sees in source. A new position is a two-line change in
 * both files, and the type stops the version that silently emits no CSS.
 */
export type DesignedPageImageFocus = 'lower'

/**
 * A photograph with its production alt text.
 *
 * `alt` is the alt attribute as it ships — written for the page, not derived
 * from the filename, and never a repeat of the heading beside it.
 */
export type DesignedPageImage = {
  readonly src: string
  readonly alt: string
  readonly ratio: DesignedPageImageRatio
  readonly focus?: DesignedPageImageFocus
}

/**
 * What a designed page's enquiry form needs the server to know.
 *
 * Both pages post to their own action, because their schemas differ — one asks
 * for an application, the other for a process route — but both need the same
 * three things validated server-side: that the page exists, what to call the
 * RFQ, and which options the select was allowed to offer. A posted choice that
 * is not in `choices` is DROPPED rather than recorded, so the desk never reads
 * a routing hint the form could not have produced.
 */
export type DesignedEnquiry = {
  /** Posted with the form and re-resolved server-side. Never trusted as-is. */
  readonly key: string
  /** Names the page in the RFQ subject and in the desk's context block. */
  readonly pageName: string
  /** Absolute path, written into the context block so the desk can open it. */
  readonly path: string
  /** The single select the card offers. */
  readonly choiceLabel: string
  readonly choices: readonly string[]
  /** Goes onto `Rfq.internalNotes` — what the desk should know before quoting. */
  readonly internalNote: string
}
