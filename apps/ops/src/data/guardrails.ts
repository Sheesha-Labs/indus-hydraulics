import 'server-only'
import { GUARDRAIL_DEFAULTS, monthStart } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'

/**
 * Board 100 · Guardrails (S07-T03). Two round trips: the guardrail rows, then one read transaction for this
 * month's trigger counts per key (one grouped query over guardrail_trigger), the last 10 triggers with their
 * action's headline, the UAE holidays for the next 12 months and the two sending mailboxes' caps.
 */

export interface GuardrailRowData {
  key: string
  kind: string
  label: string
  note: string
  section: 'value' | 'time' | 'fixed'
  enabled: boolean
  fixed: boolean
  params: Record<string, unknown>
  version: number
  awaiting: boolean
  monthCount: number
}

export interface TriggerItem {
  id: string
  title: string
  detail: string
  at: string
}

export interface HolidayItem {
  id: string
  date: string
  name: string
  kind: string
  hoursStart: string | null
  hoursEnd: string | null
}

export interface GuardrailsPageData {
  isOwner: boolean
  rows: GuardrailRowData[]
  last: TriggerItem[]
  holidays: HolidayItem[]
  nextHoliday: HolidayItem | null
  caps: { mailboxId: string; address: string; role: string; cap: number }[]
}

const META = new Map<string, (typeof GUARDRAIL_DEFAULTS)[number]>(GUARDRAIL_DEFAULTS.map((g) => [g.key, g]))
const ORDER = GUARDRAIL_DEFAULTS.map((g) => g.key as string)

export async function getGuardrailsPage(
  user: { role: string },
  now = new Date()
): Promise<GuardrailsPageData> {
  const rows = await opsDb.guardrail.findMany({
    select: {
      key: true,
      kind: true,
      label: true,
      enabled: true,
      fixed: true,
      params: true,
      version: true,
      signoffStatus: true,
    },
  })
  const since = monthStart(now)
  const yearOut = new Date(now.getTime() + 366 * 86_400_000)
  const [counts, last, holidays, mailboxes] = await opsDb.$transaction([
    opsDb.guardrailTrigger.groupBy({
      by: ['guardrailKey'],
      where: { at: { gte: since } },
      orderBy: { guardrailKey: 'asc' },
      _count: { _all: true },
    }),
    opsDb.guardrailTrigger.findMany({
      orderBy: { at: 'desc' },
      take: 10,
      select: {
        id: true,
        guardrailKey: true,
        text: true,
        at: true,
        action: { select: { headline: true } },
      },
    }),
    opsDb.holiday.findMany({
      where: { country: 'AE', date: { gte: new Date(now.getTime() - 86_400_000), lte: yearOut } },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, name: true, kind: true, hoursStart: true, hoursEnd: true },
    }),
    opsDb.mailbox.findMany({
      where: { role: { in: ['client', 'supplier'] } },
      orderBy: { role: 'asc' },
      select: { id: true, address: true, role: true, dailySendCap: true },
    }),
  ])
  const countOf = new Map(counts.map((c) => [c.guardrailKey, (c._count as { _all: number })._all]))
  const labelOf = new Map(rows.map((r) => [r.key, r.label]))
  const shown = rows
    .filter((r) => META.has(r.key) && r.key !== 'ai_budget')
    .sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
    .map((r): GuardrailRowData => {
      const meta = META.get(r.key)!
      return {
        key: r.key,
        kind: r.kind,
        label: r.label,
        note: meta.note,
        section: meta.section,
        enabled: r.enabled,
        fixed: r.fixed,
        params: (r.params as Record<string, unknown>) ?? {},
        version: r.version,
        awaiting: r.signoffStatus === 'awaiting',
        monthCount: countOf.get(r.key) ?? 0,
      }
    })
  const holidayItems = holidays.map((h) => ({
    id: h.id,
    date: h.date.toISOString().slice(0, 10),
    name: h.name,
    kind: h.kind,
    hoursStart: h.hoursStart,
    hoursEnd: h.hoursEnd,
  }))
  const today = now.toISOString().slice(0, 10)
  return {
    isOwner: user.role === 'owner',
    rows: shown,
    last: last.map((t) => ({
      id: t.id,
      title: (labelOf.get(t.guardrailKey) ?? t.guardrailKey).replace(/( (always )?asks|, queue until)$/, ''),
      detail: [t.text, t.action?.headline].filter(Boolean).join(' · '),
      at: t.at.toISOString(),
    })),
    holidays: holidayItems,
    nextHoliday: holidayItems.find((h) => h.kind === 'public_holiday' && h.date >= today) ?? null,
    caps: mailboxes.map((m) => ({
      mailboxId: m.id,
      address: m.address,
      role: m.role,
      cap: m.dailySendCap,
    })),
  }
}
