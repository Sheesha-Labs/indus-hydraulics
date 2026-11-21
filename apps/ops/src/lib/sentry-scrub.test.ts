import { describe, expect, it } from 'vitest'
import { scrubEvent } from './sentry-scrub'

describe('scrubEvent', () => {
  it('drops request bodies, cookies and auth headers', () => {
    const out = scrubEvent({
      request: {
        data: { password: 'p' },
        cookies: { 'indus.ops-session': 'jwt' },
        headers: { Cookie: 'a=b', Authorization: 'Bearer t', 'User-Agent': 'ua' },
      },
    })
    expect(out.request).toEqual({ headers: { 'User-Agent': 'ua' } })
  })

  it('removes body, html, text, raw, password, totp and token keys at any depth', () => {
    const out = scrubEvent({
      extra: {
        mail: { bodyHtml: '<p>x</p>', bodyText: 'x', subject: 'RFQ', raw: 'r' },
        auth: { password: 'p', totp: '123456', token: 't', userId: 'u1' },
        list: [{ html: 'h', id: 1 }],
      },
      contexts: { job: { id: 'ops.system.heartbeat', body: 'b' } },
    })
    expect(out.extra).toEqual({
      mail: { subject: 'RFQ' },
      auth: { userId: 'u1' },
      list: [{ id: 1 }],
    })
    expect(out.contexts).toEqual({ job: { id: 'ops.system.heartbeat' } })
  })
})
