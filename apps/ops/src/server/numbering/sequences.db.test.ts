import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import type { GmailApi } from '../gmail/client'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * Sequences on the local database (S11-T08): seeding is the Owner's, with evidence, above everything seen, and
 * never INDUS/Q here; Sent mail is read with the allow-listed methods into observations; the continuity check is
 * clear when the next number is above everything seen, out of step (with a notification) when an outside number
 * reached it, and "check failed" when Gmail could not be read; a pattern that names a counterparty is refused.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const KEY = 'zz_test_seq'
const TAG = `s11n${Date.now().toString(36)}`

/** A fake Gmail whose Sent mail holds the given subjects. */
function fakeGmail(subjects: string[], fail = false): (id: string) => GmailApi {
  return () =>
    ({
      messages: {
        list: async () => {
          if (fail) throw new Error('503')
          return { messages: subjects.map((_, i) => ({ id: `m${i}` })) }
        },
        get: async ({ id }: { id: string }) => ({
          id,
          internalDate: String(Date.now()),
          snippet: '',
          payload: { headers: [{ name: 'Subject', value: subjects[Number(id.slice(1))] }] },
        }),
      },
    }) as unknown as GmailApi
}

describe.skipIf(!DB_URL)('number sequences · local database', () => {
  let s: typeof import('./sequences')
  let world: QueueWorld
  let ownerId = ''
  const owner = () => ({ id: ownerId, role: 'owner' })

  beforeAll(async () => {
    s = await import('./sequences')
    world = await buildQueueWorld(opsDb, TAG)
    ownerId = world.ownerId
    await opsDb.numberSequence.upsert({
      where: { key: KEY },
      update: { pattern: 'ZS/{n}', seededAt: null, lastCheckedAt: null },
      create: { key: KEY, label: 'Test series', pattern: 'ZS/{n}', scopeKind: 'global' },
    })
    await opsDb.externalNumberObservation.deleteMany({ where: { sequenceKey: KEY } }).catch(() => undefined)
  })

  afterAll(async () => {
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  it('seeding: Owner only, never INDUS/Q, above everything already seen', async () => {
    await expect(s.seedSequence(KEY, 10, { source: 'test' }, { id: ownerId, role: 'helper' })).rejects.toThrow(
      /Only the Owner/
    )
    await expect(s.seedSequence('quotation', 30000, { source: 'test' }, owner())).rejects.toThrow(
      s.QUOTATION_REFUSAL
    )
    const floor = Number(
      (await opsDb.issuedNumber.aggregate({ where: { sequenceKey: KEY }, _max: { value: true } }))._max
        .value ?? 0n
    )
    const base = floor + 100
    await opsDb.externalNumberObservation.createMany({
      data: [{ sequenceKey: KEY, formatted: `ZS/${base}`, value: BigInt(base), source: 'manual' }],
      skipDuplicates: true,
    })
    await expect(s.seedSequence(KEY, base, { source: 'test' }, owner())).rejects.toThrow(/already been used/)
    expect(await s.seedSequence(KEY, base + 1, { source: 'test' }, owner())).toEqual({
      formatted: `ZS/${base + 1}`,
    })
  })

  it('Sent mail becomes observations; clear while everything seen is below the next number', async () => {
    const seq = await opsDb.numberSequence.findUniqueOrThrow({ where: { key: KEY } })
    void seq
    const { detail } = await s.checkContinuity(KEY)
    const next = detail.nextValue!
    const r = await s.runContinuity(KEY, {
      gmail: fakeGmail([`Quotation ZS/${next - 1} for your RFQ`, 'Re: nothing numbered']),
    })
    expect(r.status).toBe('clear')
    expect(r.gmailUnits).toBeGreaterThan(0)
    const obs = await opsDb.externalNumberObservation.findFirst({
      where: { sequenceKey: KEY, source: 'gmail_sent', formatted: `ZS/${next - 1}` },
    })
    expect(obs).not.toBeNull()
    expect(
      (await opsDb.numberSequence.findUniqueOrThrow({ where: { key: KEY } })).continuityStatus
    ).toBe('clear')
  })

  it('out of step when Sent mail holds the next number; a notification is raised once', async () => {
    const { detail } = await s.checkContinuity(KEY)
    const next = detail.nextValue!
    // A number issued by hand outside Ops, beyond the next one. allocate_number would now skip it.
    const r = await s.runContinuity(KEY, { gmail: fakeGmail([`Quotation ZS/${next + 3}`]) })
    expect(r.status).toBe('out_of_step')
    const row = await opsDb.numberSequence.findUniqueOrThrow({ where: { key: KEY } })
    const d = row.continuityDetail as { perSource: { source: string; clashesWithNext: boolean; maxFormatted: string }[] }
    expect(d.perSource.find((x) => x.source === 'gmail_sent')).toMatchObject({
      clashesWithNext: true,
      maxFormatted: `ZS/${next + 3}`,
    })
    expect(
      await opsDb.notification.count({ where: { dedupeKey: `numbering:${KEY}:out_of_step`, resolvedAt: null } })
    ).toBeGreaterThan(0)
    // Seeding above it clears it.
    await s.seedSequence(KEY, next + 4, { source: 'test' }, owner())
    expect((await s.runContinuity(KEY, { gmail: fakeGmail([]) })).status).toBe('clear')
  })

  it('a Gmail failure is "check failed", never "clear"', async () => {
    expect((await s.runContinuity(KEY, { gmail: fakeGmail([], true) })).status).toBe('check_failed')
  })

  it('patterns: a counterparty token is refused; a valid change is recorded; Owner only', async () => {
    await expect(s.setPattern(KEY, 'ZS/{supplier}{n}', owner())).rejects.toThrow(/counterparty/)
    await expect(s.setPattern(KEY, 'ZS/{n}', { id: ownerId, role: 'helper' })).rejects.toThrow(/Only the Owner/)
    await s.setPattern(KEY, 'ZS-{n}', owner())
    expect((await opsDb.numberSequence.findUniqueOrThrow({ where: { key: KEY } })).pattern).toBe('ZS-{n}')
    await s.setPattern(KEY, 'ZS/{n}', owner())
  })
})
