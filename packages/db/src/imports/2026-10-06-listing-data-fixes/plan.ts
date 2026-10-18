/**
 * Pure planning for the listing fixes: which rule touches which product, and
 * what each field becomes. Nothing here reads or writes the database, so the
 * rules can be tested without one; `run.ts` loads, validates and writes.
 */

/** A SKU list, or a SKU pattern. A pattern must not carry the g flag. */
export type Scope = readonly string[] | RegExp

export const PRODUCT_TEXT_FIELDS = [
  'title',
  'seoTitle',
  'seoDescription',
  'descriptionShort',
  'descriptionLong',
] as const
export type ProductTextField = (typeof PRODUCT_TEXT_FIELDS)[number]

/** Every field a visitor can read, product row and child rows alike. */
export type TextField = ProductTextField | 'spec' | 'faq' | 'alt'

export type TextRule = {
  id: string
  scope: Scope
  /** A string matches literally, every occurrence. A RegExp must carry the g flag. */
  find: string | RegExp
  replace: string
  /** Defaults to every visible text field. */
  fields?: readonly TextField[]
}

export type SpecRule =
  | { id: string; scope: Scope; op: 'delete'; label: string }
  | { id: string; scope: Scope; op: 'set'; label: string; value: string; unit?: string | null }
  /** Renames a row and detaches it from its template field, which no longer describes it. */
  | {
      id: string
      scope: Scope
      op: 'relabel'
      label: string
      to: string
      value: string
      unit?: string | null
    }

export type VariantRule = {
  id: string
  scope: Scope
  /** The new dimensions, or null when this variant needs nothing. */
  apply: (dims: Record<string, unknown>, partNumber: string) => Record<string, unknown> | null
}

/** Whole-field rewrites for a listing whose template text is wrong throughout. */
export type FieldSet = {
  id: string
  sku: string
  fields: Partial<Record<ProductTextField, string>>
  /** Replaces every FAQ on the product, in this order. */
  faqs?: ReadonlyArray<{ question: string; answer: string }>
}

/** A pattern that must not survive in scope once the rules have run. */
export type Guard = { scope: Scope; pattern: RegExp; why: string }

export type ProductState = {
  sku: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  descriptionShort: string | null
  descriptionLong: string | null
  specs: ReadonlyArray<{ id: string; label: string; value: string; unit: string | null }>
  faqs: ReadonlyArray<{ id: string; question: string; answer: string }>
  images: ReadonlyArray<{ id: string; alt: string | null }>
  variants: ReadonlyArray<{ id: string; partNumber: string; dimensions: unknown }>
}

export type ProductPlan = {
  sku: string
  fields: Partial<Record<ProductTextField, string>>
  specUpdates: Array<{
    id: string
    label: string
    value: string
    unit: string | null
    detach: boolean
  }>
  specDeletes: string[]
  faqUpdates: Array<{ id: string; question: string; answer: string }>
  /** Set when a FieldSet replaces the FAQs outright. */
  faqReplace: Array<{ question: string; answer: string }> | null
  altUpdates: Array<{ id: string; alt: string }>
  variantUpdates: Array<{ id: string; partNumber: string; dimensions: Record<string, unknown> }>
  /** Rule id → number of replacements or rows it accounts for on this product. */
  hits: Map<string, number>
  /** Every visible string after the plan, for the guards. */
  after: string[]
}

export function inScope(scope: Scope, sku: string): boolean {
  if (scope instanceof RegExp) {
    scope.lastIndex = 0
    return scope.test(sku)
  }
  return scope.includes(sku)
}

/** One rule over one string. Literal finds replace with split/join, so `$` in a replacement is never special. */
export function applyText(
  text: string,
  rule: Pick<TextRule, 'find' | 'replace'>
): { text: string; hits: number } {
  if (typeof rule.find === 'string') {
    const parts = text.split(rule.find)
    return { text: parts.join(rule.replace), hits: parts.length - 1 }
  }
  if (!rule.find.global) throw new Error(`text rule pattern ${rule.find} needs the g flag`)
  const hits = text.match(rule.find)?.length ?? 0
  return hits ? { text: text.replace(rule.find, rule.replace), hits } : { text, hits: 0 }
}

function bump(hits: Map<string, number>, id: string, n = 1): void {
  if (n > 0) hits.set(id, (hits.get(id) ?? 0) + n)
}

function asDims(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/**
 * Applies, in order: field sets, text rules (product fields, spec values, FAQs,
 * image alt text), spec rules, variant rules. Rules run in array order, so a
 * specific rule placed before a general one wins.
 */
export function planProduct(
  p: ProductState,
  rules: {
    fieldSets: readonly FieldSet[]
    text: readonly TextRule[]
    specs: readonly SpecRule[]
    variants: readonly VariantRule[]
  }
): ProductPlan {
  const hits = new Map<string, number>()
  const fields: Record<ProductTextField, string | null> = {
    title: p.title,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    descriptionShort: p.descriptionShort,
    descriptionLong: p.descriptionLong,
  }
  let faqs = p.faqs.map((f) => ({ ...f }))
  let faqReplace: Array<{ question: string; answer: string }> | null = null

  for (const set of rules.fieldSets) {
    if (set.sku !== p.sku) continue
    let changed = 0
    for (const [key, value] of Object.entries(set.fields) as Array<[ProductTextField, string]>) {
      if (fields[key] !== value) changed++
      fields[key] = value
    }
    if (set.faqs) {
      const same =
        faqs.length === set.faqs.length &&
        set.faqs.every((f, i) => faqs[i]?.question === f.question && faqs[i]?.answer === f.answer)
      if (!same) {
        faqReplace = set.faqs.map((f) => ({ ...f }))
        faqs = faqReplace.map((f, i) => ({ id: `new-${i}`, ...f }))
        changed++
      }
    }
    bump(hits, set.id, changed)
  }

  const specs = p.specs.map((s) => ({ ...s, detach: false }))
  const alts = p.images.map((i) => ({ ...i }))

  for (const rule of rules.text) {
    if (!inScope(rule.scope, p.sku)) continue
    const on = (f: TextField) => !rule.fields || rule.fields.includes(f)
    for (const key of Object.keys(fields) as ProductTextField[]) {
      const value = fields[key]
      if (value == null || !on(key)) continue
      const r = applyText(value, rule)
      fields[key] = r.text
      bump(hits, rule.id, r.hits)
    }
    if (on('spec')) {
      for (const s of specs) {
        const r = applyText(s.value, rule)
        s.value = r.text
        bump(hits, rule.id, r.hits)
      }
    }
    if (on('faq')) {
      for (const f of faqs) {
        const q = applyText(f.question, rule)
        const a = applyText(f.answer, rule)
        f.question = q.text
        f.answer = a.text
        bump(hits, rule.id, q.hits + a.hits)
      }
    }
    if (on('alt')) {
      for (const img of alts) {
        if (img.alt == null) continue
        const r = applyText(img.alt, rule)
        img.alt = r.text
        bump(hits, rule.id, r.hits)
      }
    }
  }

  // Text rules may have touched the replacement FAQs too; keep what they made.
  if (faqReplace) faqReplace = faqs.map(({ question, answer }) => ({ question, answer }))

  const deleted = new Set<string>()
  for (const rule of rules.specs) {
    if (!inScope(rule.scope, p.sku)) continue
    for (const s of specs) {
      if (s.label !== rule.label || deleted.has(s.id)) continue
      if (rule.op === 'delete') {
        deleted.add(s.id)
        bump(hits, rule.id)
      } else if (rule.op === 'set') {
        const unit = rule.unit === undefined ? s.unit : rule.unit
        if (s.value !== rule.value || s.unit !== unit) bump(hits, rule.id)
        s.value = rule.value
        s.unit = unit
      } else {
        s.label = rule.to
        s.value = rule.value
        s.unit = rule.unit === undefined ? s.unit : rule.unit
        s.detach = true
        bump(hits, rule.id)
      }
    }
  }

  const variantUpdates: ProductPlan['variantUpdates'] = []
  for (const v of p.variants) {
    let dims = asDims(v.dimensions)
    if (!dims) continue
    let changed = false
    for (const rule of rules.variants) {
      if (!inScope(rule.scope, p.sku)) continue
      const next = rule.apply(dims, v.partNumber)
      if (next) {
        dims = next
        changed = true
        bump(hits, rule.id)
      }
    }
    if (changed && dims)
      variantUpdates.push({ id: v.id, partNumber: v.partNumber, dimensions: dims })
  }

  const plan: ProductPlan = {
    sku: p.sku,
    fields: {},
    specUpdates: [],
    specDeletes: [...deleted],
    faqUpdates: [],
    faqReplace,
    altUpdates: [],
    variantUpdates,
    hits,
    after: [],
  }
  for (const key of Object.keys(fields) as ProductTextField[]) {
    const before = p[key]
    const after = fields[key]
    if (after != null && after !== before) plan.fields[key] = after
    if (after) plan.after.push(after)
  }
  for (const s of specs) {
    if (deleted.has(s.id)) continue
    const before = p.specs.find((x) => x.id === s.id)!
    if (
      s.label !== before.label ||
      s.value !== before.value ||
      s.unit !== before.unit ||
      s.detach
    ) {
      plan.specUpdates.push({
        id: s.id,
        label: s.label,
        value: s.value,
        unit: s.unit,
        detach: s.detach,
      })
    }
    plan.after.push(`${s.label}: ${s.value}`)
  }
  if (!faqReplace) {
    for (const f of faqs) {
      const before = p.faqs.find((x) => x.id === f.id)!
      if (f.question !== before.question || f.answer !== before.answer) {
        plan.faqUpdates.push({ id: f.id, question: f.question, answer: f.answer })
      }
    }
  }
  for (const f of faqs) plan.after.push(`${f.question} — ${f.answer}`)
  for (const img of alts) {
    const before = p.images.find((x) => x.id === img.id)!
    if (img.alt != null && img.alt !== before.alt)
      plan.altUpdates.push({ id: img.id, alt: img.alt })
    if (img.alt) plan.after.push(img.alt)
  }
  return plan
}

export function planIsEmpty(plan: ProductPlan): boolean {
  return (
    Object.keys(plan.fields).length === 0 &&
    plan.specUpdates.length === 0 &&
    plan.specDeletes.length === 0 &&
    plan.faqUpdates.length === 0 &&
    plan.faqReplace === null &&
    plan.altUpdates.length === 0 &&
    plan.variantUpdates.length === 0
  )
}

/** `/p/<slug>` followed by anything that cannot continue a slug. */
export function productHrefPattern(slug: string): RegExp {
  return new RegExp(`/p/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=["'#?/)\\s]|$)`, 'g')
}

/** Rewrites every product link that names a moved slug. Returns the new text and the count. */
export function rewriteProductHrefs(
  text: string,
  moves: ReadonlyArray<{ from: string; to: string }>
): { text: string; hits: number } {
  let out = text
  let hits = 0
  for (const m of moves) {
    const re = productHrefPattern(m.from)
    const n = out.match(re)?.length ?? 0
    if (n) {
      out = out.replace(re, `/p/${m.to}`)
      hits += n
    }
  }
  return { text: out, hits }
}
