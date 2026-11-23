import { describe, expect, it } from 'vitest'
import { REDACTED, mayDeliver, opsUrl, redact, testRecipients } from './system-email'
import { googleOnlyEmail, passwordResetEmail } from './system-templates'

const LINK =
  'https://operations.example.test/sign-in/reset/AbCdEfGhIjKlMnOpQrStUv0123456789abcdefghijk'
const TOKEN = LINK.split('/').pop()!

describe('system email', () => {
  it('removes every redacted string from the stored copy, link and bare token alike', () => {
    const mail = passwordResetEmail({ link: LINK, minutes: 30 })
    for (const body of [mail.html, mail.text]) {
      expect(body).toContain(TOKEN)
      const stored = redact(body, [LINK, TOKEN])
      expect(stored).not.toContain(TOKEN)
      expect(stored).toContain(REDACTED)
    }
    expect(redact(`see ${TOKEN}`, [LINK, TOKEN])).toBe(`see ${REDACTED}`)
  })

  it('delivers outside production only to OPS_TEST_RECIPIENTS', () => {
    const preview = { APP_ENV: 'preview' as const, OPS_TEST_RECIPIENTS: ' Owner@Example.test , ' }
    expect([...testRecipients(preview)]).toEqual(['owner@example.test'])
    expect(mayDeliver('owner@example.test', preview)).toBe(true)
    expect(mayDeliver('helper@example.test', preview)).toBe(false)
    expect(mayDeliver('helper@example.test', { APP_ENV: 'local' })).toBe(false)
    expect(mayDeliver('anyone@example.test', { APP_ENV: 'production' })).toBe(true)
  })

  it('builds links from NEXT_PUBLIC_OPS_BASE_URL, never from a request', () => {
    expect(
      opsUrl('/sign-in', { NEXT_PUBLIC_OPS_BASE_URL: 'https://operations.example.test' })
    ).toBe('https://operations.example.test/sign-in')
    expect(() => opsUrl('/sign-in', {})).toThrow('NEXT_PUBLIC_OPS_BASE_URL')
  })

  it('escapes what the templates insert and says the board’s words', () => {
    const mail = googleOnlyEmail({ signInUrl: 'https://x.example.test/sign-in?a=1&b="2"' })
    expect(mail.html).toContain('&amp;b=&quot;2&quot;')
    expect(mail.text).toContain('This account signs in with Google. Use Continue with Google.')
    expect(passwordResetEmail({ link: LINK, minutes: 30 }).text).toContain('30 minutes')
  })
})
