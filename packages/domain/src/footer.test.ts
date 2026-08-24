import { describe, expect, it } from 'vitest'
import {
  asFooterSocialPlatform,
  FOOTER_SOCIAL_PLATFORMS,
  FOOTER_SOCIAL_PLATFORM_LABELS,
  guessFooterSocialPlatform,
  isValidSocialHref,
  resolveFooterLegalLine,
} from './footer'

describe('social platforms', () => {
  it('labels every platform', () => {
    for (const p of FOOTER_SOCIAL_PLATFORMS) {
      expect(FOOTER_SOCIAL_PLATFORM_LABELS[p]).toBeTruthy()
    }
  })

  it('reads an unknown stored value back as `other` rather than throwing', () => {
    // A row written before a platform was removed from the list, or by hand in
    // SQL. The footer keeps rendering.
    expect(asFooterSocialPlatform('myspace')).toBe('other')
    expect(asFooterSocialPlatform(null)).toBe('other')
    expect(asFooterSocialPlatform(7)).toBe('other')
  })

  it('guesses the platform from a pasted URL', () => {
    expect(guessFooterSocialPlatform('https://www.linkedin.com/company/indus')).toBe('linkedin')
    expect(guessFooterSocialPlatform('https://instagram.com/indushydraulics')).toBe('instagram')
    expect(guessFooterSocialPlatform('https://x.com/indus')).toBe('x')
    expect(guessFooterSocialPlatform('https://twitter.com/indus')).toBe('x')
    expect(guessFooterSocialPlatform('https://youtu.be/abc')).toBe('youtube')
    expect(guessFooterSocialPlatform('https://wa.me/971522477942')).toBe('whatsapp')
  })

  it('matches subdomains but not hosts that merely end with the same letters', () => {
    expect(guessFooterSocialPlatform('https://uk.linkedin.com/company/indus')).toBe('linkedin')
    // The trap a bare `includes`/`endsWith` on the whole hostname walks into.
    expect(guessFooterSocialPlatform('https://notlinkedin.com/indus')).toBe('other')
    expect(guessFooterSocialPlatform('https://linkedin.com.evil.example/x')).toBe('other')
  })

  it('falls back to `other` on a href that is not a URL at all', () => {
    expect(guessFooterSocialPlatform('linkedin.com/company/indus')).toBe('other')
    expect(guessFooterSocialPlatform('')).toBe('other')
  })

  it('accepts only absolute http(s) hrefs', () => {
    expect(isValidSocialHref('https://linkedin.com/company/indus')).toBe(true)
    expect(isValidSocialHref('http://example.com')).toBe(true)
    // A relative href would emit a `sameAs` pointing the crawler back at us.
    expect(isValidSocialHref('/linkedin')).toBe(false)
    expect(isValidSocialHref('javascript:alert(1)')).toBe(false)
    expect(isValidSocialHref('mailto:sales@indushydraulics.me')).toBe(false)
    expect(isValidSocialHref('')).toBe(false)
  })
})

describe('resolveFooterLegalLine', () => {
  const base = { legalName: 'Indus Hydraulic Power Trading LLC', name: 'Indus Hydraulics', year: 2026 }

  it('uses the edited line when there is one', () => {
    expect(resolveFooterLegalLine({ ...base, footerLegalLine: 'All rights reserved.' })).toBe(
      'All rights reserved.',
    )
  })

  it('substitutes {year} so the line does not go stale in January', () => {
    expect(
      resolveFooterLegalLine({ ...base, footerLegalLine: '© {year} Indus Hydraulic Power Trading LLC' }),
    ).toBe('© 2026 Indus Hydraulic Power Trading LLC')
  })

  it('substitutes every occurrence of {year}, not just the first', () => {
    expect(resolveFooterLegalLine({ ...base, footerLegalLine: '{year}–{year}' })).toBe('2026–2026')
  })

  it('falls back to the legal entity, not the trading name', () => {
    expect(resolveFooterLegalLine({ ...base, footerLegalLine: null })).toBe(
      '© 2026 Indus Hydraulic Power Trading LLC. All rights reserved.',
    )
  })

  it('falls back to the trading name only when there is no legal entity', () => {
    expect(resolveFooterLegalLine({ ...base, legalName: null, footerLegalLine: null })).toBe(
      '© 2026 Indus Hydraulics. All rights reserved.',
    )
  })

  it('treats a blank or whitespace line as unset', () => {
    expect(resolveFooterLegalLine({ ...base, footerLegalLine: '   ' })).toBe(
      '© 2026 Indus Hydraulic Power Trading LLC. All rights reserved.',
    )
  })

  it('never invents a company suffix', () => {
    // The bug this column exists to fix: `Pvt. Ltd.` hardcoded onto a UAE LLC.
    const line = resolveFooterLegalLine({ ...base, legalName: null, footerLegalLine: null })
    expect(line).not.toContain('Pvt')
    expect(line).not.toContain('Ltd')
  })
})
