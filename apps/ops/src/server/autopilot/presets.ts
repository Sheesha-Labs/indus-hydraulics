import 'server-only'
import {
  presetLevels,
  presetSummary,
  type AutopilotLevel,
  type AutopilotMode,
  type AutopilotModeOrCustom,
} from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { AuditEntry } from '../../lib/audit'
import { AccessError, can, type OpsUser } from '../../lib/access-core'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { SETTINGS } from '../settings/registry'
import { settingSubjectId } from '../settings/subject-id'

/**
 * Applying an Autopilot mode (board 83, ADR-10): Careful, Balanced or Hands-off sets every
 * configurable, unlocked action to that mode's default (capped at its max level; ops-core
 * presetLevels), in ONE transaction with the `assistant.mode` setting (version-checked). The setup
 * step 'assistant' is marked done by Next (it can be left at Careful untouched). The caller (src/actions/autopilot.ts, defineAction) writes the one
 * activity_event in the same transaction and purges the `assistant.mode` cache tag after it commits.
 *
 * Locked rows (#20, #28, #32 and the system locks) and non-configurable rows are never read for
 * writing: presetLevels leaves them out, and the UPDATE is keyed to the keys it returned and guarded by
 * `lockedLevel IS NULL AND configurable` as well. ops.locked_level_guard() would refuse a bad level
 * anyway. Only rows whose level actually changes are written (version + 1).
 *
 * The Assistant log row for a mode change arrives with S06.
 */

export type Tx = Prisma.TransactionClient

export type PresetResult = {
  mode: AutopilotMode
  /** The mode before this change (null if the stored value was unreadable). */
  previous: AutopilotModeOrCustom | null
  /** Actions whose level changed. */
  changed: number
  /** The new `assistant.mode` version: pass it as `expectedVersion` to undo. */
  version: number
  savedAt: string
}

/** The activity_event row for a preset change (one per change, written by defineAction). */
export function presetAudit(out: PresetResult): AuditEntry {
  return {
    subjectType: 'settings',
    subjectId: settingSubjectId('assistant.mode'),
    kind: 'settings',
    field: 'assistant.mode',
    before: { mode: out.previous },
    after: { mode: out.mode },
    note: presetSummary(out.mode, out.changed),
  }
}

export async function applyAutopilotPreset(
  tx: Tx,
  mode: AutopilotMode,
  expectedVersion: number,
  user: OpsUser
): Promise<PresetResult> {
  // Owner only: the action allows only the Owner, and the service says so again for any other caller.
  if (user.role !== 'owner' || !can(user, 'change_settings')) throw new AccessError('forbidden')

  const entry = await tx.settingsEntry.findUnique({
    where: { key: 'assistant.mode' },
    select: { value: true, version: true },
  })
  if (!entry) throw new SafeError(SAFE_MESSAGES.gone)
  if (entry.version !== expectedVersion) throw new SafeError(SAFE_MESSAGES.conflict)
  const stored = SETTINGS['assistant.mode'].schema.safeParse(entry.value)
  const previous = stored.success ? stored.data.mode : null

  const defs = await tx.autopilotActionDef.findMany({
    select: {
      key: true,
      configurable: true,
      lockedLevel: true,
      maxLevel: true,
      defaultCareful: true,
      defaultBalanced: true,
      defaultHandsOff: true,
      setting: { select: { level: true } },
    },
  })
  const target = presetLevels(mode, defs)

  // Group the rows that change by their new level: one UPDATE per level (at most five).
  const byLevel = new Map<AutopilotLevel, string[]>()
  for (const def of defs) {
    const level = target.get(def.key)
    if (level === undefined || def.setting?.level === level) continue
    byLevel.set(level, [...(byLevel.get(level) ?? []), def.key])
  }
  let changed = 0
  for (const [level, keys] of byLevel) {
    const { count } = await tx.autopilotSetting.updateMany({
      where: {
        actionKey: { in: keys },
        level: { not: level },
        def: { configurable: true, lockedLevel: null },
      },
      data: { level, version: { increment: 1 }, updatedById: user.id },
    })
    changed += count
  }

  const value = SETTINGS['assistant.mode'].schema.parse({ mode })
  const { count } = await tx.settingsEntry.updateMany({
    where: { key: 'assistant.mode', version: expectedVersion },
    data: { value, version: { increment: 1 }, updatedById: user.id },
  })
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)

  return {
    mode,
    previous,
    changed,
    version: expectedVersion + 1,
    savedAt: new Date().toISOString(),
  }
}
