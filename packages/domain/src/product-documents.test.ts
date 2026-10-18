import { describe, expect, it } from 'vitest'
import { documentKindBadge, documentKindLabel, primaryDatasheet } from './product-documents'

describe('documentKindLabel', () => {
  it('names every DocumentKind', () => {
    expect(documentKindLabel('datasheet')).toBe('Datasheet')
    expect(documentKindLabel('service_manual')).toBe('Service manual')
    expect(documentKindLabel('installation_guide')).toBe('Installation guide')
    expect(documentKindLabel('step')).toBe('STEP model')
    expect(documentKindLabel('iges')).toBe('IGES model')
  })

  it('never prints a raw enum with underscores', () => {
    expect(documentKindLabel('some_new_kind')).toBe('some new kind')
  })
})

describe('documentKindBadge', () => {
  it('keeps DATA for datasheets and distinguishes manuals', () => {
    expect(documentKindBadge('datasheet')).toBe('DATA')
    expect(documentKindBadge('service_manual')).toBe('MAN')
  })
})

describe('primaryDatasheet', () => {
  it('skips service manuals listed before the datasheet', () => {
    const docs = [
      { id: 'a', kind: 'service_manual' },
      { id: 'b', kind: 'datasheet' },
    ]
    expect(primaryDatasheet(docs)?.id).toBe('b')
  })

  it('returns null when there is no datasheet, rather than offering a manual', () => {
    expect(primaryDatasheet([{ id: 'a', kind: 'service_manual' }])).toBeNull()
    expect(primaryDatasheet([])).toBeNull()
  })
})
