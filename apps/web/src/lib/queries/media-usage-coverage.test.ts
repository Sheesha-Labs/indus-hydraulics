import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guards that every place the schema can hold a media reference is actually
 * looked at by the usage index.
 *
 * This is the failure mode the media library is most exposed to, and it is
 * completely silent. Usage decides whether the delete button is enabled. A
 * model or column that the index does not read contributes no usages, so a
 * file held only by that column reads as "Unused" — and offering a live image
 * for deletion is exactly the outcome the feature exists to prevent.
 *
 * It has already happened once here: the page this replaces counts 2 of the 22
 * media relations, so an image on a homepage slide or a brand logo currently
 * displays "used 0×". Nothing failed, nothing warned; the number was just
 * wrong.
 *
 * Nine of the columns are `String?` fields with no declared Prisma relation
 * (`ogImageMediaId` and friends), so they are invisible to `include`, to
 * `_count`, and to any reasoning that starts from the relation graph. Those are
 * the ones most likely to be added again without a matching source.
 *
 * The check is deliberately coarse — it asserts a model and column are
 * *mentioned* in the query module, not that they are queried correctly. It
 * cannot prove correctness; it can only make a brand-new reference impossible
 * to add silently. Correctness is the reviewer's job, and the harness run
 * recorded in the PR.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../../../../..')
const SCHEMA = path.join(ROOT, 'packages/db/prisma/schema.prisma')
const QUERY_MODULE = path.join(HERE, 'media-usage.ts')

/**
 * Models whose media columns are intentionally not resolved, with the reason.
 * Adding to this list is a decision; leaving a model out of it is a bug.
 */
const EXEMPT: Record<string, string> = {}

/** `ProductImage` -> `productImage`, matching the Prisma client accessor. */
function accessor(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

interface MediaField {
  model: string
  /** The scalar column holding the id — what a query actually filters on. */
  column: string
}

/**
 * Every column in the schema that can hold a media id.
 *
 * Two shapes count: a declared relation to `Media` (read the scalar out of its
 * `fields: [...]`), and a bare `String?` whose name marks it as a media id.
 */
function mediaFieldsFromSchema(): MediaField[] {
  const src = readFileSync(SCHEMA, 'utf8')
  const out: MediaField[] = []
  let model: string | null = null

  for (const raw of src.split('\n')) {
    const line = raw.trim()
    const start = /^model (\w+) \{/.exec(line)
    if (start) {
      model = start[1] as string
      continue
    }
    if (line === '}') {
      model = null
      continue
    }
    if (!model || line.startsWith('//')) continue

    // Declared relation: `hero Media? @relation(fields: [heroId], ...)`
    if (/\bMedia\??\s+@relation\(/.test(line)) {
      const fk = /fields:\s*\[(\w+)\]/.exec(line)
      if (fk) out.push({ model, column: fk[1] as string })
      continue
    }

    // Soft FK: a String column named like a media id, with no relation.
    const scalar = /^(\w*(?:MediaId|ImageId))\s+String\??/.exec(line)
    if (scalar) {
      const column = scalar[1] as string
      // Skip the scalar half of a relation already captured above.
      if (!out.some((f) => f.model === model && f.column === column)) {
        out.push({ model, column })
      }
    }
  }
  return out
}

describe('media usage coverage', () => {
  const fields = mediaFieldsFromSchema()
  const source = readFileSync(QUERY_MODULE, 'utf8')

  test('the schema scan finds the references we already know about', () => {
    // A regex that silently matched nothing would make every assertion below
    // vacuously pass, so pin the shape of the scan itself.
    expect(fields.length).toBeGreaterThanOrEqual(28)

    const pair = (m: string, c: string) => fields.some((f) => f.model === m && f.column === c)
    expect(pair('ProductImage', 'mediaId'), 'declared relation').toBe(true)
    expect(pair('Product', 'ogImageMediaId'), 'soft FK with no relation').toBe(true)
    expect(pair('SeoSetting', 'ogDefaultImageId'), 'the odd one out').toBe(true)
    expect(pair('StoreSettings', 'faviconMediaId')).toBe(true)
  })

  test('every model holding a media reference is read by the usage index', () => {
    const models = [...new Set(fields.map((f) => f.model))].filter((m) => !(m in EXEMPT))
    const missing = models.filter((m) => !source.includes(`db.${accessor(m)}.`))
    expect(
      missing,
      'These models can hold a media reference but nothing in media-usage.ts queries them, ' +
        'so a file held only by one of them will read as Unused and become deletable. ' +
        'Add a source, or add the model to EXEMPT with a reason.'
    ).toEqual([])
  })

  test('every media column is named in the usage index', () => {
    const missing = fields
      .filter((f) => !(f.model in EXEMPT))
      .filter((f) => !source.includes(f.column))
      .map((f) => `${f.model}.${f.column}`)
    expect(
      missing,
      'These columns can hold a media id but are never mentioned in media-usage.ts. ' +
        'A social-share image is the usual culprit — it is a plain String? with no ' +
        'relation, so nothing in the relation graph will ever surface it.'
    ).toEqual([])
  })

  test('SeoSetting.ogDefaultImageId is covered — it matches no naming convention', () => {
    // Every other soft FK is `ogImageMediaId`. This one is spelled differently,
    // so a coverage check written around that name alone would miss it.
    expect(source).toContain('ogDefaultImageId')
    expect(source).toContain('db.seoSetting.')
  })

  test('exemptions carry a reason', () => {
    for (const [model, reason] of Object.entries(EXEMPT)) {
      expect(reason.length, `${model} is exempt without an explanation`).toBeGreaterThan(20)
    }
  })
})
