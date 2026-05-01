import { describe, it, expect } from 'vitest'
import {
  planTemplateSwitch,
  validateRequiredFields,
  deriveFieldKey,
  coerceFieldValue,
} from './spec-templates'

// ── planTemplateSwitch ─────────────────────────────────────────────────────

describe('planTemplateSwitch', () => {
  it('relinks specs whose old key exists in the new template', () => {
    const oldSpecs = [
      { id: 's1', oldKey: 'pressure' },
      { id: 's2', oldKey: 'bore' },
    ]
    const newFields = [
      { id: 'f1', key: 'pressure' },
      { id: 'f2', key: 'speed' },
    ]
    const plan = planTemplateSwitch(oldSpecs, newFields)
    expect(plan.relink).toEqual([{ specId: 's1', newFieldId: 'f1' }])
    expect(plan.orphan).toEqual(['s2'])
  })

  it('preserves a spec when only the field LABEL changed (key still matches)', () => {
    // The whole point of matching on key — admin can rename labels freely.
    const oldSpecs = [{ id: 's1', oldKey: 'op_pressure' }]
    const newFields = [{ id: 'f1', key: 'op_pressure' }]
    const plan = planTemplateSwitch(oldSpecs, newFields)
    expect(plan.relink).toHaveLength(1)
    expect(plan.orphan).toHaveLength(0)
  })

  it('orphans every spec when switching to a template with no matching keys', () => {
    const oldSpecs = [
      { id: 's1', oldKey: 'a' },
      { id: 's2', oldKey: 'b' },
    ]
    const newFields = [
      { id: 'f1', key: 'x' },
      { id: 'f2', key: 'y' },
    ]
    const plan = planTemplateSwitch(oldSpecs, newFields)
    expect(plan.relink).toHaveLength(0)
    expect(plan.orphan).toHaveLength(2)
  })

  it('orphans every spec when switching the template to none (empty newFields)', () => {
    const plan = planTemplateSwitch([{ id: 's1', oldKey: 'a' }], [])
    expect(plan.relink).toHaveLength(0)
    expect(plan.orphan).toEqual(['s1'])
  })

  it('returns an empty plan when there are no old specs', () => {
    const plan = planTemplateSwitch([], [{ id: 'f1', key: 'a' }])
    expect(plan.relink).toEqual([])
    expect(plan.orphan).toEqual([])
  })

  it('does not create duplicate relinks when an old spec key matches multiple new fields with the same key', () => {
    // Defensive — UNIQUE(templateId, key) prevents this in DB, but assert
    // the function doesn't blow up if seeded with malformed data.
    const oldSpecs = [{ id: 's1', oldKey: 'p' }]
    const newFields = [
      { id: 'f1', key: 'p' },
      { id: 'f2', key: 'p' },
    ]
    const plan = planTemplateSwitch(oldSpecs, newFields)
    expect(plan.relink).toHaveLength(1)
    // Last write wins per Map semantics — so the spec re-links to f2.
    expect(plan.relink[0]?.newFieldId).toBe('f2')
  })

  it('keeps a stable assignment per spec — no duplicates across multiple matches', () => {
    const oldSpecs = [
      { id: 's1', oldKey: 'pressure' },
      { id: 's2', oldKey: 'pressure' }, // both old specs claim the same key (shouldn't normally happen)
    ]
    const newFields = [{ id: 'f1', key: 'pressure' }]
    const plan = planTemplateSwitch(oldSpecs, newFields)
    // Each old spec gets its own relink entry — caller is responsible for
    // resolving the conflict (e.g. by deduping before storage).
    expect(plan.relink).toHaveLength(2)
    expect(plan.orphan).toHaveLength(0)
  })
})

// ── validateRequiredFields ─────────────────────────────────────────────────

describe('validateRequiredFields', () => {
  it('passes when every required field has a non-empty value', () => {
    const result = validateRequiredFields(
      [
        { fieldId: 'f1', value: '350' },
        { fieldId: 'f2', value: 'bar' },
      ],
      [
        { id: 'f1', label: 'Pressure', isRequired: true },
        { id: 'f2', label: 'Unit', isRequired: false },
      ],
    )
    expect(result.ok).toBe(true)
  })

  it('reports the labels of missing required fields', () => {
    const result = validateRequiredFields(
      [
        { fieldId: 'f1', value: '' },
        { fieldId: 'f2', value: '   ' }, // whitespace-only counts as empty
        { fieldId: 'f3', value: '12' },
      ],
      [
        { id: 'f1', label: 'Pressure', isRequired: true },
        { id: 'f2', label: 'Bore diameter', isRequired: true },
        { id: 'f3', label: 'Optional thing', isRequired: false },
      ],
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.missingLabels).toEqual(['Pressure', 'Bore diameter'])
    }
  })

  it('ignores updates whose fieldId is unknown (defensive)', () => {
    const result = validateRequiredFields(
      [{ fieldId: 'unknown', value: '' }],
      [{ id: 'f1', label: 'X', isRequired: true }],
    )
    expect(result.ok).toBe(true)
  })

  it('does NOT flag a non-required field that is empty', () => {
    const result = validateRequiredFields(
      [{ fieldId: 'f1', value: '' }],
      [{ id: 'f1', label: 'X', isRequired: false }],
    )
    expect(result.ok).toBe(true)
  })
})

// ── deriveFieldKey ─────────────────────────────────────────────────────────

describe('deriveFieldKey', () => {
  it('lowercases and underscores spaces', () => {
    expect(deriveFieldKey('Operating Pressure')).toBe('operating_pressure')
  })

  it('collapses multiple non-alphanumeric runs into a single underscore', () => {
    expect(deriveFieldKey('Bore diameter (mm)')).toBe('bore_diameter_mm')
  })

  it('trims leading and trailing underscores', () => {
    expect(deriveFieldKey('  Pressure!')).toBe('pressure')
  })

  it('caps at 80 characters', () => {
    const key = deriveFieldKey('a'.repeat(200))
    expect(key.length).toBe(80)
  })

  it('falls back to a timestamped key when input is empty / all-symbol', () => {
    const key = deriveFieldKey('!!!')
    expect(key).toMatch(/^field_\d+$/)
  })

  it('produces the same output for the same input (deterministic for non-empty)', () => {
    expect(deriveFieldKey('Working Pressure')).toBe(deriveFieldKey('Working Pressure'))
  })
})

// ── coerceFieldValue ───────────────────────────────────────────────────────

describe('coerceFieldValue', () => {
  it('passes empty strings through (caller handles required separately)', () => {
    expect(coerceFieldValue('', 'text')).toEqual({ ok: true, value: '' })
    expect(coerceFieldValue('', 'number')).toEqual({ ok: true, value: '' })
    expect(coerceFieldValue('', 'boolean')).toEqual({ ok: true, value: '' })
  })

  it('trims and accepts text values verbatim', () => {
    expect(coerceFieldValue('  hello world  ', 'text')).toEqual({ ok: true, value: 'hello world' })
  })

  it('parses numeric strings, including ones with thousands commas', () => {
    expect(coerceFieldValue('350', 'number')).toEqual({ ok: true, value: '350' })
    expect(coerceFieldValue('1,500', 'number')).toEqual({ ok: true, value: '1500' })
    expect(coerceFieldValue('26.5', 'number')).toEqual({ ok: true, value: '26.5' })
  })

  it('rejects non-numeric strings for number fields', () => {
    const result = coerceFieldValue('not-a-number', 'number')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toContain('not a number')
  })

  it('canonicalises boolean variants to "yes" / "no"', () => {
    for (const truthy of ['yes', 'YES', 'Y', 'true', 'True', '1']) {
      expect(coerceFieldValue(truthy, 'boolean')).toEqual({ ok: true, value: 'yes' })
    }
    for (const falsy of ['no', 'N', 'False', '0']) {
      expect(coerceFieldValue(falsy, 'boolean')).toEqual({ ok: true, value: 'no' })
    }
  })

  it('rejects ambiguous boolean inputs', () => {
    const result = coerceFieldValue('maybe', 'boolean')
    expect(result.ok).toBe(false)
  })

  it('case-insensitive matches select options + returns the canonical option string', () => {
    const result = coerceFieldValue('SPIRAL', 'select', ['1-wire', '2-wire', 'spiral'])
    expect(result).toEqual({ ok: true, value: 'spiral' })
  })

  it('rejects select values outside the options list', () => {
    const result = coerceFieldValue('5-wire', 'select', ['1-wire', '2-wire'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toContain('not in options')
  })

  it('rejects select fields with no options configured', () => {
    const result = coerceFieldValue('anything', 'select', [])
    expect(result.ok).toBe(false)
  })
})
