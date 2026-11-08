import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { isOwnSender, parseEmailEvent, SIGNATURE_TOLERANCE_S, verifyResendSignature } from './events'

// Ported from Bazar (lib/newsletter/events.test.ts).

const KEY = Buffer.from('a-test-signing-key-of-some-length')
const SECRET = `whsec_${KEY.toString('base64')}`
const NOW = new Date('2026-11-08T12:00:00Z')
const TS = String(Math.floor(NOW.getTime() / 1000))

function sign(body: string, id = 'msg_1', ts = TS, key = KEY) {
  return `v1,${createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64')}`
}

describe('verifyResendSignature', () => {
  const body = '{"type":"email.delivered"}'

  it('accepts a body signed with the secret', () => {
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: TS, signature: sign(body) }, SECRET, NOW)).toBe(true)
  })

  it('accepts any matching entry while a secret is being rotated', () => {
    const other = sign(body, 'msg_1', TS, Buffer.from('the-old-key'))
    const header = `${other} ${sign(body)}`
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: TS, signature: header }, SECRET, NOW)).toBe(true)
  })

  it('refuses a tampered body, another message id, or a wrong key', () => {
    const signature = sign(body)
    expect(verifyResendSignature(`${body} `, { id: 'msg_1', timestamp: TS, signature }, SECRET, NOW)).toBe(false)
    expect(verifyResendSignature(body, { id: 'msg_2', timestamp: TS, signature }, SECRET, NOW)).toBe(false)
    const wrong = `whsec_${Buffer.from('not-the-key').toString('base64')}`
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: TS, signature }, wrong, NOW)).toBe(false)
  })

  it('refuses a replay outside the tolerance, either side', () => {
    for (const ts of [String(Number(TS) - SIGNATURE_TOLERANCE_S - 1), String(Number(TS) + SIGNATURE_TOLERANCE_S + 1)]) {
      expect(
        verifyResendSignature(body, { id: 'msg_1', timestamp: ts, signature: sign(body, 'msg_1', ts) }, SECRET, NOW),
      ).toBe(false)
    }
  })

  it('refuses missing headers, non-v1 entries, a junk timestamp and an empty secret', () => {
    const value = sign(body).slice(3)
    expect(verifyResendSignature(body, { id: null, timestamp: TS, signature: sign(body) }, SECRET, NOW)).toBe(false)
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: TS, signature: `v2,${value}` }, SECRET, NOW)).toBe(false)
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: 'soon', signature: sign(body) }, SECRET, NOW)).toBe(false)
    expect(verifyResendSignature(body, { id: 'msg_1', timestamp: TS, signature: sign(body) }, '', NOW)).toBe(false)
  })
})

describe('parseEmailEvent', () => {
  const base = {
    created_at: '2026-11-08T12:00:01.000Z',
    data: { email_id: 're_1', to: ['a@example.com'] },
  }

  it('maps the three events it acts on', () => {
    expect(parseEmailEvent({ ...base, type: 'email.delivered' })).toEqual({
      type: 'delivered',
      emailId: 're_1',
      recipients: ['a@example.com'],
      permanent: false,
      at: new Date('2026-11-08T12:00:01.000Z'),
      senderDomain: null,
    })
    expect(parseEmailEvent({ ...base, type: 'email.complained' })?.type).toBe('complained')
  })

  it('reads whether a bounce was permanent', () => {
    const bounce = (type: string) =>
      parseEmailEvent({ ...base, type: 'email.bounced', data: { ...base.data, bounce: { type, subType: '', message: '' } } })
    expect(bounce('Permanent')?.permanent).toBe(true)
    expect(bounce('Transient')?.permanent).toBe(false)
    expect(bounce('Undetermined')?.permanent).toBe(false)
  })

  it('ignores other events and payloads without a message id', () => {
    expect(parseEmailEvent({ ...base, type: 'email.opened' })).toBeNull()
    expect(parseEmailEvent({ ...base, type: 'domain.updated' })).toBeNull()
    expect(parseEmailEvent({ type: 'email.delivered', data: {} })).toBeNull()
    expect(parseEmailEvent(null)).toBeNull()
  })

  it('falls back to now for an unreadable timestamp', () => {
    const event = parseEmailEvent({ ...base, created_at: 'yesterday', type: 'email.delivered' })
    expect(event?.at).toBeInstanceOf(Date)
    expect(Number.isNaN(event?.at.getTime())).toBe(false)
  })
})

describe('sender filtering — the Resend account is shared with other sites', () => {
  const event = (from: unknown) =>
    parseEmailEvent({ type: 'email.bounced', data: { email_id: 're_1', to: ['a@b.co'], from } })

  it('reads the From domain in bare and display-name form', () => {
    expect(event('newsletter@news.indushydraulics.com')?.senderDomain).toBe('news.indushydraulics.com')
    expect(event('Indus Hydraulics <Sales@IndusHydraulics.com>')?.senderDomain).toBe('indushydraulics.com')
    expect(event(undefined)?.senderDomain).toBeNull()
  })

  it('acts on the apex and its subdomains only', () => {
    expect(isOwnSender('indushydraulics.com', 'indushydraulics.com')).toBe(true)
    expect(isOwnSender('news.indushydraulics.com', 'indushydraulics.com')).toBe(true)
    expect(isOwnSender('bazarrealestate.com', 'indushydraulics.com')).toBe(false)
    expect(isOwnSender('evilindushydraulics.com', 'indushydraulics.com')).toBe(false)
  })

  it('treats a missing From as ours rather than dropping a bounce', () => {
    expect(isOwnSender(null, 'indushydraulics.com')).toBe(true)
  })
})
