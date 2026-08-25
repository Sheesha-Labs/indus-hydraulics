/**
 * Pure helpers for the Spec Template feature.
 *
 * The DB-touching logic lives in `apps/admin/src/app/[locale]/(shell)/spec-templates/actions.ts`.
 * This file extracts the data-shaping decisions (key matching across template
 * switches, required-field validation, value coercion) so they can be unit-
 * tested without a Prisma client.
 */

// ── Template switching ─────────────────────────────────────────────────────

export type SpecWithOldKey = {
  /** ProductSpec.id */
  id: string
  /** SpecTemplateField.key — the OLD field's key, before the switch */
  oldKey: string
}

export type NewTemplateField = {
  /** SpecTemplateField.id (new template) */
  id: string
  /** SpecTemplateField.key (new template) */
  key: string
}

export type TemplateSwitchPlan = {
  /** Specs to re-link to a new field by exact key match. */
  relink: Array<{ specId: string; newFieldId: string }>
  /** Spec ids that didn't match any new field — orphan to free-form (templateFieldId → null). */
  orphan: string[]
}

/**
 * Given a product's currently template-driven specs and the new template's
 * fields, decide which specs should be re-linked (preserving their typed
 * value) and which should be orphaned to the "additional specs" zone.
 *
 * Match strategy: exact key equality, since `key` is the immutable machine
 * name. Renames of `label` don't break the match. If two new fields somehow
 * share a key (shouldn't happen — UNIQUE(templateId, key)), the LAST one wins
 * (Map semantics).
 */
export function planTemplateSwitch(
  oldSpecs: SpecWithOldKey[],
  newFields: NewTemplateField[],
): TemplateSwitchPlan {
  const newByKey = new Map<string, NewTemplateField>()
  for (const f of newFields) newByKey.set(f.key, f)

  const relink: TemplateSwitchPlan['relink'] = []
  const orphan: string[] = []

  for (const s of oldSpecs) {
    const target = newByKey.get(s.oldKey)
    if (target) relink.push({ specId: s.id, newFieldId: target.id })
    else orphan.push(s.id)
  }

  return { relink, orphan }
}

// ── Required-field validation ──────────────────────────────────────────────

export type RequiredFieldDef = {
  id: string
  label: string
  isRequired: boolean
}

export type RequiredCheckResult =
  | { ok: true }
  | { ok: false; missingLabels: string[] }

/**
 * Server-side check that no required field arrives with an empty value.
 * Browser-level `required` attribute is bypassable; this is the source of
 * truth.
 */
export function validateRequiredFields(
  updates: Array<{ fieldId: string; value: string }>,
  fields: RequiredFieldDef[],
): RequiredCheckResult {
  const byId = new Map(fields.map((f) => [f.id, f]))
  const missing: string[] = []
  for (const u of updates) {
    const f = byId.get(u.fieldId)
    if (!f) continue
    if (f.isRequired && u.value.trim() === '') missing.push(f.label)
  }
  return missing.length === 0 ? { ok: true } : { ok: false, missingLabels: missing }
}

// ── Field key generation ───────────────────────────────────────────────────

/**
 * Convert a human label into a stable machine `key`. Lowercase, alphanumerics
 * collapsed by underscores, trimmed of leading/trailing underscores, capped
 * at 80 chars. Falls back to a timestamp-based identifier so we never return
 * an empty string.
 */
export function deriveFieldKey(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80) || `field_${Date.now()}`
  )
}

// ── Value coercion (for storefront / future use) ───────────────────────────

export type SpecFieldDataType = 'text' | 'number' | 'boolean' | 'select'

export type ValueCoercion =
  | { ok: true; value: string }
  | { ok: false; reason: string }

/**
 * Validate a raw text value against a field's data type. Returns the canonical
 * string form to persist (we always store ProductSpec.value as text). Used by
 * the bulk import (Phase 8) and tests; the live editor does light validation
 * via input types.
 */
export function coerceFieldValue(
  raw: string,
  dataType: SpecFieldDataType,
  options: string[] | null = null,
): ValueCoercion {
  const trimmed = raw.trim()
  if (trimmed === '') return { ok: true, value: '' }

  switch (dataType) {
    case 'text':
      return { ok: true, value: trimmed }
    case 'number': {
      const n = Number(trimmed.replace(/,/g, ''))
      if (!Number.isFinite(n)) return { ok: false, reason: `not a number: "${trimmed}"` }
      return { ok: true, value: String(n) }
    }
    case 'boolean': {
      const lower = trimmed.toLowerCase()
      if (['yes', 'y', 'true', '1'].includes(lower)) return { ok: true, value: 'yes' }
      if (['no', 'n', 'false', '0'].includes(lower)) return { ok: true, value: 'no' }
      return { ok: false, reason: `not a yes/no value: "${trimmed}"` }
    }
    case 'select': {
      const opts = options ?? []
      if (opts.length === 0) return { ok: false, reason: 'select field has no options' }
      const match = opts.find((o) => o.toLowerCase() === trimmed.toLowerCase())
      if (!match) return { ok: false, reason: `"${trimmed}" not in options [${opts.join(', ')}]` }
      return { ok: true, value: match }
    }
  }
}

// ── Commercial offers that belong to a range, not to a product ─────────────

/**
 * Spec templates whose range we offer in 316 stainless on request.
 *
 * The size table prints that offer under every table, and it came from the
 * hydraulic fitting and adapter catalogue, where it is true of every size in
 * every family. It is not true everywhere: a hammer union is a forged
 * alloy-steel pressure part rated to 20,000 psi and there is no 316 version to
 * order, so the line has to be off on those pages rather than merely unlikely
 * to be believed.
 *
 * An allowlist rather than a denylist, so a template added later starts
 * silent and someone has to decide to make the claim.
 */
export const STAINLESS_ON_REQUEST_TEMPLATES: readonly string[] = [
  'threaded-fitting-spec',
  'hydraulic-adapter-spec',
  'crimp-ferrule-spec',
  'sae-flange-spec',
  'hose-fitting-spec',
]

/** Whether a product on this spec template may advertise the 316 stainless option. */
export function offersStainlessOnRequest(specTemplateSlug: string | null | undefined): boolean {
  return specTemplateSlug != null && STAINLESS_ON_REQUEST_TEMPLATES.includes(specTemplateSlug)
}
