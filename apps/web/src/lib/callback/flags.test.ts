import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MARKETS } from '@indus/domain'
import { FALLBACK_COUNTRY, flagSrc } from './rules'

// The call-back prompt's country picker shows a flag for every market. A new
// market without a file renders a broken image, silently — so check here.
describe('country flags', () => {
  it('has a 3:2 flag in public/flags for every market and the UAE', () => {
    const publicDir = join(__dirname, '../../../public')
    const isos = new Set([FALLBACK_COUNTRY[0], ...MARKETS.map((m) => m.countryCode.toUpperCase())])
    const missing = [...isos].filter((iso) => !existsSync(join(publicDir, flagSrc(iso))))
    expect(missing).toEqual([])
  })
})
