/**
 * Reading and writing section documents.
 *
 * The registry in `./pages` is authoritative for *what exists*. The database
 * is authoritative for *order, visibility and copy*. These functions are the
 * seam between the two, and they are deliberately total: a partial document, a
 * document written before a section existed, or no document at all all resolve
 * to something renderable.
 */
import {
  isListField,
  isSelectField,
  isToggleField,
  isImageField,
  type FieldDef,
  type ImageValue,
  type ItemValue,
  type MasterPageDef,
  type ResolvedSection,
  type SectionDef,
  type SectionValues,
  type StoredSection,
} from './types'

// ── reading ──────────────────────────────────────────────────────────────

/**
 * Merge what's stored with what the code declares.
 *
 * Order and enabled-ness come from storage when present, so an editor's
 * arrangement survives new sections being added in code — they land at the
 * end. A stored section whose key no longer exists is dropped.
 *
 * Field values fall back to the registry default INDIVIDUALLY, so a section
 * that gained a new field still renders that field's shipped copy rather than
 * a hole.
 */
export function resolveSections(
  def: MasterPageDef,
  stored: StoredSection[] | null,
): ResolvedSection[] {
  const byKey = new Map((stored ?? []).map((s) => [s.key, s]))
  const ordered: SectionDef[] = []

  if (stored && stored.length > 0) {
    for (const s of stored) {
      const sectionDef = def.sections.find((d) => d.key === s.key)
      if (sectionDef) ordered.push(sectionDef)
    }
    for (const d of def.sections) {
      if (!byKey.has(d.key)) ordered.push(d)
    }
  } else {
    ordered.push(...def.sections)
  }

  return ordered.map((sectionDef) => {
    const s = byKey.get(sectionDef.key)
    return {
      key: sectionDef.key,
      def: sectionDef,
      // Locked sections can't be switched off, whatever storage claims.
      enabled: sectionDef.locked ? true : (s?.enabled ?? sectionDef.defaultEnabled ?? true),
      values: mergeValues(sectionDef, s?.values ?? null),
    }
  })
}

function mergeValues(def: SectionDef, stored: SectionValues | null): SectionValues {
  const out: SectionValues = {}
  for (const field of def.fields) {
    const value = stored?.[field.key]
    out[field.key] =
      value === undefined || value === null
        ? clone(def.defaults[field.key] ?? emptyFor(field))
        : clone(value)
  }
  return out
}

/**
 * Resolved values are always a COPY.
 *
 * `attachMedia` writes a resolved public URL onto every image value it finds.
 * Without this clone that write lands on the object literal inside the
 * registry's `defaults`, which is module state shared by every request in the
 * process — one page's resolved image URL would leak into every other page
 * that had never picked an image. It fails silently and only under load, which
 * is the worst combination, so the copy is unconditional.
 */
function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => clone(item)) as unknown as T
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = clone(v)
  return out as T
}

function emptyFor(field: FieldDef): SectionValues[string] {
  if (isListField(field)) return []
  if (isSelectField(field)) return null
  if (isToggleField(field)) return true
  if (isImageField(field)) return { mediaId: null, alt: null }
  return null
}

// ── readers the renderers use ────────────────────────────────────────────

/** A trimmed non-empty string, or null. */
export function str(values: SectionValues, key: string): string | null {
  const v = values[key]
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

/** A string with a guaranteed fallback — for copy a page cannot render without. */
export function strOr(values: SectionValues, key: string, fallback: string): string {
  return str(values, key) ?? fallback
}

export function bool(values: SectionValues, key: string, fallback = true): boolean {
  const v = values[key]
  return typeof v === 'boolean' ? v : fallback
}

export function img(values: SectionValues, key: string): ImageValue | null {
  const v = values[key]
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const image = v as ImageValue
  return image.mediaId ? image : null
}

/**
 * List values. An EMPTY list means "the section keeps whatever it renders by
 * default" — several sections draw their items from the database, and an
 * editor who has never touched them shouldn't blank them out.
 */
export function list<T = Record<string, ItemValue>>(values: SectionValues, key: string): T[] {
  const v = values[key]
  return Array.isArray(v) ? (v as T[]) : []
}

/**
 * List items with the per-item `enabled` toggle applied.
 *
 * Deliberately unconstrained in `T`: every card list carries `enabled`, but
 * declaring that in the constraint forces each call site to repeat it in the
 * shape it passes, which is noise for a key the renderer never reads.
 */
export function visibleList<T>(values: SectionValues, key: string): T[] {
  return list<T>(values, key).filter(
    (item) => (item as { enabled?: ItemValue } | null)?.enabled !== false,
  )
}

/**
 * A textarea edited as one item per line.
 *
 * A list field's sub-fields hold scalars, so a list inside a list item is not
 * expressible in the section model — and for six short deliverable names a
 * textarea is a better control than six rows of inputs anyway. Blank lines are
 * dropped and each line trimmed, so a trailing newline or a pasted indent
 * doesn't render as an empty pill.
 */
export function lines(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
}

// ── writing ──────────────────────────────────────────────────────────────

export type ValidationIssue = { section: string; field: string; message: string }

export type ValidateResult =
  | { ok: true; sections: StoredSection[] }
  | { ok: false; issues: ValidationIssue[] }

/**
 * Validate + normalise an incoming document against the registry.
 *
 * Returns the document to store (unknown sections and fields stripped, strings
 * trimmed, blanks normalised to null) or the list of problems. Generated from
 * the field definitions rather than hand-written per section, so the registry
 * stays the single source of truth.
 */
export function validateSections(
  def: MasterPageDef,
  incoming: StoredSection[],
): ValidateResult {
  const issues: ValidationIssue[] = []
  const seen = new Set<string>()
  const sections: StoredSection[] = []

  for (const raw of incoming) {
    const sectionDef = def.sections.find((d) => d.key === raw.key)
    if (!sectionDef || seen.has(raw.key)) continue
    seen.add(raw.key)

    const values: SectionValues = {}
    for (const field of sectionDef.fields) {
      const value = (raw.values ?? {})[field.key]
      if (isListField(field)) {
        const arr = Array.isArray(value) ? value : []
        if (arr.length > field.max) {
          issues.push({
            section: sectionDef.label,
            field: field.label,
            message: `Keep it to ${field.max} ${field.itemLabel}s or fewer.`,
          })
        }
        values[field.key] = arr.slice(0, field.max).map((item) => {
          const out: Record<string, ItemValue> = {}
          for (const sub of field.fields) {
            out[sub.key] = normaliseScalar(
              sub,
              (item as Record<string, unknown>)?.[sub.key],
              sectionDef.label,
              issues,
            )
          }
          return out
        })
      } else if (value !== undefined) {
        // A key the client didn't send means "unchanged" — reading merges the
        // default back in — so only a value that was actually submitted blank
        // counts as a blank required field.
        values[field.key] = normaliseScalar(field, value, sectionDef.label, issues)
      }
    }

    sections.push({
      key: sectionDef.key,
      enabled: sectionDef.locked ? true : raw.enabled !== false,
      values,
    })
  }

  // Anything the client didn't send keeps its position at the end, enabled — a
  // stale editor tab shouldn't silently drop a section added since it loaded.
  for (const d of def.sections) {
    if (!seen.has(d.key)) sections.push({ key: d.key, enabled: true, values: {} })
  }

  return issues.length > 0 ? { ok: false, issues } : { ok: true, sections }
}

function normaliseScalar(
  field: Exclude<FieldDef, { kind: 'list' }>,
  value: unknown,
  sectionLabel: string,
  issues: ValidationIssue[],
): ItemValue {
  if (isToggleField(field)) {
    // Anything but an explicit false reads as on, so a card added by an older
    // client (or by hand) defaults to visible rather than silently hidden.
    return value !== false
  }
  if (isSelectField(field)) {
    // The stored value is a record slug, deliberately not validated against
    // the live records: a record can be unpublished or renamed afterwards, and
    // the renderer already drops picks it cannot resolve.
    return trimOrNull(value)
  }
  if (isImageField(field)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { mediaId: null, alt: null }
    }
    const v = value as Record<string, unknown>
    return { mediaId: trimOrNull(v.mediaId), alt: trimOrNull(v.alt) }
  }

  const raw = trimOrNull(value)
  if (raw === null) {
    if (field.optional === false || (field.kind === 'text' && !field.optional)) {
      issues.push({ section: sectionLabel, field: field.label, message: "Can't be empty." })
    }
    return null
  }
  if (field.max && raw.length > field.max) {
    issues.push({
      section: sectionLabel,
      field: field.label,
      message: `Too long — max ${field.max} characters.`,
    })
  }
  return raw
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Coerce a jsonb payload into stored sections. Never throws. */
export function parseStoredSections(raw: unknown): StoredSection[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const out: StoredSection[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    if (typeof r.key !== 'string') continue
    out.push({
      key: r.key,
      enabled: r.enabled !== false,
      values:
        r.values && typeof r.values === 'object' && !Array.isArray(r.values)
          ? (r.values as SectionValues)
          : {},
    })
  }
  return out.length > 0 ? out : null
}

/**
 * Defaults as a storable document — what "reset page" writes.
 *
 * `enabled` follows the section's own default rather than being forced on, so
 * a reset returns the page to how it ships rather than switching every
 * off-by-default section on.
 */
export function defaultDocument(def: MasterPageDef): StoredSection[] {
  return def.sections.map((s) => ({
    key: s.key,
    enabled: s.locked ? true : (s.defaultEnabled ?? true),
    values: { ...s.defaults },
  }))
}

/** Every `mediaId` referenced anywhere in a document — scalar or inside a list. */
export function collectMediaIds(sections: ResolvedSection[]): string[] {
  const ids = new Set<string>()
  const walk = (value: unknown): void => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    const v = value as Record<string, unknown>
    if ('mediaId' in v) {
      if (typeof v.mediaId === 'string' && v.mediaId) ids.add(v.mediaId)
      return
    }
    Object.values(v).forEach(walk)
  }
  for (const section of sections) Object.values(section.values).forEach(walk)
  return [...ids]
}

/**
 * Fill in `url`/`width`/`height` on every image value from a resolved lookup.
 * Mutates in place — the caller owns freshly-resolved sections, never the
 * registry defaults, because `resolveSections` copies list values but shares
 * scalar image objects with `defaults`.
 */
export function attachMedia(
  sections: ResolvedSection[],
  lookup: (id: string) => { url: string; width: number | null; height: number | null } | null,
): void {
  const walk = (value: unknown): void => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    const v = value as Record<string, unknown>
    if ('mediaId' in v) {
      const image = v as ImageValue
      const asset = image.mediaId ? lookup(image.mediaId) : null
      // A trashed or deleted asset falls back to the built-in art rather than
      // rendering a broken image.
      image.url = asset?.url ?? null
      image.width = asset?.width ?? null
      image.height = asset?.height ?? null
      return
    }
    Object.values(v).forEach(walk)
  }
  for (const section of sections) Object.values(section.values).forEach(walk)
}
