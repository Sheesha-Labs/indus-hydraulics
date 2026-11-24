import { beforeEach, describe, expect, it, vi } from 'vitest'

/** /api/health shape (S04-T09): signed in only; mailboxes, send queue, and the pooler alert above 12. */
const h = vi.hoisted(() => ({
  signedIn: true,
  readings: {
    opsAppConnections: 3,
    inngestHeartbeatAt: '2026-11-23T06:00:00.000Z',
    mailboxes: [
      {
        address: 'sales@example.test',
        status: 'live',
        lastSuccessfulSyncAt: '2026-11-23T05:59:00.000Z',
        lagSeconds: 60,
        watchExpiresAt: '2026-11-30T03:10:00.000Z',
      },
    ],
    sendQueue: { scheduled: 2, held: 1, waitingForMailbox: 0, unknown: 0 },
    assistant: {
      paused: false,
      pipelineEnabled: true,
      monthSpendUsd: '1.25',
      budgetUsd: '195.00',
      lastActionAt: '2026-11-23T05:58:00.000Z',
    },
    aiCallsLastHour: 14,
    mailLatency: { p50: 22, p95: 71, count: 200 },
  },
  captured: [] as string[],
}))

vi.mock('@sentry/nextjs', () => ({ captureMessage: (m: string) => void h.captured.push(m) }))
vi.mock('../../../data/health', () => ({
  CONNECTION_ALERT: 12,
  getHealthReadings: async () => h.readings,
}))
vi.mock('../../../lib/access', () => {
  class AccessError extends Error {}
  return {
    AccessError,
    requireOpsUser: async () => {
      if (!h.signedIn) throw new AccessError('unauthenticated')
      return { id: 'u1' }
    },
  }
})

const { GET } = await import('./route')

describe('/api/health', () => {
  beforeEach(() => {
    h.signedIn = true
    h.captured.length = 0
    h.readings.opsAppConnections = 3
  })

  it('refuses without a session', async () => {
    h.signedIn = false
    expect((await GET()).status).toBe(401)
  })

  it('reports the database, the mailboxes and the send queue', async () => {
    const body = await (await GET()).json()
    expect(Object.keys(body).sort()).toEqual([
      'aiCallsLastHour',
      'assistant',
      'db',
      'inngestHeartbeatAt',
      'mailLatency',
      'mailboxes',
      'sendQueue',
      'version',
    ])
    expect(body.assistant).toEqual(h.readings.assistant)
    expect(body.mailLatency).toEqual({ p50: 22, p95: 71, count: 200 })
    expect(body.aiCallsLastHour).toBe(14)
    expect(body.db).toEqual({ opsAppConnections: 3, alert: false })
    expect(body.mailboxes[0]).toEqual(h.readings.mailboxes[0])
    expect(body.sendQueue).toEqual({ scheduled: 2, held: 1, waitingForMailbox: 0, unknown: 0 })
    expect(h.captured).toEqual([])
  })

  it('above 12 ops_app connections it alerts, in the body and in Sentry', async () => {
    h.readings.opsAppConnections = 13
    const body = await (await GET()).json()
    expect(body.db.alert).toBe(true)
    expect(h.captured).toEqual(['ops_app connections above the alert line'])
  })
})
