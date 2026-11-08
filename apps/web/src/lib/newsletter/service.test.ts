import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NEWSLETTER_CONSENT, NEWSLETTER_FROM_EMAIL } from '@indus/domain'
import { hashNewsletterToken, newsletterEmailHash } from './tokens'

// The service against a mocked Prisma client and mailer: which writes happen,
// which emails go out, and — as much — which do not.

const dbMock = {
  newsletterSuppression: { findUnique: vi.fn(), createMany: vi.fn() },
  newsletterSubscriber: {
    count: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  sentEmail: { updateMany: vi.fn() },
  $transaction: vi.fn(),
}
const sendEmail = vi.fn()

vi.mock('@indus/db', () => ({ db: dbMock }))
vi.mock('@indus/email', async () => {
  const actual = await vi.importActual<typeof import('@indus/email')>('@indus/email')
  return { ...actual, sendEmail }
})
vi.mock('../email-branding', () => ({
  loadEmailBranding: async () => ({
    legalName: 'Indus Hydraulic Power Trading LLC',
    registeredAddressLines: ['Dubai'],
    replyTo: 'sales@indushydraulics.me',
  }),
}))

const { confirmSubscription, recordEmailEvent, requestSubscription, unsubscribeByToken, lookupConfirmation } =
  await import('./service')

const NOW = new Date('2026-11-08T12:00:00Z')
const TOKEN = 'a'.repeat(48)
const signup = { email: 'buyer@plant.ae', source: 'homepage_footer' as const, ipHash: 'ip1', userAgent: 'UA', now: NOW }

beforeEach(() => {
  vi.clearAllMocks()
  dbMock.newsletterSuppression.findUnique.mockResolvedValue(null)
  dbMock.newsletterSubscriber.count.mockResolvedValue(0)
  dbMock.newsletterSubscriber.findUnique.mockResolvedValue(null)
  dbMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 1 })
  dbMock.newsletterSuppression.createMany.mockResolvedValue({ count: 1 })
  dbMock.sentEmail.updateMany.mockResolvedValue({ count: 1 })
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock))
  sendEmail.mockResolvedValue({ ok: true, sentEmailId: 's1', providerId: 'p1', status: 'sent' })
})

describe('requestSubscription', () => {
  it('writes a pending row with the consent wording and sends a confirmation from the newsletter domain', async () => {
    expect(await requestSubscription(signup)).toBe('sent')

    const { create, update } = dbMock.newsletterSubscriber.upsert.mock.calls[0]![0]
    expect(create).toMatchObject({
      email: 'buyer@plant.ae',
      status: 'pending',
      consentText: NEWSLETTER_CONSENT.text,
      consentVersion: NEWSLETTER_CONSENT.version,
      confirmationSentAt: NOW,
    })
    expect(create.confirmationTokenHash).toMatch(/^[0-9a-f]{64}$/)
    expect(update).toMatchObject({ status: 'pending', unsubscribedAt: null, confirmedAt: null })

    const mail = sendEmail.mock.calls[0]![0]
    expect(mail).toMatchObject({
      kind: 'newsletter_confirmation',
      to: ['buyer@plant.ae'],
      fromEmail: NEWSLETTER_FROM_EMAIL,
      replyTo: 'sales@indushydraulics.me',
    })
    expect(mail.text).toMatch(/\/newsletter\/confirm\/[0-9a-f]{48}/)
    // The emailed token is the one whose hash was stored.
    const token = (mail.text as string).match(/confirm\/([0-9a-f]{48})/)![1]!
    expect(hashNewsletterToken(token)).toBe(create.confirmationTokenHash)
  })

  it('does nothing for an already-confirmed address', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue({ status: 'confirmed', confirmationSentAt: null })
    expect(await requestSubscription(signup)).toBe('already_confirmed')
    expect(dbMock.newsletterSubscriber.upsert).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('sends nothing to a hard-suppressed address, and says so to nobody', async () => {
    for (const reason of ['bounced', 'complained']) {
      dbMock.newsletterSuppression.findUnique.mockResolvedValueOnce({ reason })
      expect(await requestSubscription(signup)).toBe('silent')
    }
    expect(dbMock.newsletterSuppression.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { emailHash: newsletterEmailHash('buyer@plant.ae') } }),
    )
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('lets someone who unsubscribed sign up again (double opt-in still applies)', async () => {
    dbMock.newsletterSuppression.findUnique.mockResolvedValue({ reason: 'unsubscribed' })
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue({ status: 'unsubscribed', confirmationSentAt: null })
    expect(await requestSubscription(signup)).toBe('sent')
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('does not re-send a confirmation inside the cooldown', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue({
      status: 'pending',
      confirmationSentAt: new Date(NOW.getTime() - 60_000),
    })
    expect(await requestSubscription(signup)).toBe('silent')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('refuses a network over the hourly limit before writing anything', async () => {
    dbMock.newsletterSubscriber.count.mockResolvedValueOnce(5)
    expect(await requestSubscription(signup)).toBe('rate_limited')
    expect(dbMock.newsletterSubscriber.upsert).not.toHaveBeenCalled()
  })

  it('reports sent even when the mailer fails — the row exists and the visitor can retry', async () => {
    sendEmail.mockResolvedValue({ ok: false, sentEmailId: 's1', error: 'boom' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await requestSubscription(signup)).toBe('sent')
  })
})

describe('confirmation', () => {
  const pendingRow = {
    id: 'sub1',
    email: 'buyer@plant.ae',
    status: 'pending',
    confirmationSentAt: new Date(NOW.getTime() - 60_000),
    unsubscribeToken: 'b'.repeat(48),
  }

  it('looks the token up by its hash and confirms nothing on lookup', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue(pendingRow)
    expect(await lookupConfirmation(TOKEN, NOW)).toEqual({ status: 'ready', maskedEmail: 'b…@plant.ae' })
    expect(dbMock.newsletterSubscriber.findUnique.mock.calls[0]![0].where).toEqual({
      confirmationTokenHash: hashNewsletterToken(TOKEN),
    })
    expect(dbMock.newsletterSubscriber.updateMany).not.toHaveBeenCalled()
  })

  it('confirms, clears the token and sends the welcome with the PERMANENT unsubscribe token', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue(pendingRow)
    expect((await confirmSubscription(TOKEN, NOW)).status).toBe('confirmed')

    expect(dbMock.newsletterSubscriber.updateMany.mock.calls[0]![0]).toMatchObject({
      where: { id: 'sub1', confirmationTokenHash: hashNewsletterToken(TOKEN), status: 'pending' },
      data: { status: 'confirmed', confirmedAt: NOW, confirmationTokenHash: null },
    })
    const mail = sendEmail.mock.calls[0]![0]
    expect(mail.kind).toBe('newsletter_welcome')
    expect(mail.text).toContain(`/newsletter/unsubscribe/${'b'.repeat(48)}`)
    expect(mail.headers['List-Unsubscribe']).toContain(`token=${'b'.repeat(48)}`)
    expect(mail.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
  })

  it('sends one welcome when two clicks race', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue(pendingRow)
    dbMock.newsletterSubscriber.updateMany.mockResolvedValueOnce({ count: 0 })
    expect((await confirmSubscription(TOKEN, NOW)).status).toBe('not_found')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('expires after 14 days', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue({
      ...pendingRow,
      confirmationSentAt: new Date(NOW.getTime() - 15 * 24 * 3600 * 1000),
    })
    expect((await confirmSubscription(TOKEN, NOW)).status).toBe('expired')
    expect(dbMock.newsletterSubscriber.updateMany).not.toHaveBeenCalled()
  })

  it('never queries for a malformed token', async () => {
    expect((await confirmSubscription("x' or 1=1", NOW)).status).toBe('not_found')
    expect(dbMock.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
  })
})

describe('unsubscribeByToken', () => {
  it('only touches a row still on the list, so repeating it changes nothing', async () => {
    dbMock.newsletterSubscriber.findUnique.mockResolvedValue({ id: 'sub1' })
    expect(await unsubscribeByToken(TOKEN, NOW)).toBe('unsubscribed')
    expect(await unsubscribeByToken(TOKEN, NOW)).toBe('unsubscribed')
    for (const [arg] of dbMock.newsletterSubscriber.updateMany.mock.calls) {
      expect(arg.where).toEqual({ id: 'sub1', status: { in: ['pending', 'confirmed'] } })
      expect(arg.data).toMatchObject({ status: 'unsubscribed' })
    }
  })

  it('reports an unknown token without writing', async () => {
    expect(await unsubscribeByToken(TOKEN, NOW)).toBe('not_found')
    expect(dbMock.newsletterSubscriber.updateMany).not.toHaveBeenCalled()
  })
})

describe('recordEmailEvent', () => {
  const base = { emailId: 're_1', recipients: ['Buyer <Buyer@Plant.ae>'], at: NOW }

  it('stamps delivery once and suppresses nobody', async () => {
    await recordEmailEvent({ ...base, type: 'delivered', permanent: false })
    expect(dbMock.sentEmail.updateMany).toHaveBeenCalledWith({
      where: { providerId: 're_1', deliveredAt: null },
      data: { deliveredAt: NOW },
    })
    expect(dbMock.newsletterSuppression.createMany).not.toHaveBeenCalled()
  })

  it('suppresses and marks bounced on a permanent bounce', async () => {
    await recordEmailEvent({ ...base, type: 'bounced', permanent: true })
    expect(dbMock.newsletterSuppression.createMany).toHaveBeenCalledWith({
      data: [{ emailHash: newsletterEmailHash('buyer@plant.ae'), reason: 'bounced' }],
      skipDuplicates: true,
    })
    expect(dbMock.newsletterSubscriber.updateMany.mock.calls[0]![0]).toMatchObject({
      where: { email: { in: ['buyer@plant.ae'] }, status: { in: ['pending', 'confirmed'] } },
      data: { status: 'bounced', bouncedAt: NOW },
    })
  })

  it('ignores a transient bounce', async () => {
    await recordEmailEvent({ ...base, type: 'bounced', permanent: false })
    expect(dbMock.sentEmail.updateMany).not.toHaveBeenCalled()
    expect(dbMock.newsletterSuppression.createMany).not.toHaveBeenCalled()
    expect(dbMock.newsletterSubscriber.updateMany).not.toHaveBeenCalled()
  })

  it('suppresses as complained BEFORE unsubscribing, so the reason survives the trigger', async () => {
    const order: string[] = []
    dbMock.newsletterSuppression.createMany.mockImplementation(async () => (order.push('suppress'), { count: 1 }))
    dbMock.newsletterSubscriber.updateMany.mockImplementation(async () => (order.push('status'), { count: 1 }))
    await recordEmailEvent({ ...base, type: 'complained', permanent: false })
    expect(order).toEqual(['suppress', 'status'])
    expect(dbMock.newsletterSuppression.createMany.mock.calls[0]![0].data[0].reason).toBe('complained')
    expect(dbMock.newsletterSubscriber.updateMany.mock.calls[0]![0].data).toMatchObject({ status: 'unsubscribed' })
  })
})
