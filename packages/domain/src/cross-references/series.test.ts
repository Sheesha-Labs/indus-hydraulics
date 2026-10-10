import { describe, expect, it } from 'vitest'
import {
  crossReferenceSeries,
  equivalenceSentence,
  equivalentsByPartNumber,
  seriesByBrand,
} from './series'

describe('crossReferenceSeries', () => {
  it.each([
    ['Parker', '4 HTX-SS', 'HTX-SS'],
    ['Parker', '4-2 HTX-SS', 'HTX-SS'],
    ['Parker', '6-4 F5OX-SS', 'F5OX-SS'],
    ['Parker', '19243-4-4', '19243'],
    ['Parker', '0107-4-4-SS', '0107-#-SS'],
    ['Aeroquip', '259-2027-4-2', '259-2027'],
    ['Aeroquip', '2027-4-4', '2027'],
    ['SSP', 'J4U', 'J#U'],
    ['SSP', 'J4-2U', 'J#U'],
    ['Swagelok', 'SS-400-1-4', 'SS-#00-1'],
    ['Swagelok', 'SS-400-6', 'SS-#00-6'],
    ['Crosby', 'G-209', 'G-209'],
    ['Crosby', '319', '319'],
    ['SAE', '70101', '70101'],
    ['MS', 'MS51501', 'MS51501'],
  ])('%s %s → %s', (brand, mpn, series) => {
    expect(crossReferenceSeries(brand, mpn)).toBe(series)
  })

  it('never turns a letter x in a code into a size marker', () => {
    expect(crossReferenceSeries('Parker', '8 C5OX-SS')).toBe('C5OX-SS')
  })
})

describe('equivalents', () => {
  const rows = [
    { competitorBrand: 'SAE', competitorMpn: '70101', variantPartNumber: 'IH-SS-2403-04-04' },
    { competitorBrand: 'Parker', competitorMpn: '4 HTX-SS', variantPartNumber: 'IH-SS-2403-04-04' },
    {
      competitorBrand: 'Aeroquip',
      competitorMpn: '259-2027-4-4',
      variantPartNumber: 'IH-SS-2403-04-04',
    },
    { competitorBrand: 'Parker', competitorMpn: '6 HTX-SS', variantPartNumber: 'IH-SS-2403-06-06' },
    { competitorBrand: 'Parker', competitorMpn: '13943' },
  ]

  it('orders makers before standards and keys cells by part number', () => {
    const { brands, byPartNumber } = equivalentsByPartNumber(rows)
    expect(brands).toEqual(['Parker', 'Aeroquip', 'SAE'])
    expect(byPartNumber.get('IH-SS-2403-04-04')).toEqual({
      SAE: '70101',
      Parker: '4 HTX-SS',
      Aeroquip: '259-2027-4-4',
    })
  })

  it('summarises series per brand, most-matched first', () => {
    expect(seriesByBrand(rows)).toEqual([
      { brand: 'Parker', series: ['HTX-SS', '13943'], sizes: 3 },
      { brand: 'Aeroquip', series: ['259-2027'], sizes: 1 },
      { brand: 'SAE', series: ['70101'], sizes: 1 },
    ])
  })

  it('writes one equivalence sentence with standards in brackets', () => {
    expect(equivalenceSentence(seriesByBrand(rows))).toBe(
      'Equivalent to Parker HTX-SS / 13943 and Aeroquip 259-2027 (SAE 70101).'
    )
    expect(equivalenceSentence([])).toBeNull()
  })
})
