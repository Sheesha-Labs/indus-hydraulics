import { describe, expect, it } from 'vitest'
import {
  companyInitials,
  contactRefusal,
  isSendableContact,
  pickSendableContact,
  isFreeMailDomain,
  isPunycode,
  lookalikeDomain,
  normaliseCompanyName,
  normaliseDomain,
  registrableDomain,
  sameCompanyName,
} from './index'

describe('normaliseDomain', () => {
  it.each([
    ['Example.COM', 'example.com'],
    ['www.example.com', 'example.com'],
    ['https://www.example.ae/about?x=1', 'example.ae'],
    ['http://example.com:8080/', 'example.com'],
    ['sales@Mail.Example.co.uk', 'mail.example.co.uk'],
    ['example.com.', 'example.com'],
    ['www2.example.de', 'example.de'],
    ['', null],
    ['   ', null],
    [null, null],
    ['localhost', null],
    ['not a domain', null],
  ])('%s → %s', (input, out) => {
    expect(normaliseDomain(input)).toBe(out)
  })
})

describe('registrableDomain', () => {
  it.each([
    ['mail.example.co.uk', 'example.co.uk'],
    ['sub.example.com', 'example.com'],
    ['a.b.example.com.sa', 'example.com.sa'],
    ['example.ae', 'example.ae'],
    ['shop.example.ae', 'example.ae'],
    ['x.example.co.ae', 'example.co.ae'],
    ['plant.example.in', 'example.in'],
    ['x.example.co.in', 'example.co.in'],
    ['x.example.com.cn', 'example.com.cn'],
    ['x.example.com.tr', 'example.com.tr'],
    ['example.de', 'example.de'],
    [null, null],
  ])('%s → %s', (input, out) => {
    expect(registrableDomain(input)).toBe(out)
  })
})

describe('isFreeMailDomain', () => {
  const list = ['gmail.com', 'outlook.com', 'yahoo.co.uk']
  it('matches the domain and its sub-domains through the registrable domain', () => {
    expect(isFreeMailDomain('gmail.com', list)).toBe(true)
    expect(isFreeMailDomain('GMAIL.com', list)).toBe(true)
    expect(isFreeMailDomain('uk.yahoo.co.uk', list)).toBe(true)
  })
  it('is false for a company domain or nothing', () => {
    expect(isFreeMailDomain('example.com', list)).toBe(false)
    expect(isFreeMailDomain(null, list)).toBe(false)
    expect(isFreeMailDomain('gmail.com', [])).toBe(false)
  })
})

describe('isPunycode', () => {
  it('flags an xn-- label', () => {
    expect(isPunycode('xn--exmple-cua.com')).toBe(true)
    expect(isPunycode('example.com')).toBe(false)
  })
})

describe('lookalikeDomain', () => {
  it.each([
    ['example.com', 'examp1e.com', true],
    ['example.com', 'exarnple.com', true],
    ['example.ae', 'example-ae.com', false],
    ['examplevalve.com', 'examplevaIve.com', true],
    ['example.com', 'example.ae', true],
    ['example.com', 'mail.example.com', false],
    ['example.com', 'example.com', false],
    ['example.com', 'sample.org', true],
    ['example.com', 'unrelated.com', false],
    ['abc.com', 'abd.com', false],
    ['abc.com', 'abc.ae', true],
    ['bad', 'example.com', false],
  ])('%s vs %s → %s', (a, b, out) => {
    expect(lookalikeDomain(a, b)).toBe(out)
  })
})

describe('normaliseCompanyName', () => {
  it.each([
    ['Example Valve Co. L.L.C', 'example valve'],
    ['EXAMPLE VALVE CO', 'example valve'],
    ['Example Valve Co LLC', 'example valve'],
    ['Sample Client L.L.C.', 'sample client'],
    ['Örnek Hidrolik Sanayi ve Ticaret A.Ş.', 'ornek hidrolik'],
    ['Esempio S.p.A.', 'esempio'],
    ['Beispiel GmbH', 'beispiel'],
    ['Example Pvt. Ltd.', 'example'],
    ['Example FZE', 'example'],
    ['Example FZCO', 'example'],
    ['Example & Sons', 'example and sons'],
    ['Trading Co', 'trading'],
    ['  ', ''],
    [null, ''],
  ])('%s → %s', (input, out) => {
    expect(normaliseCompanyName(input)).toBe(out)
  })
  it('compares names', () => {
    expect(sameCompanyName('Example Valve Co.', 'EXAMPLE VALVE LLC')).toBe(true)
    expect(sameCompanyName('Example Valve', 'Example Pumps')).toBe(false)
    expect(sameCompanyName('', '')).toBe(false)
  })
  it('builds initials', () => {
    expect(companyInitials('Example Valve Co')).toBe('EV')
    expect(companyInitials('Sample')).toBe('SA')
    expect(companyInitials('')).toBe('?')
  })
})

describe('isSendableContact', () => {
  const base = {
    email: 'sales@example.com',
    sourceKind: 'manual',
    status: 'active',
    archivedAt: null,
  }
  it('allows a verified, active contact', () => {
    expect(contactRefusal(base)).toBeNull()
    expect(isSendableContact({ ...base, sourceKind: 'verified_on_page' })).toBe(true)
    expect(isSendableContact({ ...base, sourceKind: 'email_header' })).toBe(true)
  })
  it.each([
    [{ email: null }, 'no_email'],
    [{ email: 'nobody' }, 'no_email'],
    [{ sourceKind: 'directory_only' }, 'directory_only'],
    [{ status: 'bouncing' }, 'bounced'],
    [{ bouncedAt: new Date() }, 'bounced'],
    [{ archivedAt: new Date() }, 'archived'],
    [{ status: 'left' }, 'inactive'],
    [{ status: 'do_not_use' }, 'inactive'],
  ])('%o → %s', (patch, reason) => {
    expect(contactRefusal({ ...base, ...patch })).toBe(reason)
    expect(isSendableContact({ ...base, ...patch })).toBe(false)
  })
  it('picks by role, preferred first, skipping unsendable', () => {
    const c = (id: string, role: string | null, extra: Record<string, unknown> = {}) => ({
      ...base,
      id,
      role,
      isPreferred: false,
      ...extra,
    })
    const list = [
      c('a', 'Sales'),
      c('b', 'Quality', { sourceKind: 'directory_only' }),
      c('c', 'Sales', { isPreferred: true }),
      c('d', null),
    ]
    expect(pickSendableContact(list, ['Quality', 'Sales'])?.id).toBe('c')
    expect(pickSendableContact(list, ['Accounts'])?.id).toBe('c')
    expect(pickSendableContact([c('x', 'Sales', { status: 'left' })], ['Sales'])).toBeNull()
    expect(pickSendableContact([c('a', 'Sales'), c('d', null)])?.id).toBe('a')
  })
})
