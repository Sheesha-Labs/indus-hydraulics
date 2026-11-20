import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DIAL_COUNTRIES, MARKETS } from '@indus/domain'
import { flagSrc } from '../phone'

// Every phone picker shows a flag per country. A country without a file
// renders a broken image, silently — so check here.
describe('country flags', () => {
  const publicDir = join(__dirname, '../../../public')

  it('has a 3:2 flag in public/flags for every dial country', () => {
    const missing = DIAL_COUNTRIES.map((c) => c[0]).filter((iso) => !existsSync(join(publicDir, flagSrc(iso))))
    expect(missing).toEqual([])
  })

  it('lists every export market in the dial countries', () => {
    const isos = new Set(DIAL_COUNTRIES.map((c) => c[0]))
    const missing = MARKETS.map((m) => m.countryCode.toUpperCase()).filter((iso) => !isos.has(iso))
    expect(missing).toEqual([])
  })
})
