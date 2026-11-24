import 'server-only'
import {
  AUTOPILOT_MODES,
  allowedLevels,
  compareLevels,
  presetLevels,
  type AutopilotMode,
  detectMode,
  effectiveLock,
  effectiveMax,
  levelConsequence,
  ruleForm,
  rulesWithDefaults,
  savedText,
  sendsExternally,
  switchConsequences,
  weekLabel,
  weekStart,
  weekStats,
  type AutopilotLevel,
  type AutopilotModeOrCustom,
  type RuleField,
  type WeekStats,
} from '@indus/ops-core'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { can, type OpsUser } from '../lib/access-core'

/**
 * Board 98 · Autopilot and board 99 · one action (S07-T02). Two round trips for the page: the catalogue with
 * each row's setting and open suggestion (one query with include), then one read transaction for the week's
 * two grouped counts, the mode setting, the pause row and whether anything was ever decided (first day).
 * The drawer adds one read transaction: the action's last 10 runs and its email template.
 */

export const GROUPS = [
  { key: 'mail', label: 'Mail' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'sourcing', label: 'Sourcing' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'after_sending', label: 'After sending' },
  { key: 'orders', label: 'Orders' },
  { key: 'money', label: 'Money' },
] as const satisfies readonly { key: $Enums.AutopilotGroup; label: string }[]

/** The email template each action drafts from, where one exists (board 99 "Template"). */
const TEMPLATE_FOR: Readonly<Record<string, string>> = { chase_suppliers: 'supplier_chaser' }

export interface AutopilotRow {
  key: string
  label: string
  ruleText: string | null
  description: string | null
  originBoard: string | null
  group: $Enums.AutopilotGroup
  level: AutopilotLevel
  /** The levels the row may take; a locked row only its lock. */
  allowed: AutopilotLevel[]
  locked: AutopilotLevel | null
  max: AutopilotLevel | null
  external: boolean
  configurable: boolean
  version: number
  awaitingSignoff: boolean
  suggestion: { id: string; toLevel: AutopilotLevel; streak: number } | null
  /** Raising to Do and tell / Do quietly asks first, with these lines (board 102 state 4). */
  confirm: Partial<Record<AutopilotLevel, { from: string[]; stillAsks: string | null }>>
}

export interface AutopilotPageData {
  isOwner: boolean
  /** The Helper with "can edit chaser rules": rules and template of #13 only. */
  canEditChaserRules: boolean
  mode: { value: AutopilotModeOrCustom; version: number }
  pausedAt: string | null
  week: WeekStats & { label: string; saved: string }
  groups: { key: string; label: string; rows: AutopilotRow[] }[]
  system: AutopilotRow[]
  /** Nothing decided yet: the Careful first-day copy (board 102 state 5). */
  firstDay: boolean
  /** What each preset would change (the mode switch's confirmation): rows changed and their new levels. */
  modePreview: Record<AutopilotMode, { changed: number; byLevel: Partial<Record<AutopilotLevel, number>> }>
}

function toRow(
  d: {
    key: string
    label: string
    ruleText: string | null
    description: string | null
    originBoard: string | null
    group: $Enums.AutopilotGroup
    configurable: boolean
    lockedLevel: AutopilotLevel | null
    maxLevel: AutopilotLevel | null
    defaultCareful: AutopilotLevel
    signoffStatus: $Enums.SignoffStatus
    setting: {
      level: AutopilotLevel
      version: number
      signoffStatus: $Enums.SignoffStatus
      rules: unknown
    } | null
    suggestions: { id: string; toLevel: AutopilotLevel; streak: number }[]
  }
): AutopilotRow {
  const locked = effectiveLock(d)
  return {
    key: d.key,
    label: d.label,
    ruleText: d.ruleText,
    description: d.description,
    originBoard: d.originBoard,
    group: d.group,
    level: locked ?? d.setting?.level ?? d.defaultCareful,
    allowed: allowedLevels(d),
    locked,
    max: effectiveMax(d),
    external: sendsExternally(d.key),
    configurable: d.configurable,
    version: d.setting?.version ?? 0,
    awaitingSignoff:
      d.signoffStatus === 'awaiting' || (d.setting?.signoffStatus ?? 'awaiting') === 'awaiting',
    // A suggestion the row has already reached (changed by hand since) is not shown.
    suggestion:
      d.suggestions[0] &&
      compareLevels(d.suggestions[0].toLevel, locked ?? d.setting?.level ?? d.defaultCareful) > 0
        ? d.suggestions[0]
        : null,
    confirm: {
      do_and_tell: switchConsequences(d.key, 'do_and_tell', rulesWithDefaults(d.key, d.setting?.rules)),
      do_quietly: switchConsequences(d.key, 'do_quietly', rulesWithDefaults(d.key, d.setting?.rules)),
    },
  }
}

function defInclude(now: Date) {
  return {
    setting: { select: { level: true, version: true, signoffStatus: true, rules: true } },
    suggestions: {
      where: {
        acceptedAt: null,
        OR: [{ dismissedUntil: null }, { dismissedUntil: { lt: now } }],
      },
      select: { id: true, toLevel: true, streak: true },
      take: 1,
    },
  } satisfies Prisma.AutopilotActionDefInclude
}

export async function getAutopilotPage(
  user: Pick<OpsUser, 'role' | 'canSeeMargins' | 'canSendSupplierMail' | 'canEditChaserRules'>,
  now = new Date()
): Promise<AutopilotPageData> {
  const defs = await opsDb.autopilotActionDef.findMany({
    orderBy: { position: 'asc' },
    include: defInclude(now),
  })
  const since = weekStart(now)
  const [byState, decisions, modeRow, pause, decided] = await opsDb.$transaction([
    opsDb.assistantAction.groupBy({
      by: ['actionKey', 'state'],
      where: { createdAt: { gte: since } },
      orderBy: { actionKey: 'asc' },
      _count: { _all: true },
    }),
    opsDb.assistantActionEvent.groupBy({
      by: ['toState'],
      where: {
        at: { gte: since },
        actorKind: 'user',
        toState: { in: ['approved', 'edited_approved', 'rejected', 'undone', 'reverted'] },
      },
      orderBy: { toState: 'asc' },
      _count: { _all: true },
    }),
    opsDb.settingsEntry.findUnique({
      where: { key: 'assistant.mode' },
      select: { value: true, version: true },
    }),
    opsDb.assistantState.findUnique({ where: { id: 1 }, select: { pausedAt: true } }),
    opsDb.assistantAction.findFirst({ where: { decidedAt: { not: null } }, select: { id: true } }),
  ])

  const minutes = Object.fromEntries(defs.map((d) => [d.key, d.minutesSaved ? Number(d.minutesSaved) : null]))
  const stats = weekStats(
    byState.map((r) => ({
      actionKey: r.actionKey,
      state: r.state,
      count: (r._count as { _all: number })._all,
    })),
    decisions.map((r) => ({ toState: r.toState, count: (r._count as { _all: number })._all })),
    minutes
  )
  const detected = detectMode(defs)
  const rows = defs.map(toRow)
  return {
    isOwner: user.role === 'owner',
    canEditChaserRules: can(user, 'edit_chaser_rules'),
    mode: {
      // The label follows the rows (D17): a row that differs from its preset shows Custom.
      value: detected,
      version: modeRow?.version ?? 0,
    },
    pausedAt: pause?.pausedAt?.toISOString() ?? null,
    week: { ...stats, label: weekLabel(now), saved: savedText(stats.minutesSaved) },
    groups: GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      rows: rows.filter((r) => r.group === g.key),
    })).filter((g) => g.rows.length > 0),
    system: rows.filter((r) => r.group === 'system'),
    firstDay: decided === null,
    modePreview: Object.fromEntries(
      AUTOPILOT_MODES.map((m) => {
        const target = presetLevels(m, defs)
        const byLevel: Partial<Record<AutopilotLevel, number>> = {}
        let changed = 0
        for (const d of defs) {
          const to = target.get(d.key)
          if (to === undefined || d.setting?.level === to) continue
          changed += 1
          byLevel[to] = (byLevel[to] ?? 0) + 1
        }
        return [m, { changed, byLevel }]
      })
    ) as AutopilotPageData['modePreview'],
  }
}

export interface ActionRun {
  id: string
  ref: string
  headline: string
  state: $Enums.ActionState
  level: AutopilotLevel
  createdAt: string
  edited: boolean
}

export interface ActionDetail {
  row: AutopilotRow
  rules: Record<string, unknown>
  fields: readonly RuleField[]
  levels: { level: AutopilotLevel; consequence: string }[]
  /** Raising to Do and tell / Do quietly asks for confirmation with these lines (board 102 state 4). */
  confirm: Partial<Record<AutopilotLevel, { from: string[]; stillAsks: string | null }>>
  template: { key: string; label: string; subject: string; body: string; awaiting: boolean } | null
  history: ActionRun[]
  canEditLevel: boolean
  canEditRules: boolean
}

/** Sample values for the template preview (never a real counterparty). */
const SAMPLE: Readonly<Record<string, string>> = {
  rfq_ref: 'IH-RFQ-2611-P04',
  supplier_contact: 'Alex',
  supplier_name: 'Example Valve Co',
  reply_by: 'Thursday 27 Nov',
  sender_name: 'Purchasing, Indus Hydraulics',
}

export function fillSample(template: string): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => SAMPLE[k] ?? `{${k}}`)
}

export async function getActionDetail(
  key: string,
  user: Pick<OpsUser, 'role' | 'canSeeMargins' | 'canSendSupplierMail' | 'canEditChaserRules'>,
  now = new Date()
): Promise<ActionDetail | null> {
  const def = await opsDb.autopilotActionDef.findUnique({
    where: { key },
    include: defInclude(now),
  })
  if (!def) return null
  const templateKey = TEMPLATE_FOR[key] ?? null
  const [history, template] = await opsDb.$transaction([
    opsDb.assistantAction.findMany({
      where: { actionKey: key },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        ref: true,
        headline: true,
        state: true,
        levelAtTime: true,
        createdAt: true,
        editDiff: true,
      },
    }),
    opsDb.emailTemplate.findFirst({
      where: { key: templateKey ?? '__none__', archivedAt: null },
      select: { key: true, label: true, subjectTemplate: true, bodyTemplate: true, signoffStatus: true },
    }),
  ])
  const row = toRow(def)
  const rules = rulesWithDefaults(key, def.setting?.rules)
  const owner = user.role === 'owner'
  const helperRules = key === 'chase_suppliers' && can(user, 'edit_chaser_rules')
  const levels = (['off', 'suggest', 'draft_and_ask', 'do_and_tell', 'do_quietly'] as const)
    .filter((l) => row.allowed.includes(l) || row.locked === null)
    .map((level) => ({ level, consequence: levelConsequence(key, level) }))
  return {
    row,
    rules,
    fields: ruleForm(key).fields,
    levels: row.locked === 'never' ? [{ level: 'never', consequence: levelConsequence(key, 'never') }] : levels,
    confirm: {
      do_and_tell: switchConsequences(key, 'do_and_tell', rules),
      do_quietly: switchConsequences(key, 'do_quietly', rules),
    },
    template: template
      ? {
          key: template.key,
          label: template.label,
          subject: fillSample(template.subjectTemplate),
          body: fillSample(template.bodyTemplate),
          awaiting: template.signoffStatus === 'awaiting',
        }
      : null,
    history: history.map((h) => ({
      id: h.id,
      ref: h.ref,
      headline: h.headline,
      state: h.state,
      level: h.levelAtTime,
      createdAt: h.createdAt.toISOString(),
      edited: h.editDiff !== null,
    })),
    canEditLevel: owner && row.locked === null && row.configurable,
    canEditRules: owner || helperRules,
  }
}
