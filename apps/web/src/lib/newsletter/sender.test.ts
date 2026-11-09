import { describe, expect, it } from 'vitest'
import { DEFAULT_SENDER_SETTINGS, formatFrom, resolveSender, senderSettingsSchema } from './sender'

// Bazar's sender.test.ts, adapted: here only the local part is chosen.

describe('senderSettingsSchema', () => {
  it('accepts the defaults and normalises case', () => {
    expect(senderSettingsSchema.parse({ fromName: ' Indus Hydraulics ', fromLocal: 'News', replyTo: 'Sales@IndusHydraulics.me' })).toEqual({
      fromName: 'Indus Hydraulics',
      fromLocal: 'news',
      replyTo: 'sales@indushydraulics.me',
    })
  })

  it('refuses a local part that is really a whole address, or header-breaking names', () => {
    expect(senderSettingsSchema.safeParse({ ...DEFAULT_SENDER_SETTINGS, fromLocal: 'sales@indushydraulics.com' }).success).toBe(false)
    expect(senderSettingsSchema.safeParse({ ...DEFAULT_SENDER_SETTINGS, fromLocal: '.dot' }).success).toBe(false)
    expect(senderSettingsSchema.safeParse({ ...DEFAULT_SENDER_SETTINGS, fromName: 'Indus <ceo@x.com>' }).success).toBe(false)
    expect(senderSettingsSchema.safeParse({ ...DEFAULT_SENDER_SETTINGS, fromName: 'Indus\r\nBcc: x@y.com' }).success).toBe(false)
    expect(senderSettingsSchema.safeParse({ ...DEFAULT_SENDER_SETTINGS, replyTo: 'not an address' }).success).toBe(false)
  })
})

describe('resolveSender', () => {
  it('always sends from the newsletter subdomain', () => {
    const s = resolveSender({ fromName: 'Indus Hydraulics', fromLocal: 'updates', replyTo: 'sales@indushydraulics.me' })
    expect(s.fromEmail).toBe('updates@news.indushydraulics.com')
    expect(formatFrom(s)).toBe('Indus Hydraulics <updates@news.indushydraulics.com>')
  })
})
