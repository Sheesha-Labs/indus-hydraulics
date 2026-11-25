import 'server-only'
import {
  enquiryContinuity,
  enquiryRefOf,
  enquirySeedNext,
  type ContinuityStatus,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { TX_OPTIONS } from '../../lib/tx-options'
import { raiseNotification } from '../notify/raise'

/**
 * ENQ numbering while the website admin still runs (S08-T06, C5). The year's Ops series starts 1,000 above the
 * admin's highest number for that year (read through ops.legacy_enquiry_max, a SECURITY DEFINER function — the
 * only read of public data). The Owner seeds the current year from Settings › Numbering; a new year (1 January)
 * seeds itself on its first allocation by the same rule and tells the Owner. allocate_number also skips any ref
 * the admin already used.
 */
type Db = Pick<typeof opsDb, '$queryRaw' | 'issuedNumber' | 'numberCounter' | 'numberSequence'>

export interface EnquirySeedProposal {
  year: number
  legacyMax: number
  opsMaxIssued: number | null
  /** The counter for this year, when it exists. */
  opsNext: number | null
  proposedNext: number
  proposedRef: string
  /** ops.numbering.continuity found the website admin inside the Operations block. */
  outOfStep: boolean
  evidence: Record<string, string | number | null>
}

export async function legacyEnquiryMax(
  year: number,
  db: Pick<Db, '$queryRaw'> = opsDb
): Promise<number> {
  const [row] = await db.$queryRaw<
    Array<{ n: number }>
  >`SELECT ops.legacy_enquiry_max(${year}::int) AS n`
  return Number(row?.n ?? 0)
}

export async function proposeEnquirySeed(
  year: number,
  db: Db = opsDb
): Promise<EnquirySeedProposal> {
  const scope = String(year)
  const [legacyMax, issued, counter, seq] = await Promise.all([
    legacyEnquiryMax(year, db),
    db.issuedNumber.aggregate({
      where: { sequenceKey: 'enquiry', scope, status: { not: 'void' } },
      _max: { value: true },
    }),
    db.numberCounter.findUnique({
      where: { sequenceKey_scope: { sequenceKey: 'enquiry', scope } },
      select: { nextValue: true },
    }),
    db.numberSequence.findUnique({ where: { key: 'enquiry' }, select: { outOfStepAt: true } }),
  ])
  const opsMaxIssued = issued._max.value === null ? null : Number(issued._max.value)
  const proposedNext = enquirySeedNext(legacyMax, opsMaxIssued)
  return {
    year,
    legacyMax,
    opsMaxIssued,
    opsNext: counter ? Number(counter.nextValue) : null,
    proposedNext,
    proposedRef: enquiryRefOf(year, proposedNext),
    outOfStep: !!seq?.outOfStepAt,
    evidence: {
      source: 'ops.legacy_enquiry_max',
      legacyMax,
      legacyMaxRef: legacyMax ? enquiryRefOf(year, legacyMax) : null,
      opsMaxIssued,
      gap: 1000,
      at: new Date().toISOString(),
    },
  }
}

/** Owner only (the caller checks): sets the year's next ENQ value with its evidence. */
export async function seedEnquirySequence(
  owner: { id: string },
  year: number,
  next: number
): Promise<{ ref: string }> {
  const p = await proposeEnquirySeed(year)
  if (next < p.legacyMax + 1)
    throw new SafeError(
      `The website admin has used up to ${enquiryRefOf(year, p.legacyMax)}: seed above it.`
    )
  try {
    await opsDb.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT ops.seed_number_sequence('enquiry', ${next}::bigint, ${JSON.stringify(
        {
          ...p.evidence,
          chosenNext: next,
          by: 'owner',
        }
      )}::jsonb, ${String(year)}, ${owner.id}::uuid)`
    }, TX_OPTIONS)
  } catch (e) {
    const m = (e as Error).message
    if (/already issued up to/.test(m))
      throw new SafeError('Numbers above that are already issued: choose a higher one.')
    throw e
  }
  return { ref: enquiryRefOf(year, next) }
}

/**
 * Called inside the creating transaction before allocate_number: a year scope with no counter yet (1 January,
 * or a first enquiry of the year) is seeded at legacy max + 1000 with evidence, and the Owner is told after.
 * Returns the seed it made, for the notification the caller raises once the transaction commits.
 */
export async function ensureEnquiryYear(
  tx: Prisma.TransactionClient,
  year: number
): Promise<{ seeded: false } | { seeded: true; ref: string; legacyMax: number }> {
  const scope = String(year)
  const counter = await tx.numberCounter.findUnique({
    where: { sequenceKey_scope: { sequenceKey: 'enquiry', scope } },
    select: { nextValue: true },
  })
  if (counter) return { seeded: false }
  const seq = await tx.numberSequence.findUnique({
    where: { key: 'enquiry' },
    select: { seededAt: true },
  })
  // Never seeded at all: the Owner seeds the first year from Settings › Numbering.
  if (!seq?.seededAt) return { seeded: false }
  const p = await proposeEnquirySeed(year, tx)
  await tx.$executeRaw`SELECT ops.seed_number_sequence('enquiry', ${p.proposedNext}::bigint, ${JSON.stringify(
    {
      ...p.evidence,
      by: 'new_year',
    }
  )}::jsonb, ${scope}, NULL)`
  return { seeded: true, ref: p.proposedRef, legacyMax: p.legacyMax }
}

export async function notifyYearSeeded(s: { ref: string; legacyMax: number }): Promise<void> {
  await raiseNotification({
    event: 'other',
    severity: 'info',
    title: `New year: enquiry numbers start at ${s.ref}`,
    body: `The website admin's highest is ${s.legacyMax || 'none yet'}; Operations starts 1,000 above it.`,
    dedupeKey: `numbering:enquiry:seed:${s.ref.slice(4, 8)}`,
    actionUrl: '/settings/numbering',
  })
}

export interface ContinuityResult {
  year: number
  legacyMax: number
  opsNext: number | null
  status: ContinuityStatus | 'unseeded'
}

/**
 * The nightly check (ops.numbering.continuity): read-only, except the notification and the sequence's
 * out-of-step flag. One checker per sequence key, so S11 adds its own sources beside this one.
 */
export async function checkEnquiryContinuity(year: number): Promise<ContinuityResult> {
  const p = await proposeEnquirySeed(year)
  if (p.opsNext === null) return { year, legacyMax: p.legacyMax, opsNext: null, status: 'unseeded' }
  const status = enquiryContinuity(p.legacyMax, p.opsNext)
  if (status !== 'ok')
    await raiseNotification({
      event: 'other',
      severity: status === 'out_of_step' ? 'critical' : 'warning',
      title:
        status === 'out_of_step'
          ? `The website admin has reached the Operations ENQ block (${enquiryRefOf(year, p.legacyMax)})`
          : 'The website admin is approaching the Operations ENQ block',
      body: `Website admin at ${enquiryRefOf(year, p.legacyMax)}; Operations next is ${enquiryRefOf(year, p.opsNext)}.`,
      dedupeKey: `numbering:enquiry:${year}`,
      actionUrl: '/settings/numbering',
    })
  await opsDb.numberSequence.update({
    where: { key: 'enquiry' },
    data: { outOfStepAt: status === 'out_of_step' ? new Date() : null },
  })
  return { year, legacyMax: p.legacyMax, opsNext: p.opsNext, status }
}

export const CONTINUITY_CHECKERS: Record<string, (year: number) => Promise<ContinuityResult>> = {
  enquiry: checkEnquiryContinuity,
}

/** The ENQ year today, in Dubai. */
export function currentEnquiryYear(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(now)
  )
}
