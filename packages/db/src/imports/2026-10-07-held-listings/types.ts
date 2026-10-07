export type Faq = { question: string; answer: string }

export type Spec = {
  group: string
  label: string
  value: string
  unit?: string | null
  /** Spec-template field key, when the row is a template field. */
  key?: string
}

/**
 * One listing's rewrite. Every field is optional except `sku`, `was` and
 * `sources`: the runner changes only what an entry names.
 */
export type Entry = {
  sku: string
  /** The listing's title before this rewrite. The runner refuses any other title, unless it is `title` (already applied). */
  was: string
  title?: string
  /** A new slug. The old URL gets a 301 and links to it are rewritten. */
  slug?: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  mpn?: string | null
  descriptionShort?: string
  descriptionLong?: string
  /** Replaces every FAQ. */
  faqs?: Faq[]
  /** Added unless a FAQ with the same question exists. */
  addFaqs?: Faq[]
  /** Replaces every spec row. */
  specs?: Spec[]
  /** Added unless a row with the same label exists. */
  addSpecs?: Spec[]
  /** Where the facts come from. */
  sources: string[]
}
