import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * Board 05 on the local database (S09-T03): the board-shaped seed (12 lines, 5 suppliers, quotes in USD at a
 * locked 3.6725) read for the Owner and for a Helper without canSeeMargins; the C38 snapshot on the selected
 * quotes; the facts editor's version check.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../server/settings/get', () => ({
  getSetting: async (key: string) =>
    key === 'pricing.defaults'
      ? { marginPct: 18, floorPct: 12, hardMinPct: 5 }
      : key === 'landed.defaults'
        ? { freightPct: 4, insurancePct: 0.5, dutyPct: 5, bankPct: 1 }
        : {},
}))

const { getEnquiryOverview, activityText } = await import('./enquiry-overview')
const { seedBoard05 } = await import('../server/enquiry/testing/overview-seed')
const { updateEnquiryFacts } = await import('../server/enquiry/facts')

const TAG = `s09ov${Date.now()}`
const OWNER = { role: 'owner' as const, canSeeMargins: true }
const HELPER = { role: 'helper' as const, canSeeMargins: false }

describe.skipIf(!DB_URL)('enquiry Overview · local database', () => {
  let ref = ''
  let enquiryId = ''
  let userId = ''

  beforeAll(async () => {
    userId = (await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })).id
    ref = `ENQ-2094-${String(Date.now()).slice(-7)}`
    const s = await seedBoard05(opsDb, {
      tag: TAG,
      ref,
      rfqPrefix: `98${String(Date.now()).slice(-2)}`,
    })
    enquiryId = s.enquiryId
  })

  afterAll(async () => {
    await opsDb.enquiry.update({ where: { id: enquiryId }, data: { closedAt: new Date() } })
    await opsDb.$disconnect()
  })

  it('the line table, coverage, RFQs and the C38 snapshot for the Owner', async () => {
    const o = (await getEnquiryOverview(ref, OWNER))!
    expect(o.lines).toHaveLength(12)
    expect(o.lines[0]).toMatchObject({
      no: 1,
      chip: 'Quoted',
      quotedBy: 2,
      sentTo: ['SAM', 'TES'],
      bestCost: '$1,690 · TES',
    })
    expect(o.lines[5]!.bestCost).toBe('$64 · DEM')
    expect(o.lines[11]).toMatchObject({ chip: 'Awaiting', bestCost: null, sentTo: ['MOC'] })
    expect(o.counts).toEqual({ all: 12, awaiting: 1, multi: 4 })
    expect(o.coverage.quoted).toBe(11)
    expect(o.coverage.total).toBe(12)
    expect(o.coverage.segments.filter((s) => s === 'quoted')).toHaveLength(11)
    expect(o.coverage.segments[11]).toBe('awaiting')
    expect(o.coverage.note).toMatch(/^Line 12 awaiting Mock Instruments Co\. Chase sent \d+ \w+\.$/)
    expect(o.rfqs.map((r) => [r.lines, r.status])).toEqual([
      [5, 'Quoted'],
      [4, 'Quoted'],
      [2, 'Quoted'],
      [3, 'Partial'],
      [2, 'Quoted'],
    ])
    expect(o.estimate).toMatchObject({
      pricedLines: 11,
      unpricedLines: 1,
      landedAed: '482590.74',
      sellAed: '588525.29',
      gpAed: '105934.55',
      marginPct: '18.0',
      currency: 'AED',
    })
    expect(o.masked).toBe(false)
  })

  it('a Helper without canSeeMargins gets no cost and no estimate from the data layer', async () => {
    const o = (await getEnquiryOverview(ref, HELPER))!
    expect(o.masked).toBe(true)
    expect(o.estimate).toBeNull()
    expect(o.lines.every((l) => l.bestCost === null)).toBe(true)
    expect(JSON.stringify(o)).not.toMatch(/1,690|landedAed|sellAed/)
  })

  it('facts: saved with an activity row, refused as a conflict on a stale version', async () => {
    const v0 = (await opsDb.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })).version
    const saved = await opsDb.$transaction((tx) =>
      updateEnquiryFacts(tx, { enquiryId, version: v0, title: 'Turnaround spares', deadline: '2099-10-01' }, { id: userId })
    )
    expect(saved).toEqual({ kind: 'saved', version: v0 + 1, changed: ['title', 'deadline'] })
    const e = await opsDb.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })
    expect(e.title).toBe('Turnaround spares')
    expect(e.deadline?.toISOString()).toBe('2099-10-01T10:00:00.000Z')
    const ev = await opsDb.activityEvent.findFirstOrThrow({
      where: { subjectId: enquiryId, field: 'title' },
      orderBy: { at: 'desc' },
    })
    expect(ev).toMatchObject({ before: 'Plant turnaround spares — valves, bearings & instruments', after: 'Turnaround spares' })
    const stale = await opsDb.$transaction((tx) =>
      updateEnquiryFacts(tx, { enquiryId, version: v0, title: 'Mine' }, { id: userId })
    )
    expect(stale).toMatchObject({ kind: 'conflict', version: v0 + 1, theirs: { title: 'Turnaround spares' } })
    const kept = await opsDb.$transaction((tx) =>
      updateEnquiryFacts(tx, { enquiryId, version: v0 + 1, title: 'Mine' }, { id: userId })
    )
    expect(kept).toMatchObject({ kind: 'saved', changed: ['title'] })
    await expect(
      opsDb.$transaction((tx) => updateEnquiryFacts(tx, { enquiryId, version: v0 + 2, title: '  ' }, { id: userId }))
    ).rejects.toThrow('Give the enquiry a title.')
    const o = (await getEnquiryOverview(ref, OWNER))!
    expect(o.activity.some((a) => a.text === 'Title: Turnaround spares → Mine')).toBe(true)
  })

  it('activity text', () => {
    expect(activityText({ field: 'stage', before: 'new', after: 'sourcing', note: null })).toBe('Stage: new → sourcing')
    expect(activityText({ field: null, before: undefined, after: undefined, note: 'Moved on the pipeline' })).toBe(
      'Moved on the pipeline'
    )
    expect(activityText({ field: 'clientRef', before: null, after: 'X', note: null })).toBe('Client ref: — → X')
    expect(activityText({ field: 'foo', before: undefined, after: undefined, note: null })).toBe('foo')
  })
})
