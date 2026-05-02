/**
 * Pure helpers for the product Compare feature.
 *
 * The compare page can show up to MAX_COMPARE products side-by-side, but only
 * if every product belongs to the same category AND uses the same spec
 * template — otherwise the rows can't be aligned 1:1 against template fields
 * and the comparison is meaningless.
 *
 * `validateCompareSet` is the gate. `buildCompareRows` then projects the
 * validated products onto the template's ordered fields.
 *
 * DB-touching code (Prisma fetch, page rendering) lives in
 * `apps/storefront/src/app/compare/page.tsx`. Everything in this file is
 * Prisma-free so it can be unit-tested without a DB.
 */

export const MAX_COMPARE = 4

// ── Input types ────────────────────────────────────────────────────────────

export type CompareProductInput = {
  id: string
  sku: string
  title: string
  categoryId: string | null
  specTemplateId: string | null
  specs: Array<{
    templateFieldId: string | null
    value: string
    unit: string | null
  }>
}

export type CompareTemplateField = {
  id: string
  key: string
  label: string
  unit: string | null
  group: string | null
  position: number
}

export type CompareTemplate = {
  id: string
  name: string
  fields: CompareTemplateField[]
}

// ── validateCompareSet ─────────────────────────────────────────────────────

export type CompareValidationError =
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'too_many'; count: number; max: number }
  | { ok: false; reason: 'missing_template'; offendingSkus: string[] }
  | {
      ok: false
      reason: 'mixed_category'
      categoryIds: Array<{ categoryId: string | null; skus: string[] }>
    }
  | {
      ok: false
      reason: 'mixed_template'
      templateIds: Array<{ specTemplateId: string | null; skus: string[] }>
    }

export type CompareValidationResult =
  | { ok: true; categoryId: string; specTemplateId: string }
  | CompareValidationError

/**
 * A valid compare set has 1..MAX_COMPARE products that all share the same
 * non-null categoryId AND the same non-null specTemplateId.
 *
 * Rules check order matters — we report the first failing rule so the UI can
 * tell the user *why* before suggesting a fix.
 */
export function validateCompareSet(products: CompareProductInput[]): CompareValidationResult {
  if (products.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  if (products.length > MAX_COMPARE) {
    return { ok: false, reason: 'too_many', count: products.length, max: MAX_COMPARE }
  }

  const missingTemplate = products.filter((p) => p.specTemplateId === null)
  if (missingTemplate.length > 0) {
    return { ok: false, reason: 'missing_template', offendingSkus: missingTemplate.map((p) => p.sku) }
  }

  const byCategory = groupBySkus(products, (p) => p.categoryId)
  if (byCategory.length > 1) {
    return {
      ok: false,
      reason: 'mixed_category',
      categoryIds: byCategory.map(([categoryId, skus]) => ({ categoryId, skus })),
    }
  }

  const byTemplate = groupBySkus(products, (p) => p.specTemplateId)
  if (byTemplate.length > 1) {
    return {
      ok: false,
      reason: 'mixed_template',
      templateIds: byTemplate.map(([specTemplateId, skus]) => ({ specTemplateId, skus })),
    }
  }

  // All products share the same non-null categoryId and specTemplateId at this point.
  // The non-null assertions are safe: missingTemplate check above eliminates null specTemplateId,
  // and a single-category group with no products is impossible given the empty check.
  const categoryId = products[0]!.categoryId
  const specTemplateId = products[0]!.specTemplateId
  if (categoryId === null) {
    return { ok: false, reason: 'mixed_category', categoryIds: [{ categoryId: null, skus: products.map((p) => p.sku) }] }
  }
  return { ok: true, categoryId, specTemplateId: specTemplateId! }
}

function groupBySkus<K>(
  products: CompareProductInput[],
  key: (p: CompareProductInput) => K,
): Array<[K, string[]]> {
  const map = new Map<K, string[]>()
  for (const p of products) {
    const k = key(p)
    const arr = map.get(k)
    if (arr) arr.push(p.sku)
    else map.set(k, [p.sku])
  }
  return Array.from(map.entries())
}

// ── buildCompareRows ───────────────────────────────────────────────────────

export type CompareCell = {
  /** Joined "value unit" for display, or null when the product has no spec for this field. */
  display: string | null
  /** Raw value (without unit), preserved for things like sort/best-in-row in future. */
  rawValue: string | null
}

export type CompareRow = {
  fieldId: string
  fieldKey: string
  label: string
  /** Per-row unit fallback when individual product specs don't carry one. */
  unit: string | null
  /** One cell per product, in the same order as the input `products` array. */
  cells: CompareCell[]
}

export type CompareSection = {
  group: string
  rows: CompareRow[]
}

/**
 * Project the validated products onto the template's fields, grouped by
 * `field.group` and ordered by `field.position` within each group.
 *
 * Per-product spec lookup is by `templateFieldId === field.id`. Specs whose
 * `templateFieldId` is null (free-form additional specs) are intentionally
 * ignored — the compare table's contract is template-aligned rows only.
 *
 * The returned section list preserves first-seen group order from the
 * template's field list so the page renders sections in the order an admin
 * configured (matching the product detail page).
 */
export function buildCompareRows(
  products: CompareProductInput[],
  template: CompareTemplate,
): CompareSection[] {
  const orderedFields = [...template.fields].sort((a, b) => {
    const groupCmp = (a.group ?? '').localeCompare(b.group ?? '')
    if (groupCmp !== 0) return groupCmp
    return a.position - b.position
  })

  const sectionsByGroup = new Map<string, CompareRow[]>()
  const sectionOrder: string[] = []

  for (const field of orderedFields) {
    const groupName = field.group?.trim() || 'General'
    if (!sectionsByGroup.has(groupName)) {
      sectionsByGroup.set(groupName, [])
      sectionOrder.push(groupName)
    }

    const cells: CompareCell[] = products.map((product) => {
      const spec = product.specs.find((s) => s.templateFieldId === field.id)
      if (!spec) return { display: null, rawValue: null }
      const unit = spec.unit ?? field.unit
      return {
        rawValue: spec.value,
        display: unit ? `${spec.value} ${unit}` : spec.value,
      }
    })

    sectionsByGroup.get(groupName)!.push({
      fieldId: field.id,
      fieldKey: field.key,
      label: field.label,
      unit: field.unit,
      cells,
    })
  }

  return sectionOrder.map((group) => ({ group, rows: sectionsByGroup.get(group)! }))
}
