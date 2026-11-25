import { z } from 'zod'
import {
  isWorkingDay,
  ramadanWindow,
  type HolidayRow,
  type WeekendTable,
} from '../calendar/working-day'
import { minutesOf, wallTime } from '../calendar/zoned'
import { isPricedClientSend } from './keys'

/**
 * Guardrails (board 100, ADR-10, C12, C14): settings that override any Autopilot level. They can only make
 * the Assistant ask (`ask`), wait for a slot (`queue`) or stop (`block`); never do more. Their values are
 * database rows (`ops.guardrail`, signed off by the Owner); the typed params below validate them.
 *
 * Two rows are fixed rules, shown but not editable: client prices always need the Owner, and the Assistant
 * never moves money. They are code constants as well (levels.ts FIXED_RULES, keys.ts PRICED_CLIENT_SENDS);
 * the rows only make them visible and countable.
 */

export const GUARDRAIL_KINDS = [
  'value_threshold',
  'first_contact',
  'margin_floor',
  'credit_hold',
  'working_hours',
  'holiday_calendar',
  'daily_send_cap',
  'fixed_client_prices',
  'fixed_no_money',
  'ai_budget',
  'research_cap',
] as const
export type GuardrailKind = (typeof GUARDRAIL_KINDS)[number]

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')
const amount = z.number().finite().positive().max(1_000_000_000)
const pct = z.number().finite().min(0).max(100)

export const valueThresholdParams = z.strictObject({
  appliesTo: z.enum(['quotation', 'rfq']),
  currency: z.enum(['AED', 'USD']),
  amount,
})
export const marginFloorParams = z
  .strictObject({ floorPct: pct, hardMinPct: pct })
  .refine((p) => p.hardMinPct <= p.floorPct, {
    message: 'The hard minimum cannot be above the floor',
    path: ['hardMinPct'],
  })
export const workingHoursParams = z
  .strictObject({
    /** 0 = Sunday … 6 = Saturday (calendar/zoned weekdayOf). */
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    start: hhmm,
    end: hhmm,
    /** Sends outside the hours wait for this time on the next working day. */
    queueUntil: hhmm,
  })
  .refine((p) => minutesOf(p.start) < minutesOf(p.end), {
    message: 'The day must end after it starts',
    path: ['end'],
  })
export const holidayCalendarParams = z.strictObject({
  country: z.string().regex(/^[A-Z]{2}$/),
  ramadanStart: hhmm,
  ramadanEnd: hhmm,
})
export const researchCapParams = z.strictObject({ perEnquiryUsd: amount.max(1_000) })
const empty = z.strictObject({})

export const GUARDRAIL_PARAMS = {
  value_threshold: valueThresholdParams,
  first_contact: empty,
  margin_floor: marginFloorParams,
  credit_hold: empty,
  working_hours: workingHoursParams,
  holiday_calendar: holidayCalendarParams,
  // D4: the caps live on Mailbox.dailySendCap and reset at send.timing capReset; the row is the switch.
  daily_send_cap: empty,
  fixed_client_prices: empty,
  fixed_no_money: empty,
  ai_budget: empty,
  research_cap: researchCapParams,
} as const satisfies Record<GuardrailKind, z.ZodType>

export type GuardrailParams<K extends GuardrailKind> = z.infer<(typeof GUARDRAIL_PARAMS)[K]>

/** Validate a row's params for its kind. */
export function parseGuardrailParams<K extends GuardrailKind>(
  kind: K,
  params: unknown
): { ok: true; params: GuardrailParams<K> } | { ok: false; error: string } {
  const out = GUARDRAIL_PARAMS[kind].safeParse(params)
  if (out.success) return { ok: true, params: out.data as GuardrailParams<K> }
  return { ok: false, error: out.error.issues[0]?.message ?? 'Invalid value' }
}

/** The seeded rows (S07-T03), in board order. Values are defaults awaiting the Owner's sign-off. */
export const GUARDRAIL_DEFAULTS = [
  {
    key: 'value_threshold_quotation',
    kind: 'value_threshold',
    label: 'Client quotation above a value always asks',
    note: 'Applies even where a level has been relaxed elsewhere',
    section: 'value',
    fixed: false,
    params: { appliesTo: 'quotation', currency: 'AED', amount: 200_000 },
  },
  {
    key: 'value_threshold_rfq',
    kind: 'value_threshold',
    label: 'Supplier RFQ above a value always asks',
    note: 'The estimated value of the lines in the RFQ',
    section: 'value',
    fixed: false,
    params: { appliesTo: 'rfq', currency: 'USD', amount: 50_000 },
  },
  {
    key: 'first_contact',
    kind: 'first_contact',
    label: 'First email to anyone new asks',
    note: 'Clients, suppliers and forwarders not yet in the directory',
    section: 'value',
    fixed: false,
    params: {},
  },
  {
    key: 'margin_floor',
    kind: 'margin_floor',
    label: 'Below the margin floor asks',
    note: 'Any line or quotation under the floor',
    section: 'value',
    fixed: false,
    params: { floorPct: 12, hardMinPct: 5 },
  },
  {
    key: 'credit_hold',
    kind: 'credit_hold',
    label: 'Client on credit hold asks',
    note: 'Every send to that client, including follow-ups',
    section: 'value',
    fixed: false,
    params: {},
  },
  {
    key: 'working_hours',
    kind: 'working_hours',
    label: 'Outside working hours, queue until',
    note: 'Mon–Fri 09:00–18:00 GST; anything after waits',
    section: 'time',
    fixed: false,
    params: { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', queueUntil: '08:30' },
  },
  {
    key: 'holiday_calendar',
    kind: 'holiday_calendar',
    label: 'Holiday calendar',
    note: 'UAE public holidays and Ramadan hours',
    section: 'time',
    fixed: false,
    params: { country: 'AE', ramadanStart: '10:00', ramadanEnd: '15:00' },
  },
  {
    key: 'daily_send_cap',
    kind: 'daily_send_cap',
    label: 'Daily send cap per mailbox',
    note: 'Above it, sends queue for the next day and you are told',
    section: 'time',
    fixed: false,
    params: {},
  },
  {
    key: 'ai_budget',
    kind: 'ai_budget',
    label: 'AI budget',
    note: 'Set in Cost & limits',
    section: 'time',
    fixed: false,
    params: {},
  },
  {
    key: 'research_cap',
    kind: 'research_cap',
    label: 'Research cap per enquiry',
    note: 'Supplier research stops at the cap and asks you',
    section: 'time',
    fixed: false,
    params: { perEnquiryUsd: 5 },
  },
  {
    key: 'fixed_client_prices',
    kind: 'fixed_client_prices',
    label: 'Client prices are never sent without your approval',
    note: 'Quotations, revisions, discounts and any email with a price',
    section: 'fixed',
    fixed: true,
    params: {},
  },
  {
    key: 'fixed_no_money',
    kind: 'fixed_no_money',
    label: 'The Assistant never moves money',
    note: 'It prepares supplier payments and checks them; you release at the bank',
    section: 'fixed',
    fixed: true,
    params: {},
  },
] as const satisfies readonly {
  key: string
  kind: GuardrailKind
  label: string
  note: string
  section: 'value' | 'time' | 'fixed'
  fixed: boolean
  params: object
}[]

export type GuardrailKey = (typeof GUARDRAIL_DEFAULTS)[number]['key']

/** A stored guardrail row, as the resolver reads it. */
export interface GuardrailSetting {
  key: string
  kind: GuardrailKind
  enabled: boolean
  fixed: boolean
  params: unknown
}

/** The facts about one run that guardrails look at. Each action supplies what applies to it. */
export interface GuardrailContext {
  /** A client quotation's value in AED. */
  valueAed?: number | null
  /** A supplier RFQ's estimated value in USD. */
  valueUsd?: number | null
  /** The recipient is not in the directory, or has never had an email from Indus. */
  counterpartyIsNew?: boolean
  /** Who that is, for the card ("First email to Example Valve Co"). */
  counterpartyName?: string | null
  supplierTier?: 'contact_only' | 'trial' | 'approved' | null
  /** The lowest line margin on a priced proposal, in percent. */
  minMarginPct?: number | null
  clientOnCreditHold?: boolean
  clientName?: string | null
  /** #13: a person has approved the first chaser of this RFQ. */
  firstChaserApproved?: boolean
  /** #13: chasers already sent on this RFQ. */
  chasersSent?: number
  /** #13: the most chasers the action's rules allow (3). */
  maxChasers?: number
  /** Computed by the server from working hours and the calendar (workingHoursState). */
  outsideHours?: 'hours' | 'holiday' | 'ramadan' | null
  /** The send would go over the mailbox's daily cap. */
  overDailyCap?: boolean
  /** Supplier research already spent on this enquiry, USD. */
  enquiryResearchUsd?: number | null
}

export type GuardrailEffect = 'ask' | 'queue' | 'block'

/** One guardrail (or action rule, kind 'rule') that fired. `text` is what the Review card prints. */
export interface GuardrailHit {
  key: string
  kind: GuardrailKind | 'rule'
  effect: GuardrailEffect
  text: string
}

export interface GuardrailAction {
  key: string
  /** Emails someone outside Indus. */
  external: boolean
  /** Calls a model on the research route. */
  research?: boolean
}

const grouped = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: n % 1 === 0 ? 0 : 2 })

function pctText(n: number): string {
  return `${Number.isInteger(n) ? n : Number(n.toFixed(1))}%`
}

function rowsOf(guardrails: readonly GuardrailSetting[], kind: GuardrailKind) {
  return guardrails.filter((g) => g.kind === kind && (g.enabled || g.fixed))
}

function paramsOf<K extends GuardrailKind>(
  g: GuardrailSetting & { kind: K }
): GuardrailParams<K> | null {
  const out = parseGuardrailParams(g.kind, g.params)
  return out.ok ? out.params : null
}

/** The margin floor the pricing rule (#19) uses, enabled or not (defaults 12 % / 5 %). */
export function marginFloorOf(guardrails: readonly GuardrailSetting[]): {
  floorPct: number
  hardMinPct: number
} {
  const row = guardrails.find((g) => g.kind === 'margin_floor')
  const p = row ? paramsOf(row as GuardrailSetting & { kind: 'margin_floor' }) : null
  return p ?? { floorPct: 12, hardMinPct: 5 }
}

/**
 * Every guardrail that applies to this run. Only enabled rows count (fixed rows always do); a row whose
 * params do not validate is skipped (the save action refuses such params, so only a hand edit makes one).
 */
export function evaluateGuardrails(
  action: GuardrailAction,
  ctx: GuardrailContext,
  guardrails: readonly GuardrailSetting[]
): GuardrailHit[] {
  const hits: GuardrailHit[] = []

  for (const g of rowsOf(guardrails, 'value_threshold')) {
    const p = paramsOf(g as GuardrailSetting & { kind: 'value_threshold' })
    if (!p) continue
    const value = p.appliesTo === 'quotation' ? ctx.valueAed : ctx.valueUsd
    if (value != null && value > p.amount) {
      hits.push({
        key: g.key,
        kind: 'value_threshold',
        effect: 'ask',
        text: `Value above ${p.currency} ${grouped(p.amount)}`,
      })
    }
  }

  for (const g of rowsOf(guardrails, 'first_contact')) {
    if (ctx.counterpartyIsNew) {
      hits.push({
        key: g.key,
        kind: 'first_contact',
        effect: 'ask',
        text: ctx.counterpartyName
          ? `First email to ${ctx.counterpartyName}`
          : 'First email to someone new',
      })
    }
  }

  for (const g of rowsOf(guardrails, 'margin_floor')) {
    const p = paramsOf(g as GuardrailSetting & { kind: 'margin_floor' })
    if (!p || ctx.minMarginPct == null) continue
    if (ctx.minMarginPct < p.floorPct) {
      hits.push({
        key: g.key,
        kind: 'margin_floor',
        effect: 'ask',
        text: `Margin ${pctText(ctx.minMarginPct)} is below the ${pctText(p.floorPct)} floor`,
      })
    }
  }

  for (const g of rowsOf(guardrails, 'credit_hold')) {
    if (action.external && ctx.clientOnCreditHold) {
      hits.push({
        key: g.key,
        kind: 'credit_hold',
        effect: 'ask',
        text: ctx.clientName ? `${ctx.clientName} is on credit hold` : 'Client on credit hold',
      })
    }
  }

  if (action.external && ctx.outsideHours) {
    const hours = rowsOf(guardrails, 'working_hours')[0]
    const calendar = rowsOf(guardrails, 'holiday_calendar')[0]
    const p = hours ? paramsOf(hours as GuardrailSetting & { kind: 'working_hours' }) : null
    const until = p ? ` · queued for ${p.queueUntil}` : ''
    if (ctx.outsideHours === 'hours' && hours) {
      hits.push({
        key: hours.key,
        kind: 'working_hours',
        effect: 'queue',
        text: `Outside working hours${until}`,
      })
    } else if (ctx.outsideHours !== 'hours' && calendar) {
      hits.push({
        key: calendar.key,
        kind: 'holiday_calendar',
        effect: 'queue',
        text: ctx.outsideHours === 'ramadan' ? 'Outside Ramadan hours' : 'On a UAE holiday',
      })
    }
  }

  for (const g of rowsOf(guardrails, 'daily_send_cap')) {
    if (action.external && ctx.overDailyCap) {
      hits.push({
        key: g.key,
        kind: 'daily_send_cap',
        effect: 'queue',
        text: 'Daily send cap reached · queued for tomorrow',
      })
    }
  }

  for (const g of rowsOf(guardrails, 'research_cap')) {
    const p = paramsOf(g as GuardrailSetting & { kind: 'research_cap' })
    if (!p || !action.research || ctx.enquiryResearchUsd == null) continue
    if (ctx.enquiryResearchUsd >= p.perEnquiryUsd) {
      hits.push({
        key: g.key,
        kind: 'research_cap',
        effect: 'block',
        text: `Research cap USD ${grouped(p.perEnquiryUsd)} reached for this enquiry`,
      })
    }
  }

  for (const g of rowsOf(guardrails, 'fixed_client_prices')) {
    if (isPricedClientSend(action.key)) {
      hits.push({
        key: g.key,
        kind: 'fixed_client_prices',
        effect: 'ask',
        text: 'Client prices are never sent without your approval',
      })
    }
  }

  for (const g of rowsOf(guardrails, 'fixed_no_money')) {
    if (action.key === 'supplier_payments') {
      hits.push({
        key: g.key,
        kind: 'fixed_no_money',
        effect: 'block',
        text: 'The Assistant never moves money',
      })
    }
  }

  return hits
}

/**
 * Is `now` outside working hours (board 100)? A holiday or closure in the calendar country comes first,
 * then a day outside the working days, then Ramadan hours on a Ramadan day, then the ordinary hours. Null
 * inside hours. `calendar` null: the holiday guardrail is off, so only the weekly hours count.
 */
export function workingHoursState(
  now: Date,
  hours: GuardrailParams<'working_hours'>,
  calendar: GuardrailParams<'holiday_calendar'> | null,
  holidays: readonly HolidayRow[],
  tz = 'Asia/Dubai'
): 'hours' | 'holiday' | 'ramadan' | null {
  const w = wallTime(now, tz)
  const day = { year: w.year, month: w.month, day: w.day }
  const minute = w.hour * 60 + w.minute
  if (calendar) {
    const none: WeekendTable = { default: [], byCountry: {} }
    if (!isWorkingDay(day, calendar.country, holidays, none)) return 'holiday'
  }
  const weekday = new Date(Date.UTC(w.year, w.month - 1, w.day)).getUTCDay()
  if (!hours.days.includes(weekday)) return 'hours'
  const ramadan = calendar ? ramadanWindow(day, calendar.country, holidays) : null
  if (ramadan) {
    const start = minutesOf(ramadan.start || calendar!.ramadanStart)
    const end = minutesOf(ramadan.end || calendar!.ramadanEnd)
    return minute >= start && minute < end ? null : 'ramadan'
  }
  return minute >= minutesOf(hours.start) && minute < minutesOf(hours.end) ? null : 'hours'
}
