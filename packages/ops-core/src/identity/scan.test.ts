import { describe, expect, it } from 'vitest'
import { buildSupplierDenyList, scanMoney, scanText } from './scan'

describe('identity scan (deterministic half)', () => {
  const deny = buildSupplierDenyList([
    {
      name: 'Kestrel Valve Co',
      aliases: ['Kestrel Armaturen'],
      domains: ['kestrel-valves.example'],
      emails: ['sales@kestrel-valves.example'],
      refs: ['KV-88213'],
    },
    { name: 'Sample Trading LLC', domains: ['sample.example'] },
  ])

  it('builds every way a supplier can be named, skipping generic words', () => {
    expect(deny.map((d) => [d.term, d.kind])).toEqual([
      ['kestrel valve co', 'supplier name'],
      ['kestrel', 'supplier name'],
      ['kestrel armaturen', 'supplier alias'],
      ['kestrel-valves.example', 'supplier domain'],
      ['kestrel-valves', 'supplier domain'],
      ['sales@kestrel-valves.example', 'supplier email'],
      ['kv-88213', 'supplier reference'],
      ['sample trading llc', 'supplier name'],
      ['sample.example', 'supplier domain'],
    ])
  })

  it('finds whole words only, case-insensitive, in order', () => {
    expect(
      scanText('Our supplier KESTREL declined; ref KV-88213.', deny).map((h) => h.term)
    ).toEqual(['kestrel', 'kv-88213'])
    expect(scanText('Kestrelfield is a place; kestrels fly.', deny)).toEqual([])
    expect(scanText('We are unable to offer the items requested.', deny)).toEqual([])
  })

  it('finds amounts and margin words', () => {
    expect(
      scanMoney('Price USD 1,690 or $385.50, about 3 dollars; €12 and £4; AED12').map((h) => h.term)
    ).toEqual(['USD 1,690', '$385.50', '3 dollars', '€12', '£4', 'AED12'])
    expect(scanMoney('Our margin is thin; the landed cost rose.').map((h) => h.kind)).toEqual([
      'margin',
      'margin',
    ])
    expect(scanMoney('Line 14, 24 hoses, 2 Oct.')).toEqual([])
  })
})
