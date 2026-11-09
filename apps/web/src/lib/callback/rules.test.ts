import { describe, expect, it } from 'vitest'
import {
  CALLBACK_MESSAGES,
  displayPhone,
  isExcludedPath,
  marketSlugFromPath,
  looksLikeBot,
  orderCountries,
  overrideSurface,
  readEpoch,
  suppressionReason,
  surfaceFor,
  toE164,
  validateCallbackFields,
  whatsappHref,
  type PromptContext,
} from './rules'

const base: PromptContext = {
  now: 1_000_000_000_000,
  trigger: 'inactivity',
  path: '/p/some-hose',
  shownThisSession: false,
  dismissedUntil: 0,
  submittedUntil: 0,
  fieldFocused: false,
  pageFormDirty: false,
  overlayOpen: false,
  bot: false,
  pageviews: 3,
  msOnPage: 60_000,
}

describe('surfaceFor', () => {
  it('maps every trigger per device', () => {
    expect(surfaceFor('inactivity', true)).toBe('B')
    expect(surfaceFor('inactivity', false)).toBe('E')
    expect(surfaceFor('exit', true)).toBe('B')
    expect(surfaceFor('exit', false)).toBeNull()
    expect(surfaceFor('tab_return', true)).toBe('D')
    expect(surfaceFor('tab_return', false)).toBe('E')
  })
})

describe('overrideSurface', () => {
  it('reads ?cb= case-insensitively and ignores anything else', () => {
    expect(overrideSurface('?cb=B')).toBe('B')
    expect(overrideSurface('?x=1&cb=d')).toBe('D')
    expect(overrideSurface('?cb=Z')).toBeNull()
    expect(overrideSurface('')).toBeNull()
  })
})

describe('isExcludedPath', () => {
  it('matches the path and its children, not lookalikes', () => {
    expect(isExcludedPath('/contact')).toBe(true)
    expect(isExcludedPath('/quote/RFQ-2026-0001')).toBe(true)
    expect(isExcludedPath('/privacy')).toBe(true)
    expect(isExcludedPath('/newsletter/confirm')).toBe(true)
    expect(isExcludedPath('/contacts-of-mine')).toBe(false)
    expect(isExcludedPath('/p/quote-holder')).toBe(false)
    expect(isExcludedPath('/')).toBe(false)
  })
})

describe('marketSlugFromPath', () => {
  it('reads only a market page', () => {
    expect(marketSlugFromPath('/markets/oman')).toBe('oman')
    expect(marketSlugFromPath('/markets/saudi-arabia/')).toBe('saudi-arabia')
    expect(marketSlugFromPath('/markets')).toBeNull()
    expect(marketSlugFromPath('/p/oman-valve')).toBeNull()
  })
})

describe('suppressionReason', () => {
  it('allows a normal page', () => {
    expect(suppressionReason(base)).toBeNull()
  })

  it('shows once per session', () => {
    expect(suppressionReason({ ...base, shownThisSession: true })).toBe('shown')
  })

  it('honours the 7-day close and the 30-day submit windows', () => {
    expect(suppressionReason({ ...base, dismissedUntil: base.now + 1 })).toBe('dismissed')
    expect(suppressionReason({ ...base, submittedUntil: base.now + 1 })).toBe('submitted')
    expect(suppressionReason({ ...base, dismissedUntil: base.now - 1 })).toBeNull()
  })

  it('never opens on excluded paths', () => {
    expect(suppressionReason({ ...base, path: '/contact' })).toBe('excluded_path')
  })

  it('never interrupts someone typing or another overlay', () => {
    expect(suppressionReason({ ...base, fieldFocused: true })).toBe('field_focused')
    expect(suppressionReason({ ...base, pageFormDirty: true })).toBe('form_dirty')
    expect(suppressionReason({ ...base, overlayOpen: true })).toBe('overlay_open')
  })

  it('ignores bots', () => {
    expect(suppressionReason({ ...base, bot: true })).toBe('bot')
  })

  it('ignores exit intent in the first 8 seconds', () => {
    expect(suppressionReason({ ...base, trigger: 'exit', msOnPage: 7_999 })).toBe('too_early')
    expect(suppressionReason({ ...base, trigger: 'exit', msOnPage: 8_000 })).toBeNull()
  })

  it('applies the bounce guard to inactivity only', () => {
    const lander = { ...base, pageviews: 1, msOnPage: 10_000 }
    expect(suppressionReason(lander)).toBe('bounce_guard')
    expect(suppressionReason({ ...lander, msOnPage: 15_000 })).toBeNull()
    expect(suppressionReason({ ...lander, pageviews: 2 })).toBeNull()
    expect(suppressionReason({ ...lander, trigger: 'tab_return' })).toBeNull()
  })
})

describe('readEpoch', () => {
  it('treats junk as zero', () => {
    expect(readEpoch(null)).toBe(0)
    expect(readEpoch('abc')).toBe(0)
    expect(readEpoch('-5')).toBe(0)
    expect(readEpoch('1700000000000')).toBe(1_700_000_000_000)
  })
})

describe('looksLikeBot', () => {
  it('flags automation and crawlers', () => {
    expect(looksLikeBot('Mozilla/5.0 (Macintosh) Safari/605', false)).toBe(false)
    expect(looksLikeBot('Mozilla/5.0 (compatible; Googlebot/2.1)', false)).toBe(true)
    expect(looksLikeBot('Mozilla/5.0 HeadlessChrome/120', false)).toBe(true)
    expect(looksLikeBot('Mozilla/5.0', true)).toBe(true)
  })
})

describe('orderCountries', () => {
  const list = [
    ['BH', '+973'],
    ['KE', '+254'],
    ['KW', '+965'],
    ['NG', '+234'],
    ['OM', '+968'],
    ['QA', '+974'],
    ['SA', '+966'],
  ] as const

  it('puts the default first, then the GCC, then the rest', () => {
    expect(orderCountries(list, 'KE').map((c) => c[0])).toEqual(['KE', 'AE', 'SA', 'OM', 'KW', 'QA', 'BH', 'NG'])
  })

  it('falls back to the UAE, which is always present', () => {
    expect(orderCountries(list, 'ZZ')[0]).toEqual(['AE', '+971'])
  })

  it('does not repeat the default in the GCC block', () => {
    const iso = orderCountries(list, 'OM').map((c) => c[0])
    expect(iso.filter((x) => x === 'OM')).toHaveLength(1)
    expect(iso[0]).toBe('OM')
  })
})

describe('toE164', () => {
  it('drops a trunk zero and spaces', () => {
    expect(toE164('+971', '052 123 4567')).toBe('+971521234567')
    expect(toE164('+971', '52 123 4567')).toBe('+971521234567')
  })

  it('drops a repeated 00 country code', () => {
    expect(toE164('+968', '00968 9123 4567')).toBe('+96891234567')
  })

  it('rejects too short and too long', () => {
    expect(toE164('+971', '12345')).toBeNull()
    expect(toE164('+971', '123456789012345')).toBeNull()
    expect(toE164('', '521234567')).toBeNull()
  })
})

describe('validateCallbackFields', () => {
  const ok = { name: 'Fatima Al Hashimi', email: 'f@company.ae', dial: '+971', phone: '52 123 4567' }

  it('passes a complete request', () => {
    expect(validateCallbackFields(ok)).toEqual({})
  })

  it('names each bad field with the agreed message', () => {
    expect(validateCallbackFields({ ...ok, name: 'F', email: 'f@', phone: '12' })).toEqual({
      name: CALLBACK_MESSAGES.name,
      email: CALLBACK_MESSAGES.email,
      phone: CALLBACK_MESSAGES.phone,
    })
  })
})

describe('displayPhone', () => {
  it('reads a number back in groups', () => {
    expect(displayPhone('+971521234567', '+971')).toBe('+971 52 123 4567')
  })
})

describe('whatsappHref', () => {
  it('names the page without the site suffix', () => {
    const href = whatsappHref('971522477942', '2SN hose | Indus Hydraulics')
    expect(href).toBe(
      `https://wa.me/971522477942?text=${encodeURIComponent("Hello, I'm on 2SN hose and need help finding a part.")}`,
    )
  })
})
