import { scoreProductContent, wordCount } from '@indus/domain'

import type { Entry, Faq, Spec } from './types'

/** A listing as the runner reads it. */
export type Current = {
  id: string
  sku: string
  title: string
  slug: string
  status: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  mpn: string | null
  descriptionShort: string | null
  descriptionLong: string | null
  brandId: string | null
  categoryId: string | null
  weightKg: unknown
  countryOfOrigin: string | null
  faqs: { id: string; question: string; answer: string; position: number }[]
  specs: {
    id: string
    group: string | null
    label: string
    value: string
    unit: string | null
    position: number
  }[]
  counts: { crossReferences: number; documents: number; images: number; variants: number }
}

export type ProductFields = Partial<{
  title: string
  slug: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  mpn: string | null
  descriptionShort: string
  descriptionLong: string
}>

export type Plan = {
  sku: string
  id: string
  product: ProductFields
  /** Every FAQ, in order, when the set changes; null when it stays. */
  faqs: Faq[] | null
  /** FAQs appended after the current ones. */
  addFaqs: Faq[]
  /** Every spec row, in order, when the set changes; null when it stays. */
  specs: Spec[] | null
  /** Rows appended after the current ones. */
  addSpecs: Spec[]
  slugMove: { from: string; to: string } | null
  score: { before: number; after: number; afterText: number }
}

export const stripTags = (html: string) => html.replace(/<[^>]+>/g, ' ')

/** The site's own scorer, as the admin editor and backfill run it (raw word counts). */
export function score(c: ScoreInput, countWords: (s: string | null) => number = wordCount): number {
  return scoreProductContent({
    descriptionShortWords: countWords(c.descriptionShort),
    descriptionLongWords: countWords(c.descriptionLong),
    faqCount: c.faqCount,
    specCount: c.specCount,
    crossReferenceCount: c.crossReferences,
    documentCount: c.documents,
    imageCount: c.images,
    hasBrand: c.brandId != null,
    hasCategory: c.categoryId != null,
    hasFocusKeyword: !!c.focusKeyword?.trim(),
    hasSeoTitleAndDescription: !!c.seoTitle?.trim() && !!c.seoDescription?.trim(),
    hasCommerceAttributes: c.weightKg != null && !!c.countryOfOrigin?.trim() && !!c.mpn?.trim(),
  }).score
}

/** The same score with HTML tags not counted as words — the stricter reading, which the OFS importer used. */
export const textScore = (c: ScoreInput) => score(c, (s) => wordCount(s == null ? s : stripTags(s)))

type ScoreInput = {
  descriptionShort: string | null
  descriptionLong: string | null
  faqCount: number
  specCount: number
  crossReferences: number
  documents: number
  images: number
  brandId: string | null
  categoryId: string | null
  focusKeyword: string | null
  seoTitle: string | null
  seoDescription: string | null
  weightKg: unknown
  countryOfOrigin: string | null
  mpn: string | null
}

const sameFaqs = (a: Faq[], b: Faq[]) =>
  a.length === b.length &&
  a.every((f, i) => f.question === b[i]!.question && f.answer === b[i]!.answer)

const sameSpecs = (cur: Current['specs'], next: Spec[]) =>
  cur.length === next.length &&
  next.every((s, i) => {
    const c = cur[i]!
    return (
      c.label === s.label &&
      c.value === s.value &&
      (c.unit ?? null) === (s.unit ?? null) &&
      (c.group ?? null) === s.group
    )
  })

/**
 * What a rewrite changes on one listing. Throws on a listing that is not the
 * one the entry was written for. A plan that changes nothing has an empty
 * `product`, null `faqs`/`specs` and empty `add…` lists.
 */
export function plan(c: Current, e: Entry): Plan {
  if (c.sku !== e.sku) throw new Error(`${e.sku}: planned against ${c.sku}`)
  if (c.title !== e.was && c.title !== e.title)
    throw new Error(
      `${e.sku}: title is "${c.title}", expected "${e.was}"${e.title ? ` or "${e.title}"` : ''}`
    )
  if (c.status !== 'active') throw new Error(`${e.sku}: status is ${c.status}`)

  const product: ProductFields = {}
  const set = <K extends keyof ProductFields>(
    k: K,
    next: ProductFields[K] | undefined,
    cur: ProductFields[K] | null
  ) => {
    if (next !== undefined && next !== cur) product[k] = next
  }
  set('title', e.title, c.title)
  set('slug', e.slug, c.slug)
  set('seoTitle', e.seoTitle, c.seoTitle)
  set('seoDescription', e.seoDescription, c.seoDescription)
  set('focusKeyword', e.focusKeyword, c.focusKeyword)
  set('mpn', e.mpn, c.mpn)
  set('descriptionShort', e.descriptionShort, c.descriptionShort)
  set('descriptionLong', e.descriptionLong, c.descriptionLong)

  const curFaqs = c.faqs.map(({ question, answer }) => ({ question, answer }))
  const faqs = e.faqs && !sameFaqs(curFaqs, e.faqs) ? e.faqs : null
  const baseFaqs = faqs ?? curFaqs
  const addFaqs = (e.addFaqs ?? []).filter((f) => !baseFaqs.some((x) => x.question === f.question))

  const specs = e.specs && !sameSpecs(c.specs, e.specs) ? e.specs : null
  const baseLabels = (specs ?? c.specs).map((s) => s.label)
  const addSpecs = (e.addSpecs ?? []).filter((s) => !baseLabels.includes(s.label))

  const after = {
    descriptionShort: product.descriptionShort ?? c.descriptionShort,
    descriptionLong: product.descriptionLong ?? c.descriptionLong,
    faqCount: baseFaqs.length + addFaqs.length,
    specCount: (specs ?? c.specs).length + addSpecs.length,
    crossReferences: c.counts.crossReferences,
    documents: c.counts.documents,
    images: c.counts.images,
    brandId: c.brandId,
    categoryId: c.categoryId,
    focusKeyword: product.focusKeyword ?? c.focusKeyword,
    seoTitle: product.seoTitle ?? c.seoTitle,
    seoDescription: product.seoDescription ?? c.seoDescription,
    weightKg: c.weightKg,
    countryOfOrigin: c.countryOfOrigin,
    mpn: product.mpn !== undefined ? product.mpn : c.mpn,
  }
  const before = {
    ...after,
    descriptionShort: c.descriptionShort,
    descriptionLong: c.descriptionLong,
    faqCount: c.faqs.length,
    specCount: c.specs.length,
    focusKeyword: c.focusKeyword,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    mpn: c.mpn,
  }

  return {
    sku: c.sku,
    id: c.id,
    product,
    faqs,
    addFaqs,
    specs,
    addSpecs,
    slugMove: product.slug ? { from: c.slug, to: product.slug } : null,
    score: { before: score(before), after: score(after), afterText: textScore(after) },
  }
}

export const isNoop = (p: Plan) =>
  Object.keys(p.product).length === 0 &&
  !p.faqs &&
  !p.specs &&
  !p.addFaqs.length &&
  !p.addSpecs.length
