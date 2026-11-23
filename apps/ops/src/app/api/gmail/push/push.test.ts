import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  payload: null as Record<string, unknown> | null,
  verifyThrows: false,
  emitted: [] as Array<{ name: string; id?: string; data: unknown }>,
}))

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    async verifyIdToken({ audience }: { audience: string }) {
      if (h.verifyThrows || audience !== 'https://ops.example.test/api/gmail/push')
        throw new Error('bad token')
      return { getPayload: () => h.payload }
    }
  },
}))
vi.mock('../../../../lib/env', () => ({
  env: () => ({
    GMAIL_PUSH_AUDIENCE: 'https://ops.example.test/api/gmail/push',
    GMAIL_PUSH_SA_EMAIL: 'gmail-push-invoker@example-project.iam.gserviceaccount.com',
  }),
}))
vi.mock('../../../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; id?: string; data: unknown }) => {
    h.emitted.push(e)
    return true
  },
}))
vi.mock('@sentry/nextjs', () => ({ captureMessage: () => undefined }))

const { POST } = await import('./route')

const GOOD = {
  iss: 'https://accounts.google.com',
  email: 'gmail-push-invoker@example-project.iam.gserviceaccount.com',
  email_verified: true,
}

function request(body: unknown, token = 'jwt') {
  return new Request('https://ops.example.test/api/gmail/push', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const notice = (data: unknown, messageId = 'pubsub-1') => ({
  message: { data: Buffer.from(JSON.stringify(data)).toString('base64'), messageId },
})

describe('Gmail push endpoint', () => {
  beforeEach(() => {
    h.payload = { ...GOOD }
    h.verifyThrows = false
    h.emitted.length = 0
  })

  it('401 without a token, with a token for another audience, another account or an unverified email', async () => {
    expect((await POST(request(notice({}), ''))).status).toBe(401)
    h.verifyThrows = true
    expect((await POST(request(notice({})))).status).toBe(401)
    h.verifyThrows = false
    h.payload = { ...GOOD, email: 'someone@example.test' }
    expect((await POST(request(notice({})))).status).toBe(401)
    h.payload = { ...GOOD, email_verified: false }
    expect((await POST(request(notice({})))).status).toBe(401)
    h.payload = { ...GOOD, iss: 'https://evil.example.test' }
    expect((await POST(request(notice({})))).status).toBe(401)
    expect(h.emitted).toEqual([])
  })

  it('204 and one event keyed by the Pub/Sub message id', async () => {
    const res = await POST(
      request(notice({ emailAddress: 'Purchase@Example.test', historyId: 9876 }, 'm-42'))
    )
    expect(res.status).toBe(204)
    expect(h.emitted).toEqual([
      {
        name: 'ops/gmail.notified',
        id: 'gmail-push:m-42',
        data: { emailAddress: 'purchase@example.test', historyId: '9876' },
      },
    ])
  })

  it('acknowledges and drops a malformed body (no redelivery loop), emitting nothing', async () => {
    expect((await POST(request('not json'))).status).toBe(204)
    expect((await POST(request(notice({ emailAddress: 'x' })))).status).toBe(204)
    expect(h.emitted).toEqual([])
  })
})
