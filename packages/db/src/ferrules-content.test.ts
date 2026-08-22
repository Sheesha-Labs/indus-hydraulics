import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guards on the frozen ferrule payload.
 *
 * The whole value of this dataset is that 71 part references were transcribed
 * by hand off seven dimension sheets. A transposed digit, a duplicated part
 * reference or a bore that does not line up with its dash size reads as
 * plausible catalogue data forever — nobody re-derives it, and the storefront
 * will render whatever is here. These are the checks the sheets themselves
 * make possible.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(
  readFileSync(path.join(HERE, '../data/ferrules-content.json'), 'utf8'),
) as {
  hub: { slug: string; seoTitle: string }
  series: {
    categorySlug: string
    categoryName: string
    navLabel: string
    sku: string
    slug: string
    title: string
    seoTitle: string
    categorySeoTitle: string
    ferruleType: string
    partPrefixes: string
    sizes: { part: string; dn: number; dash: string; inch: string; d: string; l: string }[]
  }[]
}

/** The dash size is the bore in sixteenths of an inch — that is what defines it. */
const DN_FOR_DASH: Record<string, number> = {
  '-3': 5,
  '-4': 6,
  '-5': 8,
  '-6': 10,
  '-8': 12,
  '-10': 16,
  '-12': 19,
  '-16': 25,
  '-20': 31,
  '-24': 38,
  '-32': 51,
  '-38': 60,
  '-40': 63,
  '-48': 76,
  '-56': 89,
  '-64': 102,
}

describe('ferrules payload', () => {
  test('carries seven series and 71 part references', () => {
    expect(payload.series).toHaveLength(7)
    expect(payload.series.reduce((n, s) => n + s.sizes.length, 0)).toBe(71)
  })

  test('category slugs, product slugs and SKUs are all unique', () => {
    for (const key of ['categorySlug', 'slug', 'sku'] as const) {
      const values = payload.series.map((s) => s[key])
      expect(new Set(values).size, `${key} has a duplicate`).toBe(values.length)
    }
    // The hub must not collide with a series, nor with the pre-existing
    // grade-organised `crimp-ferrules` category it sits alongside.
    expect(payload.series.map((s) => s.categorySlug)).not.toContain(payload.hub.slug)
    expect(payload.hub.slug).not.toBe('crimp-ferrules')
  })

  test('every part reference is unique within its series', () => {
    for (const s of payload.series) {
      const parts = s.sizes.map((x) => x.part)
      expect(new Set(parts).size, `${s.categorySlug} repeats a part reference`).toBe(parts.length)
    }
  })

  test('every part reference starts with one of the series prefixes', () => {
    for (const s of payload.series) {
      const prefixes = s.partPrefixes.split(',').map((p) => p.trim())
      for (const row of s.sizes) {
        expect(
          prefixes.some((p) => row.part.startsWith(p)),
          `${row.part} is not covered by "${s.partPrefixes}"`,
        ).toBe(true)
      }
    }
  })

  test('the dash suffix on a part reference matches its own dash column', () => {
    for (const s of payload.series) {
      for (const row of s.sizes) {
        // "M00120-03" carries "-3": the reference zero-pads, the column does not.
        const suffix = row.part.slice(row.part.lastIndexOf('-') + 1)
        expect(`-${Number(suffix)}`, `${row.part} vs dash ${row.dash}`).toBe(row.dash)
      }
    }
  })

  test('DN and dash size agree on every row', () => {
    for (const s of payload.series) {
      for (const row of s.sizes) {
        expect(DN_FOR_DASH[row.dash], `unknown dash ${row.dash} on ${row.part}`).toBeDefined()
        expect(row.dn, `${row.part}: DN${row.dn} does not match ${row.dash}`).toBe(
          DN_FOR_DASH[row.dash],
        )
      }
    }
  })

  test('rows run small bore to large, and dimensions are positive numbers', () => {
    for (const s of payload.series) {
      let previous = 0
      for (const row of s.sizes) {
        expect(row.dn, `${s.categorySlug} is not ordered by bore`).toBeGreaterThanOrEqual(previous)
        previous = row.dn
        for (const [key, value] of [['D', row.d], ['L', row.l]] as const) {
          expect(value, `${row.part} ${key} is not a decimal`).toMatch(/^\d+(\.\d+)?$/)
          expect(Number(value), `${row.part} ${key} is not positive`).toBeGreaterThan(0)
        }
      }
    }
  })

  test('outside diameter grows with bore inside a series', () => {
    for (const s of payload.series) {
      // Two references can share a bore (M03400-08 / M03450-08), so this is
      // monotonic across distinct bores, not strictly increasing row to row.
      const byBore = new Map<number, number[]>()
      for (const row of s.sizes) {
        byBore.set(row.dn, [...(byBore.get(row.dn) ?? []), Number(row.d)])
      }
      const bores = [...byBore.keys()].sort((a, b) => a - b)
      for (let i = 1; i < bores.length; i++) {
        const smaller = Math.max(...byBore.get(bores[i - 1]!)!)
        const larger = Math.max(...byBore.get(bores[i]!)!)
        expect(larger, `${s.categorySlug}: D shrinks from DN${bores[i - 1]} to DN${bores[i]}`)
          .toBeGreaterThan(smaller)
      }
    }
  })

  test('ferrule type is one of the values the spec template offers', () => {
    for (const s of payload.series) {
      expect(['skive', 'no-skive']).toContain(s.ferruleType)
    }
  })

  test('no seoTitle carries the site name', () => {
    // The storefront layout applies `%s | Indus Hydraulics`; a title that
    // already contains it double-suffixes in the SERP.
    const titles = [
      payload.hub.seoTitle,
      ...payload.series.flatMap((s) => [s.seoTitle, s.categorySeoTitle]),
    ]
    for (const t of titles) {
      expect(t.toLowerCase(), `"${t}" already carries the site name`).not.toContain(
        'indus hydraulics',
      )
    }
  })

  test('every series has a megamenu entry in the seed tree', () => {
    // A category with no nav entry is reachable only by URL. The seed only
    // builds the menu on an empty one, so this file is the record of the IA.
    const tree = readFileSync(path.join(HERE, 'megamenu-tree.ts'), 'utf8')
    expect(tree).toContain(`category: '${payload.hub.slug}'`)
    for (const s of payload.series) {
      expect(tree, `${s.categorySlug} missing from megamenu-tree.ts`).toContain(
        `category: '${s.categorySlug}'`,
      )
      expect(tree, `${s.navLabel} missing from megamenu-tree.ts`).toContain(`'${s.navLabel}'`)
    }
  })

  test('the megamenu column stays under the height the panel can draw', () => {
    // ~13 entries is what fits above the fold at a 720px viewport and the
    // panel has no scroller: anything past that is silently unreachable.
    expect(payload.series.length).toBeLessThanOrEqual(13)
  })
})
