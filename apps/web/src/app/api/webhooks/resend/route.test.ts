import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The Resend webhook route: signature, other-site events, and the retry
// asked for when newsletter mail has not got its Resend id yet.

const recordEmailEvent = vi.fn()
vi.mock('../../../../lib/newsletter/service', () => ({ recordEmailEvent }))

const KEY = Buffer.from('route-test-signing-key')
process.env.RESEND_WEBHOOK_SECRET = `whsec_${KEY.toString('base64')}`

const { POST } = await import('./route')

function request(payload: unknown) {
  const body = JSON.stringify(payload)
  const id = 'msg_1'
  const ts = String(Math.floor(Date.now() / 1000))
  const sig = `v1,${createHmac('sha256', KEY).update(`${id}.${ts}.${body}`).digest('base64')}`
  return new Request('https://indushydraulics.com/api/webhooks/resend', {
    method: 'POST',
    body,
    headers: { 'svix-id': id, 'svix-timestamp': ts, 'svix-signature': sig },
  }) as never
}

const event = (from: string, at = new Date()) => ({
  type: 'email.delivered',
  created_at: at.toISOString(),
  data: { email_id: 're_1', to: ['a@b.co'], from },
})

beforeEach(() => {
  vi.clearAllMocks()
  recordEmailEvent.mockResolvedValue({ email: true, subscribers: 0, contacts: 0, suppressed: 0 })
})

describe('POST /api/webhooks/resend', () => {
  it('refuses an unsigned request', async () => {
    const res = await POST(new Request('https://x', { method: 'POST', body: '{}' }) as never)
    expect(res.status).toBe(401)
    expect(recordEmailEvent).not.toHaveBeenCalled()
  })

  it('ignores another site’s mail', async () => {
    const res = await POST(request(event('hello@othersite.com')))
    expect(res.status).toBe(200)
    expect(recordEmailEvent).not.toHaveBeenCalled()
  })

  it('records an Indus event', async () => {
    const res = await POST(request(event('Indus Hydraulics <newsletter@news.indushydraulics.com>')))
    expect(res.status).toBe(200)
    expect(recordEmailEvent).toHaveBeenCalledOnce()
  })

  it('asks Resend to retry a recent newsletter event that matched no email yet', async () => {
    recordEmailEvent.mockResolvedValue({ email: false, subscribers: 0, contacts: 0, suppressed: 0 })
    expect((await POST(request(event('newsletter@news.indushydraulics.com')))).status).toBe(503)
  })

  it('does not retry an old one, or transactional mail', async () => {
    recordEmailEvent.mockResolvedValue({ email: false, subscribers: 0, contacts: 0, suppressed: 0 })
    const old = new Date(Date.now() - 60 * 60 * 1000)
    expect((await POST(request(event('newsletter@news.indushydraulics.com', old)))).status).toBe(200)
    expect((await POST(request(event('sales@indushydraulics.com')))).status).toBe(200)
  })
})
