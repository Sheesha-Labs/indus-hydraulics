import 'server-only'
import {
  cameInSince,
  DEFAULT_COUNTRY_WEEKENDS,
  instantAt,
  NEEDS_YOU_SHOWN,
  needsYouShown,
  todayGreeting,
  todayState,
  wallTime,
  weekStart,
  type HolidayRow,
  type WeekendTable,
} from '@indus/ops-core'
import { opsDb, type $Enums } from '@indus/ops-db'
import type { OpsUser } from '../lib/access-core'
import { todayProviders, type TodayContext, type TodayRow } from '../server/today/providers'
import { REVIEW_SELECT, reviewCardOf, type ReviewCard } from './review'

/**
 * Board 178 · Today and 182 · its states (S07-T06, ADR-04 query budget). Three round trips at most:
 *
 *   1  one read transaction: the holiday rows and weekend table (for "since yesterday"), the top Needs-you cards,
 *      their count and per-record counts, the open notifications and the pause row
 *   2  one read transaction: every registered section provider's query (server/today/providers.ts)
 *   3  (Owner, while setup is unfinished) the S03 setup progress, read by the page
 *
 * The Helper's Needs you holds only cards he may act on (supplier-side work and mail Unsure items), supplier-side
 * rows come first, and no money figure is shown unless he can see margins.
 */

/** Supplier-side actions: what the Helper's Today leads with. */
export const SUPPLIER_SIDE: ReadonlySet<string> = new Set([
  'pick_suppliers',
  'research_suppliers',
  'send_supplier_rfqs',
  'chase_suppliers',
  'relay_supplier_questions',
  'remind_supplier_documents',
  'capture_supplier_quotes',
  'production_chasing',
  'resend_alternate_contact',
  'ask_open_copy',
  'withdraw_rfq',
  'rfq_change_followup',
  'capture_supplier_ack_proforma',
  'request_freight_quotes',
  'capture_freight_quote',
])

export interface NeedsItem {
  id: string
  ref: string
  version: number
  tag: string
  title: string
  sub: string
  /** Approve inline (an open card that is not locked, stale, a quotation or a Helper's client reply). */
  approvable: boolean
  href: string
}

export interface TodayModel {
  greeting: string
  state: 'calm' | 'normal' | 'on_fire'
  needs: {
    total: number
    /** Up to five rows (three when on fire) with their verbs (approve inline, undo toast). */
    cards: ReviewCard[]
    /** Mail Unsure items (Helper), drawn as rows that open Mail. */
    items: NeedsItem[]
    moreByRecord: { label: string; count: number }[]
  }
  cameIn: TodayRow[]
  late: TodayRow[]
  done: TodayRow[]
  doneTotal: number
  thisWeek: TodayRow[]
  kpi: { awaiting: number; showMoney: boolean }
  notifications: number
  paused: boolean
  /** The next deadline the late section knows of (board 182 "Calm"). */
  nextDeadline: string | null
  /** Board 182 "First morning after import": S20 fills it; null until an import completes. */
  firstMorning: null
}

function dubaiMidnight(now: Date): Date {
  const w = wallTime(now, 'Asia/Dubai')
  return instantAt({ year: w.year, month: w.month, day: w.day }, 0, 0, 'Asia/Dubai')
}

export async function getTodayModel(
  user: Pick<OpsUser, 'id' | 'name' | 'role' | 'canSeeMargins'>,
  now = new Date()
): Promise<TodayModel> {
  const helper = user.role === 'helper'
  const needsWhere = helper
    ? {
        OR: [
          { surface: 'review', state: 'proposed' as $Enums.ActionState, actionKey: { in: [...SUPPLIER_SIDE] } },
          { surface: 'mail_unsure', state: 'proposed' as $Enums.ActionState },
        ],
      }
    : {
        surface: 'review',
        OR: [
          { state: 'proposed' as $Enums.ActionState },
          { state: 'later' as $Enums.ActionState, laterUntil: { lte: now } },
        ],
      }
  const since14 = new Date(now.getTime() - 15 * 86_400_000)
  const [holidays, weekendsRow, top, total, byRecord, notifications, pause] = await opsDb.$transaction([
    opsDb.holiday.findMany({
      where: { country: 'AE', date: { gte: since14, lte: now } },
      select: { country: true, date: true, kind: true, hoursStart: true, hoursEnd: true },
    }),
    opsDb.settingsEntry.findUnique({ where: { key: 'calendar.country_weekends' }, select: { value: true } }),
    opsDb.assistantAction.findMany({
      where: needsWhere,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: NEEDS_YOU_SHOWN,
      ...REVIEW_SELECT,
    }),
    opsDb.assistantAction.count({ where: needsWhere }),
    opsDb.assistantAction.groupBy({
      by: ['enquiryId'],
      where: needsWhere,
      orderBy: { enquiryId: 'asc' },
      _count: { _all: true },
    }),
    opsDb.notification.count({ where: { userId: user.id, resolvedAt: null, readAt: null } }),
    opsDb.assistantState.findUnique({ where: { id: 1 }, select: { pausedAt: true } }),
  ])
  const weekends = (weekendsRow?.value as WeekendTable | undefined) ?? DEFAULT_COUNTRY_WEEKENDS
  const rows: HolidayRow[] = holidays.map((h) => ({
    country: h.country,
    date: h.date.toISOString().slice(0, 10),
    kind: h.kind as HolidayRow['kind'],
    hoursStart: h.hoursStart,
    hoursEnd: h.hoursEnd,
  }))
  const since = cameInSince(now, rows, weekends)
  const startOfToday = dubaiMidnight(now)
  const ctx: TodayContext = {
    userId: user.id,
    role: user.role,
    canSeeMargins: user.canSeeMargins,
    now,
    since,
    startOfToday,
    endOfWeek: new Date(weekStart(now).getTime() + 7 * 86_400_000 - 1),
    oneWorkingDayAgo: since,
  }
  const providers = todayProviders(user.role)
  const results = await opsDb.$transaction(providers.map((p) => p.query(ctx)))
  const sections: Record<string, TodayRow[]> = { came_in: [], late: [], done: [], kpi: [], this_week: [] }
  providers.forEach((p, i) => {
    sections[p.section]!.push(...p.read(results[i] as never, ctx))
  })

  const shown = top.slice(0, needsYouShown(total))
  const cards = shown.filter((a) => a.surface === 'review').map((a) => reviewCardOf(a, user, now))
  const items: NeedsItem[] = shown
    .filter((a) => a.surface !== 'review')
    .map((a) => ({
      id: a.id,
      ref: a.ref,
      version: a.version,
      tag: a.def.label,
      title: a.headline,
      sub: [a.enquiry?.ref, a.enquiry?.client?.name].filter(Boolean).join(' · ') || 'Unsure',
      approvable: false,
      href: '/mail',
    }))
  const doneTotal = sections.done!.reduce((n, r) => n + Number(/· (\d+)$/.exec(r.title)?.[1] ?? 0), 0)
  return {
    greeting: todayGreeting(now, user.name.split(/\s+/)[0] ?? user.name),
    state: todayState(total),
    needs: {
      total,
      cards,
      items,
      moreByRecord:
        total > shown.length
          ? byRecord
              .map((g) => ({
                label: g.enquiryId ? 'one enquiry' : 'no record',
                count: (g._count as { _all: number })._all,
              }))
              .sort((a, b) => b.count - a.count)
          : [],
    },
    cameIn: sections.came_in!,
    late: sections.late!,
    done: sections.done!,
    doneTotal,
    thisWeek: sections.this_week!,
    kpi: { awaiting: total, showMoney: !helper || user.canSeeMargins },
    notifications,
    paused: !!pause?.pausedAt,
    nextDeadline: sections.this_week![0]
      ? `${sections.this_week![0]!.title}, ${sections.this_week![0]!.day}`
      : null,
    firstMorning: null,
  }
}
