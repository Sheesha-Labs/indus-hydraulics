import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, PrismaClient } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * C5 on the local database (S08-T06): while the website admin still issues ENQ-YYYY-NNNN, Ops reads its highest
 * number through ops.legacy_enquiry_max, seeds 1,000 above it, skips (and voids) any ref the admin used, seeds a
 * new year by itself, and the nightly check warns within 200 and flags the sequence once the admin reaches the
 * block. A far year (2099) keeps the test away from real counters; public.enquiries is written as postgres.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const { proposeEnquirySeed, ensureEnquiryYear, checkEnquiryContinuity, legacyEnquiryMax } =
  await import('./enquiry-seed')
const { allocateEnquiryRef } = await import('../enquiry/from-batch')

const YEAR = 2099
const SCOPE = String(YEAR)
const SUPER = 'postgresql://postgres:postgres@localhost:54329/ops_s04'

describe.skipIf(!DB_URL)('ENQ numbering beside the website admin · local database', () => {
  const su = new PrismaClient({ datasourceUrl: SUPER })
  const legacy = (n: number) => `ENQ-${YEAR}-${String(n).padStart(4, '0')}`

  async function clean() {
    await su.$executeRawUnsafe(`DELETE FROM public.enquiries WHERE code LIKE 'ENQ-${YEAR}-%'`)
    await su.$executeRawUnsafe(
      `DELETE FROM ops.issued_number WHERE "sequenceKey" = 'enquiry' AND scope = '${SCOPE}'`
    )
    await su.$executeRawUnsafe(
      `DELETE FROM ops.number_counter WHERE "sequenceKey" = 'enquiry' AND scope = '${SCOPE}'`
    )
    await su.$executeRawUnsafe(
      `DELETE FROM ops.notification WHERE "dedupeKey" LIKE 'numbering:enquiry:${YEAR}%' OR "dedupeKey" LIKE 'numbering:enquiry:seed:${YEAR}%'`
    )
  }

  beforeAll(async () => {
    await clean()
    await su.$executeRawUnsafe(
      `INSERT INTO public.enquiries (id, code) VALUES (gen_random_uuid(), '${legacy(433)}'), (gen_random_uuid(), '${legacy(17)}'), (gen_random_uuid(), 'ENQ-2098-9999')`
    )
  })

  afterAll(async () => {
    await clean()
    await su.$executeRawUnsafe(`DELETE FROM public.enquiries WHERE code = 'ENQ-2098-9999'`)
    await su.$executeRawUnsafe(
      `UPDATE ops.number_sequence SET "outOfStepAt" = NULL WHERE key = 'enquiry'`
    )
    await su.$disconnect()
    await opsDb.$disconnect()
  })

  it('reads the admin’s highest number for the year only, and proposes 1,000 above it', async () => {
    expect(await legacyEnquiryMax(YEAR)).toBe(433)
    const p = await proposeEnquirySeed(YEAR)
    expect(p).toMatchObject({
      legacyMax: 433,
      opsNext: null,
      proposedNext: 1433,
      proposedRef: `ENQ-${YEAR}-1433`,
    })
    expect(p.evidence).toMatchObject({
      source: 'ops.legacy_enquiry_max',
      legacyMaxRef: legacy(433),
      gap: 1000,
    })
  })

  it('a year with no counter seeds itself on its first allocation', async () => {
    const out = await opsDb.$transaction((tx) => ensureEnquiryYear(tx, YEAR))
    expect(out).toEqual({ seeded: true, ref: `ENQ-${YEAR}-1433`, legacyMax: 433 })
    expect(await opsDb.$transaction((tx) => ensureEnquiryYear(tx, YEAR))).toEqual({ seeded: false })
  })

  it('allocation skips a ref the admin already used and records it void', async () => {
    await su.$executeRawUnsafe(
      `INSERT INTO public.enquiries (id, code) VALUES (gen_random_uuid(), '${legacy(1433)}')`
    )
    const id = '01990000-0000-7000-8000-00000000c501'
    const now = new Date(`${YEAR}-03-01T08:00:00Z`)
    const got = await opsDb.$transaction(async (tx) => {
      const [row] = await tx.$queryRaw<Array<{ formatted: string }>>`
        SELECT formatted FROM ops.allocate_number('enquiry', ${SCOPE}, 'enquiry'::ops."RecordType", ${id}::uuid)`
      return row!.formatted
    })
    expect(got).toBe(legacy(1434))
    const voided = await su.$queryRawUnsafe<Array<{ status: string }>>(
      `SELECT status::text FROM ops.issued_number WHERE "sequenceKey" = 'enquiry' AND formatted = '${legacy(1433)}'`
    )
    expect(voided).toEqual([{ status: 'void' }])
    // allocateEnquiryRef goes through the same function and reports no seed for a year already started.
    const next = await opsDb.$transaction((tx) =>
      allocateEnquiryRef(tx, '01990000-0000-7000-8000-00000000c502', now)
    )
    expect(next).toEqual({ ref: legacy(1435), yearSeeded: null })
  })

  it('the nightly check: ok, then approaching within 200, then out of step', async () => {
    await su.$executeRawUnsafe(`DELETE FROM public.enquiries WHERE code = '${legacy(1433)}'`)
    expect((await checkEnquiryContinuity(YEAR)).status).toBe('ok')
    await su.$executeRawUnsafe(
      `INSERT INTO public.enquiries (id, code) VALUES (gen_random_uuid(), '${legacy(1300)}')`
    )
    expect((await checkEnquiryContinuity(YEAR)).status).toBe('approaching')
    const n = await su.$queryRawUnsafe<Array<{ title: string }>>(
      `SELECT title FROM ops.notification WHERE "dedupeKey" = 'numbering:enquiry:${YEAR}' LIMIT 1`
    )
    expect(n[0]?.title).toBe('The website admin is approaching the Operations ENQ block')
    await su.$executeRawUnsafe(
      `INSERT INTO public.enquiries (id, code) VALUES (gen_random_uuid(), '${legacy(1436)}')`
    )
    expect((await checkEnquiryContinuity(YEAR)).status).toBe('out_of_step')
    const seq = await opsDb.numberSequence.findUniqueOrThrow({
      where: { key: 'enquiry' },
      select: { outOfStepAt: true },
    })
    expect(seq.outOfStepAt).not.toBeNull()
  })
})
