import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { matchParts } from './match'

/**
 * Part matching on the local database (S08-T02): exact normal form, alias, trigram fuzzy, nothing; one query per
 * method for every line together, never one per line.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
const tag = randomUUID()
  .slice(0, 6)
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, 'X')
const ids: string[] = []

describe.skipIf(!DB_URL)('matchParts · local database', () => {
  beforeAll(async () => {
    const a = await opsDb.part.create({
      data: { partNo: `ZQ-${tag}-6316-C3`, partNoNorm: `ZQ${tag}6316C3`, brand: `t${tag}` },
      select: { id: true },
    })
    const b = await opsDb.part.create({
      data: { partNo: `ZQ-${tag}-777`, partNoNorm: `ZQ${tag}777`, brand: `t${tag}` },
      select: { id: true },
    })
    ids.push(a.id, b.id)
    await opsDb.partAlias.create({
      data: { partId: b.id, text: `OLD-${tag}-9`, norm: `OLD${tag}9`, source: 'test' },
    })
  })

  afterAll(async () => {
    await opsDb.part.deleteMany({ where: { id: { in: ids } } })
  })

  it('exact, alias, fuzzy and none, in one pass', async () => {
    const find = vi.spyOn(opsDb.part, 'findMany')
    const raw = vi.spyOn(opsDb, '$queryRaw')
    const m = await matchParts([
      `ZQ-${tag}-6316 C3`,
      `old-${tag}-9`,
      `ZQ${tag}6316C4`,
      'NOTHING-LIKE-IT-42',
      null,
      `ZQ-${tag}-6316-C3`,
    ])
    expect(m.get(`ZQ${tag}6316C3`)).toMatchObject({ method: 'exact', partId: ids[0], score: 1 })
    expect(m.get(`OLD${tag}9`)).toMatchObject({ method: 'alias', partId: ids[1] })
    const fuzzy = m.get(`ZQ${tag}6316C4`)!
    expect(fuzzy.method).toBe('fuzzy')
    expect(fuzzy.partId).toBe(ids[0])
    expect(fuzzy.score).toBeGreaterThan(0.6)
    expect(m.get('NOTHINGLIKEIT42')).toMatchObject({ method: 'none', partId: null })
    // One read per method for all six lines: parts once, catalogue and trigram once each.
    expect(find).toHaveBeenCalledTimes(1)
    expect(raw).toHaveBeenCalledTimes(2)
    find.mockRestore()
    raw.mockRestore()
  })

  it('nothing to match makes no query', async () => {
    const find = vi.spyOn(opsDb.part, 'findMany')
    expect((await matchParts([null, '', ' - '])).size).toBe(0)
    expect(find).not.toHaveBeenCalled()
    find.mockRestore()
  })
})
