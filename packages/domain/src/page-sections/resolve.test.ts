import { describe, expect, test } from 'vitest'
import {
  attachMedia,
  collectMediaIds,
  defaultDocument,
  interpolate,
  list,
  parseStoredSections,
  resolveSections,
  str,
  validateSections,
  visibleList,
  MASTER_PAGES,
  SUBPAGE_KINDS,
  getMasterPage,
  isSubPageKind,
  masterContentKey,
  subPageContentKey,
  subPageDef,
} from '../index'
import type { MasterPageDef, StoredSection } from '../index'

const DEF: MasterPageDef = {
  key: 'demo',
  label: 'Demo',
  path: '/demo',
  description: 'A page.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Top.',
      locked: true,
      fields: [
        { key: 'heading', label: 'Heading', kind: 'text', max: 20 },
        { key: 'image', label: 'Image', kind: 'image' },
      ],
      defaults: { heading: 'Shipped copy', image: { mediaId: null, alt: null } },
    },
    {
      key: 'band',
      label: 'Band',
      description: 'Middle.',
      fields: [
        {
          key: 'items',
          label: 'Items',
          kind: 'list',
          itemLabel: 'item',
          max: 2,
          fields: [
            { key: 'enabled', label: 'Show', kind: 'toggle' },
            { key: 'name', label: 'Name', kind: 'text', max: 40 },
          ],
        },
      ],
      defaults: { items: [{ enabled: true, name: 'One' }] },
    },
    {
      key: 'off',
      label: 'Off by default',
      description: 'Ships hidden.',
      defaultEnabled: false,
      fields: [{ key: 'heading', label: 'Heading', kind: 'text', max: 40, optional: true }],
      defaults: { heading: 'Hidden but editable' },
    },
  ],
}

describe('resolveSections', () => {
  test('with nothing stored, returns the registry in code order with defaults', () => {
    const resolved = resolveSections(DEF, null)
    expect(resolved.map((s) => s.key)).toEqual(['hero', 'band', 'off'])
    expect(str(resolved[0]!.values, 'heading')).toBe('Shipped copy')
  })

  test('a section that ships disabled stays disabled until switched on', () => {
    const resolved = resolveSections(DEF, null)
    expect(resolved.find((s) => s.key === 'off')!.enabled).toBe(false)
  })

  test('stored order wins, and a section added in code lands at the end', () => {
    const stored: StoredSection[] = [
      { key: 'band', enabled: true, values: {} },
      { key: 'hero', enabled: false, values: {} },
    ]
    const resolved = resolveSections(DEF, stored)
    expect(resolved.map((s) => s.key)).toEqual(['band', 'hero', 'off'])
  })

  test('a locked section cannot be switched off by the document', () => {
    const resolved = resolveSections(DEF, [{ key: 'hero', enabled: false, values: {} }])
    expect(resolved.find((s) => s.key === 'hero')!.enabled).toBe(true)
  })

  test('a stored key that no longer exists in code is dropped', () => {
    const resolved = resolveSections(DEF, [
      { key: 'retired', enabled: true, values: {} },
      { key: 'hero', enabled: true, values: {} },
    ])
    expect(resolved.map((s) => s.key)).toEqual(['hero', 'band', 'off'])
  })

  test('a field missing from the stored document falls back to its own default', () => {
    const resolved = resolveSections(DEF, [{ key: 'hero', enabled: true, values: {} }])
    expect(str(resolved[0]!.values, 'heading')).toBe('Shipped copy')
  })

  test('resolved values are a copy — mutating them cannot poison the registry', () => {
    const first = resolveSections(DEF, null)
    const image = first[0]!.values.image as { url?: string | null }
    image.url = 'https://cdn.example/one.jpg'
    const second = resolveSections(DEF, null)
    expect((second[0]!.values.image as { url?: string | null }).url).toBeUndefined()
  })
})

describe('validateSections', () => {
  test('trims, drops unknown fields, and keeps unknown sections out', () => {
    const result = validateSections(DEF, [
      { key: 'hero', enabled: true, values: { heading: '  Hello  ', bogus: 'x' } },
      { key: 'ghost', enabled: true, values: {} },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const hero = result.sections.find((s) => s.key === 'hero')!
    expect(hero.values.heading).toBe('Hello')
    expect(hero.values).not.toHaveProperty('bogus')
    expect(result.sections.some((s) => s.key === 'ghost')).toBe(false)
  })

  test('a required text field submitted blank is an issue', () => {
    const result = validateSections(DEF, [
      { key: 'hero', enabled: true, values: { heading: '   ' } },
    ])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues[0]!.field).toBe('Heading')
  })

  test('over-length copy is an issue naming the limit', () => {
    const result = validateSections(DEF, [
      { key: 'hero', enabled: true, values: { heading: 'x'.repeat(40) } },
    ])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues[0]!.message).toContain('20')
  })

  test('a list longer than its max is an issue', () => {
    const result = validateSections(DEF, [
      {
        key: 'band',
        enabled: true,
        values: { items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
      },
    ])
    expect(result.ok).toBe(false)
  })

  test('sections the client never sent survive at the end, enabled', () => {
    const result = validateSections(DEF, [{ key: 'hero', enabled: true, values: {} }])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.sections.map((s) => s.key)).toEqual(['hero', 'band', 'off'])
  })

  test('a locked section is stored enabled whatever the client claims', () => {
    const result = validateSections(DEF, [{ key: 'hero', enabled: false, values: {} }])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.sections.find((s) => s.key === 'hero')!.enabled).toBe(true)
  })
})

describe('parseStoredSections', () => {
  test('null for anything that is not a non-empty array', () => {
    expect(parseStoredSections(null)).toBeNull()
    expect(parseStoredSections([])).toBeNull()
    expect(parseStoredSections({ key: 'hero' })).toBeNull()
  })

  test('skips malformed entries rather than throwing', () => {
    expect(parseStoredSections([null, 3, { nope: true }, { key: 'hero' }])).toEqual([
      { key: 'hero', enabled: true, values: {} },
    ])
  })
})

describe('defaultDocument', () => {
  test('reset restores shipped visibility, not blanket on', () => {
    const doc = defaultDocument(DEF)
    expect(doc.find((s) => s.key === 'off')!.enabled).toBe(false)
    expect(doc.find((s) => s.key === 'hero')!.enabled).toBe(true)
  })
})

describe('media', () => {
  test('collects ids from image fields, then attaches urls', () => {
    const resolved = resolveSections(DEF, [
      { key: 'hero', enabled: true, values: { image: { mediaId: 'abc', alt: 'Alt' } } },
    ])
    expect(collectMediaIds(resolved)).toEqual(['abc'])
    attachMedia(resolved, (id) =>
      id === 'abc' ? { url: 'https://cdn/x.jpg', width: 10, height: 20 } : null,
    )
    expect((resolved[0]!.values.image as { url?: string | null }).url).toBe('https://cdn/x.jpg')
  })

  test('a deleted asset resolves to null rather than a broken image', () => {
    const resolved = resolveSections(DEF, [
      { key: 'hero', enabled: true, values: { image: { mediaId: 'gone', alt: null } } },
    ])
    attachMedia(resolved, () => null)
    expect((resolved[0]!.values.image as { url?: string | null }).url).toBeNull()
  })
})

describe('list readers', () => {
  test('visibleList drops items switched off', () => {
    const values = { items: [{ enabled: true, name: 'a' }, { enabled: false, name: 'b' }] }
    expect(visibleList(values, 'items')).toHaveLength(1)
    expect(list(values, 'items')).toHaveLength(2)
  })
})

describe('interpolate', () => {
  test('substitutes known tokens and formats numbers', () => {
    expect(interpolate('{skus}+ SKUs from {brands} brands', { skus: 1234, brands: 27 })).toBe(
      '1,234+ SKUs from 27 brands',
    )
  })

  test('leaves an unknown token verbatim', () => {
    expect(interpolate('see {note}', { skus: 1 })).toBe('see {note}')
  })

  test('null in, null out', () => {
    expect(interpolate(null, {})).toBeNull()
  })
})

describe('registry', () => {
  test('every master page has a unique key and a leading slash path', () => {
    const keys = MASTER_PAGES.map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const page of MASTER_PAGES) expect(page.path.startsWith('/')).toBe(true)
  })

  test('every section key is unique within its page', () => {
    for (const page of MASTER_PAGES) {
      const keys = page.sections.map((s) => s.key)
      expect(new Set(keys).size, `${page.key} has duplicate section keys`).toBe(keys.length)
    }
  })

  test('every field key is unique within its section, and every field has a default', () => {
    for (const page of MASTER_PAGES) {
      for (const section of page.sections) {
        const keys = section.fields.map((f) => f.key)
        expect(new Set(keys).size, `${page.key}/${section.key} duplicate field key`).toBe(
          keys.length,
        )
        for (const field of section.fields) {
          expect(
            Object.prototype.hasOwnProperty.call(section.defaults, field.key),
            `${page.key}/${section.key}/${field.key} has no default`,
          ).toBe(true)
        }
      }
    }
  })

  test('the shipped defaults validate against their own definitions', () => {
    for (const page of MASTER_PAGES) {
      const result = validateSections(page, defaultDocument(page))
      expect(result.ok, `${page.key}: ${result.ok ? '' : JSON.stringify(result.issues)}`).toBe(true)
    }
  })

  test('lookup helpers agree with the registry', () => {
    expect(getMasterPage('home')?.key).toBe('home')
    expect(getMasterPage('nope')).toBeNull()
    expect(masterContentKey('home')).toBe('master/home')
  })
})

describe('sub-pages', () => {
  test('a kind is only listed once its template exists', () => {
    for (const kind of SUBPAGE_KINDS) {
      expect(isSubPageKind(kind.kind)).toBe(true)
      expect(() => subPageDef(kind.kind, { name: 'X', slug: 'x' })).not.toThrow()
    }
  })

  test('the content key namespaces a sub-page away from the master pages', () => {
    expect(subPageContentKey('market', 'nigeria')).toBe('market/nigeria')
    expect(subPageContentKey('market', 'nigeria')).not.toBe(masterContentKey('nigeria'))
  })

  test('every copy field on the market template is an OVERRIDE, defaulting to blank', () => {
    // This is the whole contract: a market nobody has edited must render what
    // the template builds from its record, not a shared block of boilerplate
    // repeated on a hundred pages.
    const def = subPageDef('market', { name: 'Nigeria', slug: 'nigeria' })
    for (const section of def.sections) {
      for (const field of section.fields) {
        expect(
          section.defaults[field.key] ?? null,
          `${section.key}/${field.key} ships a value instead of an override`,
        ).toBeNull()
      }
    }
  })

  test('no required field, so an untouched market always validates', () => {
    const def = subPageDef('market', { name: 'Nigeria', slug: 'nigeria' })
    const result = validateSections(
      def,
      def.sections.map((s) => ({ key: s.key, enabled: true, values: {} })),
    )
    expect(result.ok).toBe(true)
  })

  test('the hero is locked and the lead forms are not', () => {
    const def = subPageDef('market', { name: 'Nigeria', slug: 'nigeria' })
    expect(def.sections.find((s) => s.key === 'hero')?.locked).toBe(true)
    expect(def.sections.find((s) => s.key === 'quote_form')?.locked).toBeUndefined()
  })

  test('reordering a market survives a round trip through storage', () => {
    const def = subPageDef('market', { name: 'Nigeria', slug: 'nigeria' })
    const moved = [
      { key: 'faq', enabled: true, values: {} },
      { key: 'hero', enabled: true, values: {} },
    ]
    const resolved = resolveSections(def, moved)
    expect(resolved.slice(0, 2).map((s) => s.key)).toEqual(['faq', 'hero'])
    // Everything the client didn't send keeps its place at the end.
    expect(resolved).toHaveLength(def.sections.length)
  })
})

describe('brand sub-pages', () => {
  test('the brand template is reachable and its copy fields are overrides too', () => {
    const def = subPageDef('brand', { name: 'Eaton', slug: 'eaton' })
    expect(def.path).toBe('/brands/eaton')
    for (const section of def.sections) {
      for (const field of section.fields) {
        expect(
          section.defaults[field.key] ?? null,
          `${section.key}/${field.key} ships a value instead of an override`,
        ).toBeNull()
      }
    }
  })

  test('the two kinds do not share a content key', () => {
    expect(subPageContentKey('brand', 'eaton')).toBe('brand/eaton')
    expect(subPageContentKey('brand', 'eaton')).not.toBe(subPageContentKey('market', 'eaton'))
  })

  test('every kind in the registry has a template', () => {
    for (const kind of SUBPAGE_KINDS) {
      const def = subPageDef(kind.kind, { name: 'X', slug: 'x' })
      expect(def.sections.length, `${kind.kind} has no bands`).toBeGreaterThan(0)
      expect(def.path.startsWith(kind.publicPath)).toBe(true)
    }
  })
})
