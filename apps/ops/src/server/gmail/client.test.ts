import { beforeEach, describe, expect, it } from 'vitest'
import { createGmailClient, GMAIL_ALLOWLIST, type GmailApi } from './client'
import { GmailPolicyError, HistoryTooOldError, MailboxUnavailableError } from './errors'
import { bucketFor, resetBuckets } from './quota'
import { FakeGmail } from './testing/fake-gmail'

const INDUS = 'Label_9'

function setup(budget: 'live' | 'backfill' | 'send' = 'live') {
  const fake = new FakeGmail('purchase@example.test')
  const sleeps: number[] = []
  const client = createGmailClient({
    mailboxId: 'mbx-1',
    budget,
    accessToken: async () => 'token',
    indusLabelIds: async () => new Set([INDUS]),
    transport: () => fake,
    sleep: async (ms) => {
      sleeps.push(ms)
    },
  })
  return { fake, client, sleeps }
}

function keysOf(api: GmailApi): string[] {
  const out: string[] = []
  const walk = (o: object, prefix: string) => {
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'function') out.push(prefix + k)
      else if (v && typeof v === 'object') walk(v, `${prefix}${k}.`)
    }
  }
  walk(api, '')
  return out.sort()
}

describe('Gmail client', () => {
  beforeEach(() => resetBuckets())

  it('exposes exactly the allow-listed methods', () => {
    expect(keysOf(setup().client)).toEqual([...GMAIL_ALLOWLIST].sort())
  })

  it('refuses a system label before any network call', async () => {
    const { client, fake } = setup()
    const id = fake.deliver({ from: 'a@example.test', to: ['b@example.test'], subject: 'Hello' })
    for (const label of ['INBOX', 'UNREAD', 'SPAM', 'CATEGORY_PROMOTIONS']) {
      await expect(client.messages.modify({ id, removeLabelIds: [label] })).rejects.toBeInstanceOf(
        GmailPolicyError
      )
      await expect(client.messages.modify({ id, addLabelIds: [label] })).rejects.toBeInstanceOf(
        GmailPolicyError
      )
    }
    expect(fake.calls).not.toContain('messages.modify')
  })

  it('refuses a label that is not one of the mailbox Indus labels, and applies one that is', async () => {
    const { client, fake } = setup()
    const id = fake.deliver({ from: 'a@example.test', to: ['b@example.test'], subject: 'Hello' })
    await expect(client.messages.modify({ id, addLabelIds: ['Label_1'] })).rejects.toBeInstanceOf(
      GmailPolicyError
    )
    await client.messages.modify({ id, addLabelIds: [INDUS] })
    expect(fake.message(id)?.labelIds).toContain(INDUS)
  })

  it('creates only Indus/* labels', async () => {
    const { client } = setup()
    await expect(client.labels.create({ name: 'Receipts' })).rejects.toBeInstanceOf(
      GmailPolicyError
    )
    expect((await client.labels.create({ name: 'Indus/PO' })).name).toBe('Indus/PO')
  })

  it('charges each call to the bucket before it is made', async () => {
    const { client, fake } = setup()
    const id = fake.deliver({ from: 'a@example.test', to: ['b@example.test'], subject: 'Hi' })
    const before = bucketFor('mbx-1', 'live').available()
    await client.messages.get({ id, format: 'full' })
    expect(before - bucketFor('mbx-1', 'live').available()).toBeGreaterThanOrEqual(59)
  })

  it('retries a 429 read with backoff and gives up after six attempts', async () => {
    const { client, fake, sleeps } = setup()
    fake.failNext('getProfile', { status: 429 }).failNext('getProfile', { status: 503 })
    expect((await client.getProfile()).emailAddress).toBe('purchase@example.test')
    expect(sleeps).toHaveLength(2)
    for (let i = 0; i < 6; i += 1) fake.failNext('labels.list', { status: 500 })
    await expect(client.labels.list()).rejects.toMatchObject({ status: 500 })
    expect(fake.calls.filter((c) => c === 'labels.list')).toHaveLength(6)
  })

  it('does not retry a 403 that is not a rate limit, and turns 401 into MailboxUnavailableError', async () => {
    const { client, fake } = setup()
    fake.failNext('getProfile', { status: 403, errors: [{ reason: 'forbidden' }] })
    await expect(client.getProfile()).rejects.toMatchObject({ status: 403 })
    expect(fake.calls.filter((c) => c === 'getProfile')).toHaveLength(1)
    fake.failNext('getProfile', { status: 401 })
    await expect(client.getProfile()).rejects.toBeInstanceOf(MailboxUnavailableError)
  })

  it('never retries a send, whatever the error', async () => {
    const { client, fake } = setup('send')
    fake.failNext('messages.send', { status: 503 })
    await expect(
      client.messages.send({ raw: Buffer.from('Subject: x\r\n\r\nbody').toString('base64url') })
    ).rejects.toMatchObject({
      status: 503,
    })
    expect(fake.calls.filter((c) => c === 'messages.send')).toHaveLength(1)
  })

  it('turns a history 404 into HistoryTooOldError', async () => {
    const { client, fake } = setup()
    fake.historyFloor = 5000
    await expect(client.history.list({ startHistoryId: '10' })).rejects.toBeInstanceOf(
      HistoryTooOldError
    )
  })
})
