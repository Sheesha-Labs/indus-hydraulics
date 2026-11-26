import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  effortSignals,
  fitCounts,
  fitSignals,
  legitimacyFromSignals,
  legitimacySignals,
  suspiciousLinks,
  type QualifyInput,
} from './signals'

const base: QualifyInput = {
  sender: {
    email: 'buyer@sample-mining.example.test',
    domain: 'sample-mining.example.test',
    freeMail: false,
    domainAgeDays: 4000,
    domainRegisteredYear: 2015,
    domainMatchesName: true,
    websiteReachable: true,
    registryFound: true,
    companyName: 'Sample Mining Services',
  },
  links: { suspicious: 0, hosts: [] },
  history: { messages: 0, enquiries: 0, quotations: 0, orders: 0 },
  lines: [
    ...Array.from({ length: 11 }, (_, i) => ({
      no: i + 1,
      trade: i < 9 ? 'Hose assemblies' : 'Cylinder seal kits',
      tradeSourced: true,
      proprietary: false,
      qty: 2 + i * 3,
      uom: 'EA',
    })),
    { no: 12, trade: 'OEM hydraulics', tradeSourced: true, proprietary: true, qty: 2, uom: 'EA' },
    { no: 13, trade: 'OEM hydraulics', tradeSourced: true, proprietary: true, qty: 2, uom: 'EA' },
    { no: 14, trade: null, tradeSourced: false, proprietary: false, qty: 1, uom: 'EA' },
  ],
  value: { currency: 'USD', min: 18000, max: 24000, lines: 11 },
  workingDaysLeft: 2,
  deadlineLabel: 'Mon 28 Sep, 12:00',
  supplierReplyDays: 2,
}

describe('qualification never reads a country', () => {
  it('has no country, region or address field anywhere in its input', () => {
    type Keys<T> = T extends object ? { [K in keyof T]: K | Keys<T[K]> }[keyof T] : never
    expectTypeOf<
      Extract<Keys<QualifyInput>, 'country' | 'region' | 'address'>
    >().toEqualTypeOf<never>()
    const json = JSON.stringify(base)
    expect(json).not.toMatch(/country|region|address/i)
  })
})

describe('legitimacy (board 167)', () => {
  it('a known-looking company with an old domain, website and registry reads legitimate', () => {
    const s = legitimacySignals(base)
    expect(s.map((x) => [x.mark, x.text])).toEqual([
      ['ok', 'Domain sample-mining.example.test registered 2015, matches the company name'],
      ['ok', 'A real website and a registry entry'],
      ['none', 'No previous history with us'],
      ['ok', 'Company address, not free mail'],
      ['ok', 'No login links or “view document” pages'],
    ])
    expect(legitimacyFromSignals(s)).toBe('legitimate')
  })

  it('a three-week domain without a website or registry is suspicious (171b state 2)', () => {
    const s = legitimacySignals({
      ...base,
      sender: {
        ...base.sender,
        domainAgeDays: 21,
        domainRegisteredYear: 2026,
        websiteReachable: false,
        registryFound: false,
        domainMatchesName: false,
      },
    })
    expect(s[0]).toMatchObject({
      mark: 'bad',
      text: expect.stringContaining('registered 3 weeks ago'),
    })
    expect(s[1]).toMatchObject({ mark: 'bad', text: 'No website and no registry entry found' })
    expect(legitimacyFromSignals(s)).toBe('suspicious')
  })

  it('a link to a sign-in page is spam (171b state 3); free mail is a warning', () => {
    const s = legitimacySignals({
      ...base,
      sender: {
        ...base.sender,
        freeMail: true,
        domain: 'webmail.example',
        domainAgeDays: null,
        domainRegisteredYear: null,
        websiteReachable: null,
        registryFound: null,
      },
      links: { suspicious: 2, hosts: ['docs-share.example'] },
      history: { messages: 3, enquiries: 1, quotations: 1, orders: 0 },
    })
    expect(s.map((x) => x.mark)).toEqual(['warn', 'ok', 'bad'])
    expect(s[1]!.text).toBe('Known: 1 enquiry, 1 quotation')
    expect(s[2]!.sub).toBe('On docs-share.example. Never opened.')
    expect(legitimacyFromSignals(s)).toBe('spam')
  })

  it('registration not looked up, a website only', () => {
    const s = legitimacySignals({
      ...base,
      sender: {
        ...base.sender,
        domainAgeDays: null,
        domainRegisteredYear: null,
        domainMatchesName: null,
        registryFound: false,
      },
      history: { messages: 2, enquiries: 0, quotations: 0, orders: 0 },
    })
    expect(s[0]).toMatchObject({ mark: 'none', sub: 'Registration date not looked up' })
    expect(s[1]).toMatchObject({ mark: 'warn', text: 'A website, no registry entry on file' })
    expect(s[2]!.text).toBe('Known: 2 earlier emails')
    expect(
      legitimacySignals({
        ...base,
        sender: { ...base.sender, websiteReachable: false, registryFound: true },
      })[1]!.text
    ).toBe('A registry entry, no website answered')
    expect(
      legitimacySignals({
        ...base,
        sender: { ...base.sender, websiteReachable: null, registryFound: null },
      }).some((x) => x.text.includes('website'))
    ).toBe(false)
    expect(
      legitimacyFromSignals([
        { mark: 'warn', text: 'a' },
        { mark: 'warn', text: 'b' },
      ])
    ).toBe('suspicious')
    expect(
      legitimacySignals({
        ...base,
        sender: { ...base.sender, domainAgeDays: 200, domainRegisteredYear: 2026 },
      })[0]!.mark
    ).toBe('warn')
  })
})

describe('fit and effort (board 167)', () => {
  it('11 of 14 sourced, two proprietary, one outside the range, quantities normal', () => {
    expect(fitCounts(base)).toEqual({ fit: 13, of: 14 })
    const f = fitSignals(base)
    expect(f.map((x) => [x.mark, x.text])).toEqual([
      ['ok', '13 of 14 lines in categories sourced before'],
      ['warn', '2 proprietary OEM parts'],
      ['bad', '1 line outside our range'],
      ['ok', 'Quantities look normal'],
    ])
    expect(f[0]!.sub).toBe('Hose assemblies (9), Cylinder seal kits (2), OEM hydraulics (2)')
    expect(f[3]!.sub).toBe('1 to 32 per line')
    const odd = fitSignals({ ...base, lines: [{ ...base.lines[0]!, qty: 0 }] })
    expect(odd.at(-1)).toMatchObject({ mark: 'warn', text: '1 quantity to check' })
    expect(fitSignals({ ...base, lines: [{ ...base.lines[13]! }] })[0]!.mark).toBe('bad')
  })

  it('effort: groups, suppliers, value from price history, the closing date against supplier replies', () => {
    const e = effortSignals(base)
    expect(e.map((x) => x.text)).toEqual([
      '14 lines · 4 groups · about 9 suppliers',
      'About USD 18,000–24,000 on 11 lines',
      'Closing Mon 28 Sep, 12:00 · 2 working days',
    ])
    expect(e[2]!.mark).toBe('warn')
    const none = effortSignals({ ...base, value: null, workingDaysLeft: null })
    expect(none[1]!.text).toBe('No price history yet')
    expect(none[2]!.text).toBe('No closing date given')
    expect(
      effortSignals({
        ...base,
        workingDaysLeft: 9,
        value: { ...base.value!, lines: 14, max: 2_400_000 },
      })[2]!.mark
    ).toBe('ok')
    expect(
      effortSignals({ ...base, value: { ...base.value!, max: 2_400_000, min: 900 } })[1]!.text
    ).toBe('About USD 900–2.4M on 11 lines')
  })
})

describe('suspiciousLinks', () => {
  it('counts lures and mismatched anchors, returns hosts only', () => {
    expect(
      suspiciousLinks(
        'See https://docs-share.example/view?id=1 and https://client.example/specs.pdf'
      )
    ).toEqual({
      suspicious: 1,
      hosts: ['docs-share.example'],
    })
    expect(
      suspiciousLinks(
        '',
        '<a href="https://evil.example/x">www.client.example</a> <a href="https://client.example/a">client.example</a>'
      )
    ).toEqual({ suspicious: 1, hosts: ['evil.example'] })
    expect(suspiciousLinks('Plain text, no links.', null)).toEqual({ suspicious: 0, hosts: [] })
    expect(suspiciousLinks('https://x.example/login https://x.example/login')).toEqual({
      suspicious: 1,
      hosts: ['x.example'],
    })
  })
})
