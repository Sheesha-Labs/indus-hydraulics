import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * The Unsure pile (S05-T06, board 94): nothing is written until a choice; the choice is the person's
 * (decidedBy); a company domain is learned but a free mail domain never is; Undo puts everything back and the
 * card returns; "New enquiry" waits as Needs you until intake is live (C5).
 */
const DB_URL = localDatabaseUrl()
const TAG = 'unsure'

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

describe.skipIf(!DB_URL)('Unsure pile · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let r: typeof import('./resolve-unsure')
  let data: typeof import('../../data/mail')
  let world: QueueWorld
  let threadId: string
  let companyId: string
  const domain = `supplier-${randomUUID().slice(0, 6)}.example`
  const actor = { id: '', initials: 'AB' }

  async function unsureMail(
    from: string,
    key = 'classify_mail',
    options = [
      { key: 'supplier_price_list', label: 'Supplier price list' },
      { key: 'client_enquiry', label: 'New enquiry' },
    ]
  ) {
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.purchaseId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        direction: 'inbound',
        fromAddress: from,
        fromName: 'Sales Team',
        toAddresses: ['purchase@example.test'],
        ccAddresses: [],
        subject: 'Price list Q4',
        bodyText: 'Our updated price list.',
        sentAt: new Date(),
        labelsApplied: [],
        origin: 'live',
        classification: 'unclassified',
        confidence: 'unsure',
        handledState: 'unsure',
        unsureReason: 'Supplier price list or new enquiry?',
      },
      select: { id: true },
    })
    const a = await db.assistantAction.create({
      data: {
        ref: `A-UNS-${randomUUID().slice(0, 8)}`,
        actionKey: key,
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: m.id,
        headline: 'Unsure what this is',
        reasons: [],
        state: 'proposed',
        surface: 'mail_unsure',
        unsureAbout: 'Supplier price list or new enquiry?',
        options: options.map((o) => ({ ...o, consequence: '' })),
      },
      select: { id: true },
    })
    return { messageId: m.id, actionId: a.id }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    r = await import('./resolve-unsure')
    data = await import('../../data/mail')
    world = await buildQueueWorld(db, TAG)
    actor.id = world.helperId
    threadId = (
      await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}-${randomUUID()}` },
        select: { id: true },
      })
    ).id
    companyId = (
      await db.company.create({
        data: { name: `Example Bearings ${domain}`, isSupplier: true, domains: [] },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.company.deleteMany({ where: { id: companyId } })
    await db.$disconnect()
  })

  it('lists the item with its best guess first and the extras; nothing is written before a choice', async () => {
    const { messageId } = await unsureMail(`sales@${domain}`)
    const card = (await data.listUnsure()).find((c) => c.messageId === messageId)!
    expect(card.options.map((o) => o.key)).toEqual(['supplier_price_list', 'client_enquiry'])
    expect(card.extras.map((o) => o.key)).toEqual(['not_business', 'new_enquiry'])
    expect(
      (await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })).classification
    ).toBe('unclassified')
  })

  it('a choice is filed as the person’s, learns a company domain, and Undo returns the card', async () => {
    const { messageId, actionId } = await unsureMail(`sales@${domain}`)
    const out = await db.$transaction((tx) =>
      r.resolveUnsure(tx, { messageId, actionId, option: 'supplier_price_list', companyId, actor })
    )
    expect(out.filedAs).toBe('Supplier price list')
    expect(out.learned).toBe(`Next time, mail from @${domain} is a supplier.`)
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })
    expect(m).toMatchObject({ classification: 'supplier_price_list', confidence: 'sure' })
    const a = await db.assistantAction.findUniqueOrThrow({ where: { id: actionId } })
    expect(a).toMatchObject({
      state: 'done',
      decidedById: world.helperId,
      chosenOption: 'supplier_price_list',
    })
    const signal = await db.preferenceSignal.findFirstOrThrow({ where: { actionId } })
    expect(signal).toMatchObject({ kind: 'unsure_choice' })
    expect(signal.payload).toMatchObject({ senderDomain: domain, chosen: 'supplier_price_list' })
    expect((await db.company.findUniqueOrThrow({ where: { id: companyId } })).domains).toEqual([
      domain,
    ])

    const undone = await db.$transaction((tx) => r.undoResolution(tx, { actionId, actor }))
    const back = await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })
    expect(back).toMatchObject({
      classification: 'unclassified',
      confidence: 'unsure',
      handledState: 'unsure',
    })
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: actionId } })).state).toBe(
      'undone'
    )
    expect(
      (await db.assistantAction.findUniqueOrThrow({ where: { id: undone.newActionId } })).state
    ).toBe('proposed')
    expect((await db.company.findUniqueOrThrow({ where: { id: companyId } })).domains).toEqual([])
    expect((await data.listUnsure()).some((c) => c.actionId === undone.newActionId)).toBe(true)
    await expect(
      db.$transaction((tx) => r.undoResolution(tx, { actionId, actor }))
    ).rejects.toThrow(/Too late|Nothing/)
  })

  it('never learns a free mail domain', async () => {
    const { messageId, actionId } = await unsureMail('someone@gmail.com')
    const out = await db.$transaction((tx) =>
      r.resolveUnsure(tx, { messageId, actionId, option: 'supplier_price_list', companyId, actor })
    )
    expect(out.learned).toBeNull()
    expect(
      (await db.company.findUniqueOrThrow({ where: { id: companyId } })).domains
    ).not.toContain('gmail.com')
  })

  it('“New enquiry” waits as Needs you; a decided item cannot be decided twice', async () => {
    const { messageId, actionId } = await unsureMail(`buyer@${domain}`)
    await db.$transaction((tx) =>
      r.resolveUnsure(tx, { messageId, actionId, option: 'new_enquiry', actor })
    )
    expect(await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })).toMatchObject({
      classification: 'client_enquiry',
      handledState: 'needs_you',
    })
    await expect(
      db.$transaction((tx) =>
        r.resolveUnsure(tx, { messageId, actionId, option: 'not_business', actor })
      )
    ).rejects.toThrow(/already decided/)
  })

  it('a link choice links the record and closes the link item', async () => {
    const recordId = randomUUID()
    const { messageId, actionId } = await unsureMail(`sales@${domain}`, 'link_mail', [
      { key: `company:${companyId}`, label: 'Example Bearings' },
      { key: `enquiry:${recordId}`, label: 'ENQ' },
    ])
    const out = await db.$transaction((tx) =>
      r.resolveUnsure(tx, { messageId, actionId, option: `company:${companyId}`, actor })
    )
    expect(out.filedAs).toBe('Example Bearings')
    expect(await db.mailLink.findFirstOrThrow({ where: { messageId } })).toMatchObject({
      subjectType: 'company',
      subjectId: companyId,
      linkedBy: 'user',
    })
  })
})
