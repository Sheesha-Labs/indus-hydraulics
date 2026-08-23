/**
 * The shapes `/services` renders its hero figures and its four approach steps in.
 *
 * The VALUES used to live here as module constants, set by the business owner
 * and bumped by an engineer. They are section values now — Pages & Blocks ·
 * Services · "Hero" and "How we work" — so a figure that changes is a content
 * edit rather than a deploy. What is left is the two prop shapes, which the
 * page maps its section values into.
 *
 * `preview.placeholderLabel` survives as an optional field. It described a
 * photograph nobody has taken; the page now passes an empty string and the
 * panel renders its hatched box with no caption, which is the honest version
 * of the same thing.
 */

export type HeroStat = {
  value: string
  smallSuffix?: string
  label: string
}

export type ApproachStep = {
  number: string // "/01"
  title: string
  body: string
  preview: {
    tagLabel: string // "STEP 02 · MEASURE & QUOTE"
    title: string
    body: string
    deliverables: string[]
    placeholderLabel: string
  }
}
