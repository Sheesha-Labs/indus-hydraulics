import 'server-only'
import { budgetState, monthKey, type BudgetMode, type BudgetState } from '@indus/ops-ai'
import { dayOfMonth, monthStart } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'

/**
 * Board 101 · Cost & limits (S07-T04, C14, 08-map §2.7). One read transaction: the month's ai_call totals by
 * purpose and model (one grouped query), the month's ai_budget row, the ten most expensive actions (sum by
 * actionId) and their headlines, and the two settings rows the Limits card edits. Months are Asia/Dubai
 * calendar months; the page total is exactly sum(ai_call.costUsd) since the Dubai month start.
 */

export const PURPOSE_GROUPS = [
  { key: 'reading', label: 'Reading mail', purposes: ['read_mail', 'classify'], unit: 'emails read' },
  { key: 'extraction', label: 'Extraction', purposes: ['extract'], unit: 'documents extracted' },
  { key: 'research', label: 'Supplier research', purposes: ['research'], unit: 'research runs' },
  { key: 'drafting', label: 'Drafting', purposes: ['draft'], unit: 'drafts' },
  { key: 'compare', label: 'Compare', purposes: ['compare'], unit: 'comparisons' },
  {
    key: 'other',
    label: 'Other',
    purposes: ['price', 'summarise', 'translate', 'other'],
    unit: 'other calls',
  },
] as const

export interface SpendLine {
  key: string
  label: string
  usd: string
  share: number
  calls: number
  unit: string
}

export interface CostPageData {
  isOwner: boolean
  monthLabel: string
  mtdUsd: string
  limitUsd: number
  day: number
  days: number
  projectionUsd: string
  /** 0–1 of the budget spent, and where a straight line would be today. */
  spentShare: number
  markerShare: number
  state: BudgetState
  mode: BudgetMode
  byPurpose: SpendLine[]
  byModel: SpendLine[]
  volumes: string
  topRuns: { id: string; purpose: string; title: string; ref: string | null; usd: string }[]
  /** USD per Dubai day of the month so far (index 0 = day 1), for the meter's daily bars. */
  daily: number[]
  limits: {
    monthlyBudgetUsd: number
    mode: BudgetMode
    researchCapUsd: number
    budgetVersion: number
    researchVersion: number
    budgetAwaiting: boolean
    researchAwaiting: boolean
  }
}

const usd = (d: Prisma.Decimal | number | null | undefined) =>
  new Prisma.Decimal(d ?? 0).toDecimalPlaces(2).toFixed(2)
const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

const PURPOSE_WORD: Record<string, string> = {
  read_mail: 'Reading mail',
  classify: 'Reading mail',
  extract: 'Extraction',
  research: 'Supplier research',
  draft: 'Drafting',
  compare: 'Compare',
  price: 'Pricing',
  summarise: 'Summary',
  translate: 'Translation',
  other: 'Other',
}

export async function getCostPage(user: { role: string }, now = new Date()): Promise<CostPageData> {
  const since = monthStart(now)
  const month = new Date(`${monthKey(now)}T00:00:00Z`)
  const [byPurposeModel, budget, top, budgetSetting, researchSetting, calls] = await opsDb.$transaction([
    opsDb.aiCall.groupBy({
      by: ['purpose', 'model'],
      where: { at: { gte: since } },
      orderBy: { purpose: 'asc' },
      _sum: { costUsd: true },
      _count: { _all: true },
    }),
    opsDb.aiBudget.findUnique({ where: { month } }),
    opsDb.aiCall.groupBy({
      by: ['actionId'],
      where: { at: { gte: since }, actionId: { not: null } },
      orderBy: { _sum: { costUsd: 'desc' } },
      take: 10,
      _sum: { costUsd: true },
    }),
    opsDb.settingsEntry.findUnique({
      where: { key: 'assistant.budget' },
      select: { value: true, version: true, signoffStatus: true },
    }),
    opsDb.settingsEntry.findUnique({
      where: { key: 'research.cap' },
      select: { value: true, version: true, signoffStatus: true },
    }),
    // The month's calls for the daily bars (index at): a few thousand rows a month at full volume.
    opsDb.aiCall.findMany({
      where: { at: { gte: since }, costUsd: { gt: 0 } },
      select: { at: true, costUsd: true },
    }),
  ])
  const actionIds = top.map((t) => t.actionId).filter((x): x is string => !!x)
  const actions = actionIds.length
    ? await opsDb.assistantAction.findMany({
        where: { id: { in: actionIds } },
        select: {
          id: true,
          headline: true,
          enquiry: { select: { ref: true } },
          def: { select: { label: true } },
          aiCalls: { select: { purpose: true }, take: 1 },
        },
      })
    : []

  let total = new Prisma.Decimal(0)
  const purposeSum = new Map<string, { usd: Prisma.Decimal; calls: number }>()
  const modelSum = new Map<string, { usd: Prisma.Decimal; calls: number }>()
  for (const r of byPurposeModel) {
    const sum = new Prisma.Decimal(r._sum?.costUsd ?? 0)
    const calls = (r._count as { _all: number })._all
    total = total.plus(sum)
    const p = purposeSum.get(r.purpose) ?? { usd: new Prisma.Decimal(0), calls: 0 }
    purposeSum.set(r.purpose, { usd: p.usd.plus(sum), calls: p.calls + calls })
    const m = modelSum.get(r.model) ?? { usd: new Prisma.Decimal(0), calls: 0 }
    modelSum.set(r.model, { usd: m.usd.plus(sum), calls: m.calls + calls })
  }
  const totalN = total.toNumber()
  const share = (d: Prisma.Decimal) => (totalN > 0 ? d.toNumber() / totalN : 0)
  const byPurpose = PURPOSE_GROUPS.map((g) => {
    let sum = new Prisma.Decimal(0)
    let calls = 0
    for (const p of g.purposes) {
      const x = purposeSum.get(p)
      if (x) {
        sum = sum.plus(x.usd)
        calls += x.calls
      }
    }
    return { key: g.key, label: g.label, usd: usd(sum), share: share(sum), calls, unit: g.unit }
  }).filter((l, i) => i < 4 || l.calls > 0)
  const byModel = [...modelSum.entries()]
    .sort((a, b) => b[1].usd.comparedTo(a[1].usd))
    .map(([model, x]) => ({
      key: model,
      label: model,
      usd: usd(x.usd),
      share: share(x.usd),
      calls: x.calls,
      unit: 'calls',
    }))

  const budgetValue = (budgetSetting?.value ?? {}) as { monthlyUsd?: number; mode?: BudgetMode }
  const researchValue = (researchSetting?.value ?? {}) as { perEnquiryUsd?: number }
  const limitUsd = budget ? budget.limitUsd.toNumber() : Number(budgetValue.monthlyUsd ?? 150)
  const mode = (budget?.mode as BudgetMode | undefined) ?? budgetValue.mode ?? 'warn_pause_research'
  const { day, days } = dayOfMonth(now)
  const daily = Array.from({ length: day }, () => 0)
  for (const c of calls) {
    const d = dayOfMonth(c.at).day
    if (d >= 1 && d <= day) daily[d - 1]! += c.costUsd.toNumber()
  }
  const projection = day > 0 ? (totalN / day) * days : 0
  const byId = new Map(actions.map((a) => [a.id, a]))
  const w = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', month: 'numeric' }).format(now)

  return {
    isOwner: user.role === 'owner',
    monthLabel: MONTHS[Number(w) - 1] ?? '',
    mtdUsd: usd(total),
    limitUsd,
    day,
    days,
    projectionUsd: usd(projection),
    spentShare: limitUsd > 0 ? Math.min(1, totalN / limitUsd) : 1,
    markerShare: day / days,
    state: budgetState({
      limitUsd: String(limitUsd),
      spentUsd: budget ? budget.spentUsd.toFixed(6) : total.toFixed(6),
      mode,
    }),
    mode,
    byPurpose,
    byModel,
    volumes: byPurpose
      .filter((l) => l.calls > 0 && l.key !== 'compare' && l.key !== 'other')
      .map((l) => `${l.calls.toLocaleString('en-US')} ${l.unit}`)
      .join(' · '),
    topRuns: top.flatMap((t) => {
      const a = t.actionId ? byId.get(t.actionId) : undefined
      if (!a) return []
      return [
        {
          id: a.id,
          purpose: PURPOSE_WORD[a.aiCalls[0]?.purpose ?? 'other'] ?? a.def.label,
          title: a.headline,
          ref: a.enquiry?.ref ?? null,
          usd: usd(t._sum?.costUsd),
        },
      ]
    }),
    daily: daily.map((x) => Math.round(x * 100) / 100),
    limits: {
      monthlyBudgetUsd: Number(budgetValue.monthlyUsd ?? limitUsd),
      mode: budgetValue.mode ?? mode,
      researchCapUsd: Number(researchValue.perEnquiryUsd ?? 5),
      budgetVersion: budgetSetting?.version ?? 0,
      researchVersion: researchSetting?.version ?? 0,
      budgetAwaiting: budgetSetting?.signoffStatus === 'awaiting',
      researchAwaiting: researchSetting?.signoffStatus === 'awaiting',
    },
  }
}
