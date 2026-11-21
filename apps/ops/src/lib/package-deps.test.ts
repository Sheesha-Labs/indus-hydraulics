import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The dependency rule from 10-architecture §4.1. The package boundary is what
 * keeps an Ops change from rebuilding the storefront, so it is asserted here as
 * well as banned in .oxlintrc.json.
 */
const REPO = join(import.meta.dirname, '../../../..')

type Manifest = {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const read = (dir: string): Manifest =>
  JSON.parse(readFileSync(join(REPO, dir, 'package.json'), 'utf8')) as Manifest

const internal = (m: Manifest) =>
  Object.keys({ ...m.dependencies, ...m.devDependencies, ...m.peerDependencies })
    .filter((d) => d.startsWith('@indus/'))
    .sort()

const ALLOWED: Record<string, string[]> = {
  'apps/ops': ['@indus/intake', '@indus/ops-core', '@indus/ops-db', '@indus/ops-ui'],
  'packages/ops-core': [],
  'packages/ops-db': [],
  'packages/ops-ai': ['@indus/ops-core'],
  'packages/ops-pdf': ['@indus/ops-core'],
  'packages/ops-ui': ['@indus/ops-core'],
  'packages/intake': [],
}

describe('Ops dependency rule', () => {
  for (const [dir, allowed] of Object.entries(ALLOWED)) {
    it(`${dir} depends only on ${allowed.join(', ') || 'no internal package'}`, () => {
      expect(internal(read(dir)).filter((d) => !allowed.includes(d))).toEqual([])
    })
  }

  it('ops-core and intake depend on zod alone', () => {
    for (const dir of ['packages/ops-core', 'packages/intake']) {
      expect(Object.keys(read(dir).dependencies ?? {})).toEqual(['zod'])
    }
  })

  it('apps/web depends on no Ops package except @indus/intake', () => {
    expect(internal(read('apps/web')).filter((d) => d.startsWith('@indus/ops'))).toEqual([])
  })
})
