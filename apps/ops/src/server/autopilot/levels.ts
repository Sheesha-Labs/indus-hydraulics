import 'server-only'
import {
  compareLevels,
  detectMode,
  parseRules,
  validateLevel,
  type AutopilotLevel,
  type AutopilotModeOrCustom,
} from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { AuditEntry } from '../../lib/audit'
import type { OpsUser } from '../../lib/access-core'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { SETTINGS } from '../settings/registry'
import { settingSubjectId } from '../settings/subject-id'

/**
 * Board 98 / 99 writes (S07-T02, ADR-10, D17). `autopilot_setting.level` is the authoritative level; the
 * mode is a label recomputed after every change (detectMode): one row that differs from its preset turns
 * it to Custom. Each write is version-checked, signs the row off (the Owner chose it), and returns what the
 * activity_event records ("KB changed Acknowledge client: Draft and ask → Do and tell"). ops.locked_level_guard
 * refuses a locked or over-the-max level in SQL as well.
 */

type Tx = Prisma.TransactionClient

export const LEVEL_WORD: Readonly<Record<AutopilotLevel, string>> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Never',
}

export interface SetLevelResult {
  actionKey: string
  label: string
  from: AutopilotLevel
  to: AutopilotLevel
  version: number
  mode: AutopilotModeOrCustom
  modeBefore: AutopilotModeOrCustom | null
}

const DEF_SELECT = {
  key: true,
  label: true,
  configurable: true,
  lockedLevel: true,
  maxLevel: true,
  defaultCareful: true,
  defaultBalanced: true,
  defaultHandsOff: true,
  setting: { select: { level: true, version: true, rules: true } },
} as const

/** Recompute the mode label from every row and store it when it changed (version + 1). */
async function syncMode(
  tx: Tx,
  userId: string
): Promise<{ mode: AutopilotModeOrCustom; before: AutopilotModeOrCustom | null }> {
  const [defs, entry] = await Promise.all([
    tx.autopilotActionDef.findMany({ select: DEF_SELECT }),
    tx.settingsEntry.findUnique({ where: { key: 'assistant.mode' }, select: { value: true } }),
  ])
  const mode = detectMode(defs)
  const stored = SETTINGS['assistant.mode'].schema.safeParse(entry?.value)
  const before = stored.success ? stored.data.mode : null
  if (entry && before !== mode) {
    await tx.settingsEntry.update({
      where: { key: 'assistant.mode' },
      data: { value: { mode }, version: { increment: 1 }, updatedById: userId },
    })
  }
  return { mode, before }
}

export async function setActionLevel(
  tx: Tx,
  input: { actionKey: string; level: AutopilotLevel; version: number },
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<SetLevelResult> {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
  const def = await tx.autopilotActionDef.findUnique({
    where: { key: input.actionKey },
    select: DEF_SELECT,
  })
  if (!def?.setting) throw new SafeError(SAFE_MESSAGES.gone)
  if (!def.configurable) throw new SafeError('This action is not an Autopilot setting.')
  const ok = validateLevel(def, input.level)
  if (!ok.success) throw new SafeError(ok.error)
  if (def.setting.version !== input.version) throw new SafeError(SAFE_MESSAGES.conflict)
  const from = def.setting.level
  const { count } = await tx.autopilotSetting.updateMany({
    where: { actionKey: input.actionKey, version: input.version },
    data: {
      level: input.level,
      version: { increment: 1 },
      updatedById: user.id,
      signoffStatus: 'signed_off',
      signedOffById: user.id,
      signedOffAt: now,
    },
  })
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
  // An open suggestion the new level already meets is settled by the change.
  const open = await tx.autopilotSuggestion.findFirst({
    where: { actionKey: input.actionKey, acceptedAt: null },
    select: { id: true, toLevel: true },
  })
  if (open && compareLevels(input.level, open.toLevel) >= 0) {
    await tx.autopilotSuggestion.update({
      where: { id: open.id },
      data: { acceptedAt: now, acceptedById: user.id },
    })
  }
  const { mode, before } = await syncMode(tx, user.id)
  return {
    actionKey: def.key,
    label: def.label,
    from,
    to: input.level,
    version: input.version + 1,
    mode,
    modeBefore: before,
  }
}

export function levelAudit(out: SetLevelResult, initials: string): AuditEntry[] {
  const rows: AuditEntry[] = [
    {
      subjectType: 'settings',
      subjectId: settingSubjectId(`autopilot.${out.actionKey}`),
      kind: 'settings',
      field: `autopilot.${out.actionKey}.level`,
      before: { level: out.from },
      after: { level: out.to },
      note: `${initials} changed ${out.label}: ${LEVEL_WORD[out.from]} → ${LEVEL_WORD[out.to]}`,
    },
  ]
  if (out.modeBefore !== out.mode) {
    rows.push({
      subjectType: 'settings',
      subjectId: settingSubjectId('assistant.mode'),
      kind: 'settings',
      field: 'assistant.mode',
      before: { mode: out.modeBefore },
      after: { mode: out.mode },
      note: `Autopilot mode is now ${out.mode === 'custom' ? 'Custom' : out.mode}`,
    })
  }
  return rows
}

export interface SaveRulesResult {
  actionKey: string
  label: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  version: number
}

/**
 * Save an action's rules (board 99). The Owner for any action; a Helper with "can edit chaser rules" for
 * #13 only (the action checks the capability; this checks the action).
 */
export async function saveActionRules(
  tx: Tx,
  input: { actionKey: string; rules: unknown; version: number },
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<SaveRulesResult> {
  if (user.role !== 'owner' && input.actionKey !== 'chase_suppliers')
    throw new SafeError(SAFE_MESSAGES.forbidden)
  const parsed = parseRules(input.actionKey, input.rules)
  if (!parsed.ok) throw new SafeError(parsed.error)
  const def = await tx.autopilotActionDef.findUnique({
    where: { key: input.actionKey },
    select: { key: true, label: true, setting: { select: { rules: true, version: true } } },
  })
  if (!def?.setting) throw new SafeError(SAFE_MESSAGES.gone)
  if (def.setting.version !== input.version) throw new SafeError(SAFE_MESSAGES.conflict)
  const { count } = await tx.autopilotSetting.updateMany({
    where: { actionKey: input.actionKey, version: input.version },
    data: {
      rules: parsed.rules as Prisma.InputJsonValue,
      version: { increment: 1 },
      updatedById: user.id,
      ...(user.role === 'owner'
        ? { signoffStatus: 'signed_off' as const, signedOffById: user.id, signedOffAt: now }
        : {}),
    },
  })
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
  return {
    actionKey: def.key,
    label: def.label,
    before: (def.setting.rules as Record<string, unknown> | null) ?? {},
    after: parsed.rules,
    version: input.version + 1,
  }
}

export function rulesAudit(out: SaveRulesResult, initials: string): AuditEntry {
  return {
    subjectType: 'settings',
    subjectId: settingSubjectId(`autopilot.${out.actionKey}`),
    kind: 'settings',
    field: `autopilot.${out.actionKey}.rules`,
    before: out.before as Prisma.InputJsonValue,
    after: out.after as Prisma.InputJsonValue,
    note: `${initials} changed the rules of ${out.label}`,
  }
}

/** "Not now": the suggestion comes back after 14 days (board 99). */
export const SNOOZE_DAYS = 14

export async function dismissSuggestion(
  tx: Tx,
  input: { id: string },
  now = new Date()
): Promise<{ actionKey: string; until: string }> {
  const s = await tx.autopilotSuggestion.findUnique({
    where: { id: input.id },
    select: { actionKey: true, acceptedAt: true },
  })
  if (!s || s.acceptedAt) throw new SafeError(SAFE_MESSAGES.gone)
  const until = new Date(now.getTime() + SNOOZE_DAYS * 86_400_000)
  await tx.autopilotSuggestion.update({ where: { id: input.id }, data: { dismissedUntil: until } })
  return { actionKey: s.actionKey, until: until.toISOString() }
}

/** Accept: the same setLevel (with its checks) to the suggested level; the suggestion is settled by it. */
export async function acceptSuggestion(
  tx: Tx,
  input: { id: string; version: number },
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<SetLevelResult> {
  const s = await tx.autopilotSuggestion.findUnique({
    where: { id: input.id },
    select: { actionKey: true, toLevel: true, acceptedAt: true },
  })
  if (!s || s.acceptedAt) throw new SafeError(SAFE_MESSAGES.gone)
  return setActionLevel(
    tx,
    { actionKey: s.actionKey, level: s.toLevel, version: input.version },
    user,
    now
  )
}
