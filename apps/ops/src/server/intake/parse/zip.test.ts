import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { expandZip, parseZip } from './zip'

describe('parseZip', () => {
  it('a compression bomb is stored, not expanded', async () => {
    expect(await parseZip(fixture('bomb.zip'))).toMatchObject({
      kind: 'zip',
      decision: 'store_only',
      reason: 'ratio_too_high',
    })
  })
  it('a normal archive expands; resource forks are skipped', async () => {
    const doc = await parseZip(fixture('two-files.zip'))
    expect(doc).toMatchObject({ kind: 'zip', decision: 'expand', entries: [{ name: 'lines.csv' }] })
    const files = await expandZip(fixture('two-files.zip'))
    expect(files.map((f) => f.name)).toEqual(['lines.csv'])
    expect(new TextDecoder().decode(files[0]!.bytes)).toContain('TEST-0001')
  })
})
