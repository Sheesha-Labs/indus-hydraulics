import 'server-only'
import {
  audienceForKind,
  capWindow,
  countryFromAddress,
  DEFAULT_COUNTRY_WEEKENDS,
  INDUS_COUNTRY,
  INDUS_TZ,
  localDateKey,
  nextSendSlot,
  overCap,
  tzForCountry,
  type HolidayRow,
  type SlotReason,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { getSettings } from '../settings/get'
import { moveOutbound } from './status'

/**
 * The send slot for one queued row (S04-T06, 08-map-integrations §1.10): ops-core's nextSendSlot fed with the
 * row's kind, the recipient's country and zone (company country, then the address's ccTLD, then the UAE), the
 * contact's detected out-of-office, the timing settings, the weekend table and the holiday rows. A sending rule
 * with `respectSendWindow = false` sends at the end of the hold.
 *
 * Over the mailbox's daily cap the row is `held` (holdReason 'cap') and its slot moves to the next 04:00 GST
 * reset, then to the first proper slot after it.
 */
export type SlotDecision = {
  at: string
  reason: SlotReason | 'no_window' | 'cap'
  held: boolean
}

/** The cap day a moment belongs to, as the DATE column value (its 04:00 GST start, as a GST date). */
export function capDay(now: Date, reset = '04:00'): Date {
  return new Date(`${localDateKey(capWindow(now, reset).start, INDUS_TZ)}T00:00:00.000Z`)
}

/** Console sends counted against the mailbox today (the counter resets at 04:00 GST, board 89). */
export function sentInCapDay(
  state: { sentToday: number; sentTodayDate: Date | null } | null,
  now: Date,
  reset = '04:00'
): number {
  if (!state?.sentTodayDate) return 0
  return state.sentTodayDate.getTime() === capDay(now, reset).getTime() ? state.sentToday : 0
}

/** Holiday rows for the countries involved, from ops.holiday and the S00 work_calendar_day table. */
export async function holidaysFor(
  countries: readonly string[],
  from: Date,
  days = 400
): Promise<HolidayRow[]> {
  const start = new Date(from.getTime() - 2 * 86_400_000)
  const end = new Date(from.getTime() + days * 86_400_000)
  const [rows, legacy] = await Promise.all([
    opsDb.holiday.findMany({
      where: { country: { in: [...countries] }, date: { gte: start, lte: end } },
      select: { country: true, date: true, kind: true, hoursStart: true, hoursEnd: true },
    }),
    opsDb.workCalendarDay.findMany({
      where: { country: { in: [...countries] }, date: { gte: start, lte: end } },
    }),
  ])
  const out: HolidayRow[] = rows.map((r) => ({
    country: r.country,
    date: r.date.toISOString().slice(0, 10),
    kind: r.kind as HolidayRow['kind'],
    hoursStart: r.hoursStart,
    hoursEnd: r.hoursEnd,
  }))
  for (const d of legacy) {
    out.push({
      country: d.country,
      date: d.date.toISOString().slice(0, 10),
      kind: d.isHoliday ? 'public_holiday' : 'ramadan',
      hoursStart: d.hoursStart,
      hoursEnd: d.hoursEnd,
    })
  }
  return out
}

const slotSelect = {
  id: true,
  kind: true,
  status: true,
  toAddresses: true,
  companyId: true,
  contactId: true,
  mailbox: {
    select: {
      dailySendCap: true,
      syncState: { select: { sentToday: true, sentTodayDate: true } },
    },
  },
} satisfies Prisma.OutboundEmailSelect

export async function computeSlot(
  outboundId: string,
  deps: { now?: () => Date } = {}
): Promise<SlotDecision> {
  const now = (deps.now ?? (() => new Date()))()
  const row = await opsDb.outboundEmail.findUniqueOrThrow({
    where: { id: outboundId },
    select: slotSelect,
  })
  const [timing, weekends] = await getSettings([
    'send.timing',
    'calendar.country_weekends',
  ] as const)
  const [rule, company, contact] = await Promise.all([
    opsDb.sendingRule.findUnique({
      where: { kind: row.kind },
      select: { respectSendWindow: true },
    }),
    row.companyId
      ? opsDb.company.findUnique({ where: { id: row.companyId }, select: { country: true } })
      : null,
    row.contactId
      ? opsDb.contact.findUnique({
          where: { id: row.contactId },
          select: { outOfOfficeUntil: true },
        })
      : null,
  ])

  const audience = audienceForKind(row.kind)
  const country =
    company?.country?.trim().toUpperCase() ||
    countryFromAddress(row.toAddresses[0] ?? '') ||
    INDUS_COUNTRY
  const zoneCountry = audience === 'client' || audience === 'internal' ? INDUS_COUNTRY : country
  const holidays = await holidaysFor([...new Set([INDUS_COUNTRY, zoneCountry])], now)
  const ooo = contact?.outOfOfficeUntil?.toISOString().slice(0, 10) ?? null

  const slotFrom = (moment: Date) =>
    nextSendSlot({
      now: moment,
      kind: row.kind,
      audience,
      recipient: {
        country: zoneCountry,
        tz: zoneCountry === INDUS_COUNTRY ? INDUS_TZ : tzForCountry(zoneCountry),
        outOfOfficeUntil: ooo,
      },
      rules: timing,
      holidays,
      weekends: weekends ?? DEFAULT_COUNTRY_WEEKENDS,
    })

  let decision: SlotDecision
  if (rule && !rule.respectSendWindow) {
    decision = { at: now.toISOString(), reason: 'no_window', held: false }
  } else {
    const slot = slotFrom(now)
    decision = { at: slot.at.toISOString(), reason: slot.reason, held: false }
  }

  const cap = row.mailbox?.dailySendCap ?? 0
  const slotAt = new Date(decision.at)
  if (overCap(sentInCapDay(row.mailbox?.syncState ?? null, slotAt, timing.capReset), cap)) {
    const reset = capWindow(slotAt, timing.capReset).next
    const after = slotFrom(reset)
    decision = { at: after.at.toISOString(), reason: 'cap', held: true }
    await moveOutbound(outboundId, ['scheduled'], 'held', {
      holdReason: 'cap',
      sendSlotAt: after.at,
    })
  } else {
    await opsDb.outboundEmail.updateMany({
      where: { id: outboundId, status: { in: ['scheduled', 'held'] } },
      data: { sendSlotAt: slotAt },
    })
  }
  return decision
}
