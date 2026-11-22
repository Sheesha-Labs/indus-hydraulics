import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateAll, type CoreTokens, type ExtTokens } from '../build/generate-tokens'
import { IO_COLORS, IO_TEXT_ROLES } from '../tokens.generated'

/**
 * Tokens are generated, never hand-edited (ADR-29). Regenerates every output in memory and
 * compares it with the committed file. Fix a failure with `bun run --filter @indus/ops-ui tokens`.
 */
const PKG = join(import.meta.dirname, '..', '..')
const coreText = readFileSync(join(PKG, 'tokens/tokens.json'), 'utf8')
const core = JSON.parse(coreText) as CoreTokens
const ext = JSON.parse(readFileSync(join(PKG, 'tokens/tokens.ext.json'), 'utf8')) as ExtTokens

describe('token drift', () => {
  for (const [file, expected] of Object.entries(generateAll(core, ext))) {
    it(`${file} equals the generator output`, () => {
      expect(readFileSync(join(PKG, file), 'utf8')).toBe(expected)
    })
  }

  it('no type role shares a name with a colour (text-io-<x> must mean one thing)', () => {
    // text-io-card once set both 15px and the white card colour: the text vanished.
    const colours = new Set<string>(IO_COLORS)
    expect(IO_TEXT_ROLES.filter((r) => colours.has(r))).toEqual([])
  })

  it('every ext token records its sign-off state and where it is used', () => {
    for (const [name, t] of Object.entries(ext)) {
      expect(['awaiting', 'approved'], name).toContain(t.signoff)
      expect(t.source.length, name).toBeGreaterThan(0)
    }
  })

  const handoff = process.env.OPS_DESIGN_REF_DIR
    ? join(process.env.OPS_DESIGN_REF_DIR, 'foundations', 'tokens.json')
    : ''
  // Local only: the handoff is never in the repo or CI.
  it.skipIf(!(handoff && existsSync(handoff)))(
    'tokens/tokens.json is byte-for-byte the handoff file',
    () => {
      expect(coreText).toBe(readFileSync(handoff, 'utf8'))
    }
  )
})
