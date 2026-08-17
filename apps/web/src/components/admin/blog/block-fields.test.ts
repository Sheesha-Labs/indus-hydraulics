import { describe, expect, test } from 'vitest'
import { BlogBlockSchema } from '@indus/domain'
import { BLOCK_FORMS, newRow, type Field, type ScalarField } from './block-fields'

/**
 * The forms and the schema are two descriptions of the same shapes, and
 * nothing else keeps them honest.
 *
 * A form missing a field the schema requires does not fail to compile, lint or
 * render — it fails when an author fills the whole thing in, presses Done, and
 * is told a field they cannot see is required. A declared default that
 * disagrees with the schema's is worse: the form shows one value, the row
 * stores another, and nobody finds out until the article renders.
 *
 * So: fill every form the way an author would, and require the result to
 * validate.
 */

/**
 * Values for the handful of fields whose schema constrains the FORMAT, not
 * just the length. Generic filler cannot satisfy a kebab-case or ISO-date
 * regex, and loosening those regexes to make a test pass would be the wrong
 * way round.
 */
const SAMPLES: Record<string, string> = {
  verifiedOn: '2026-08-17',
  slug: 'hydraulic-hose-fittings',
}

/** Type a plausible value into every field the form exposes. */
function fillScalar(field: ScalarField): unknown {
  switch (field.kind) {
    case 'select':
    case 'checkbox':
      return field.default
    default:
      // Long enough to clear a `min(1)`, short enough for the tightest max in
      // the set (`valueSmall`, 20 chars).
      return SAMPLES[field.key] ?? 'Filled in'
  }
}

function fillRow(fields: ScalarField[]): Record<string, unknown> {
  const row = newRow(fields)
  for (const field of fields) row[field.key] = fillScalar(field)
  return row
}

/**
 * What the form writes for one field. A partial rather than a single value
 * because the matrix owns two keys — the schema rejects a row whose cell count
 * differs from the column count, so they can only be filled together.
 */
function fillField(field: Field): Record<string, unknown> {
  switch (field.kind) {
    case 'text':
    case 'textarea':
    case 'select':
    case 'checkbox':
      return { [field.key]: fillScalar(field) }
    case 'strings':
      return { [field.key]: Array.from({ length: field.min }, (_, i) => `Point ${i + 1}`) }
    case 'rows':
      return { [field.key]: Array.from({ length: field.min }, () => fillRow(field.fields)) }
    case 'object':
      return { [field.key]: fillRow(field.fields) }
    case 'groups':
      return {
        [field.key]: Array.from({ length: field.min }, () => ({
          ...fillRow(field.fields),
          [field.nested.key]: Array.from({ length: field.nested.min }, () =>
            fillRow(field.nested.fields),
          ),
        })),
      }
    case 'matrix':
      return {
        columns: ['Property', 'Value'],
        rows: [{ cells: ['Thread form', '60° UN/UNF'] }],
      }
  }
}

/** The block an author would end up with, having filled the form in. */
function fillForm(spec: (typeof BLOCK_FORMS)[number]): Record<string, unknown> {
  let filled = spec.template() as unknown as Record<string, unknown>
  for (const field of spec.fields) filled = { ...filled, ...fillField(field) }
  return filled
}

describe.each(BLOCK_FORMS.map((spec) => [spec.label, spec] as const))('%s', (_label, spec) => {
  test('its template names the right block type', () => {
    expect((spec.template() as { type: string }).type).toBe(spec.type)
  })

  test('a filled-in form produces a block the schema accepts', () => {
    const parsed = BlogBlockSchema.safeParse(fillForm(spec))
    expect(
      parsed.success ? null : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    ).toBeNull()
  })

  test('every declared default survives the schema unchanged', () => {
    const parsed = BlogBlockSchema.parse(fillForm(spec)) as Record<string, unknown>

    // A default the form shows but the schema overwrites is a form that lies.
    for (const field of spec.fields) {
      if (field.kind === 'select' || field.kind === 'checkbox') {
        expect(parsed[field.key]).toEqual(field.default)
      }
      if (field.kind === 'rows' || field.kind === 'object' || field.kind === 'groups') {
        const target =
          field.kind === 'object'
            ? (parsed[field.key] as Record<string, unknown>)
            : ((parsed[field.key] as Array<Record<string, unknown>>)[0] ?? {})
        for (const sub of field.fields) {
          if (sub.kind === 'select' || sub.kind === 'checkbox') {
            expect(target[sub.key]).toEqual(sub.default)
          }
        }
        if (field.kind === 'groups') {
          const group = (parsed[field.key] as Array<Record<string, unknown>>)[0] ?? {}
          const nested = (group[field.nested.key] as Array<Record<string, unknown>>)[0] ?? {}
          for (const sub of field.nested.fields) {
            if (sub.kind === 'select' || sub.kind === 'checkbox') {
              expect(nested[sub.key]).toEqual(sub.default)
            }
          }
        }
      }
    }
  })
})

describe('coverage', () => {
  test('every block type in the union has a form', () => {
    // `BlogBlockSchema` is a discriminated union; its option list is the set of
    // block types an article can hold. Anything in it without a form is a block
    // the editor can display and not create.
    const inSchema = BlogBlockSchema.options
      .map((option) => {
        const shape = (option as { shape?: Record<string, { value?: string }> }).shape
        return shape?.type?.value
      })
      .filter((t): t is string => typeof t === 'string')
      // The four the body editor renders natively rather than as a card.
      .filter((t) => !['section_head', 'lead', 'paragraph', 'prose', 'figure'].includes(t))

    // Guard against the check passing because the extraction found nothing —
    // a discriminated union that reads as empty would report full coverage.
    expect(inSchema.length).toBeGreaterThan(10)

    const withForms = new Set(BLOCK_FORMS.map((f) => f.type))
    expect(inSchema.filter((t) => !withForms.has(t))).toEqual([])
  })
})
