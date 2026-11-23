import { z } from 'zod'
import { err, ok, type Result } from '../result'
import { CAREFUL_SEND_EXCEPTIONS, isPricedClientSend, sendsExternally } from './keys'
import { AUTONOMY_ORDER, fixedRule, isAbove, lowerOf } from './levels'
import type { AutopilotLevel } from '../state/labels'

/**
 * Autopilot modes (board 83, ADR-10): Careful, Balanced and Hands-off each set every configurable,
 * unlocked action at once from the row's per-mode default. Custom (board 99, S07) is whatever the
 * Owner set row by row afterwards; it is not a preset.
 */
export const AUTOPILOT_MODES = ['careful', 'balanced', 'hands_off'] as const
export type AutopilotMode = (typeof AUTOPILOT_MODES)[number]
export const autopilotModeSchema = z.enum(AUTOPILOT_MODES)

export const MODE_LABEL = {
  careful: 'Careful',
  balanced: 'Balanced',
  hands_off: 'Hands-off',
} as const satisfies Record<AutopilotMode, string>

/** "Autopilot set to Balanced · 23 actions changed" (board 83 toast, the activity_event note). */
export function presetSummary(mode: AutopilotMode, changed: number): string {
  return `Autopilot set to ${MODE_LABEL[mode]} · ${changed} ${changed === 1 ? 'action' : 'actions'} changed`
}

/** The columns of `ops.autopilot_action_def` the level rules read. */
export type ActionDefLevels = {
  key: string
  configurable: boolean
  lockedLevel: AutopilotLevel | null
  maxLevel: AutopilotLevel | null
  defaultCareful: AutopilotLevel
  defaultBalanced: AutopilotLevel
  defaultHandsOff: AutopilotLevel
}

/** The row's lock: a fixed rule from code wins over whatever the row says. */
export function effectiveLock(
  def: Pick<ActionDefLevels, 'key' | 'lockedLevel'>
): AutopilotLevel | null {
  return fixedRule(def.key) ?? def.lockedLevel
}

/** The row's cap: its maxLevel, and never above Draft and ask for a priced client send. */
export function effectiveMax(
  def: Pick<ActionDefLevels, 'key' | 'maxLevel'>
): AutopilotLevel | null {
  const priced: AutopilotLevel | null = isPricedClientSend(def.key) ? 'draft_and_ask' : null
  if (def.maxLevel === null) return priced
  return priced === null ? def.maxLevel : lowerOf(def.maxLevel, priced)
}

/** The row has a lock (data or fixed rule): presets leave it alone. */
export function isLocked(def: Pick<ActionDefLevels, 'key' | 'lockedLevel'>): boolean {
  return effectiveLock(def) !== null
}

const WORD: Record<AutopilotLevel, string> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Never',
}

/**
 * May `level` be set on this row? Refuses any level other than the lock on a locked row (a fixed rule
 * counts as a lock even if the row forgot it), `never` on a row not locked at never, and any level above
 * the row's cap (priced client sends are capped at Draft and ask in code as well). Mirrors
 * `ops.locked_level_guard()`.
 */
export function validateLevel(
  def: Pick<ActionDefLevels, 'key' | 'lockedLevel' | 'maxLevel'>,
  level: AutopilotLevel
): Result<AutopilotLevel> {
  const lock = effectiveLock(def)
  if (lock !== null) {
    return level === lock
      ? ok(level)
      : err(`This action is fixed at ${WORD[lock]}; it cannot be set to ${WORD[level]}.`)
  }
  if (level === 'never') return err('Never is only for actions fixed at Never.')
  const max = effectiveMax(def)
  if (max !== null && isAbove(level, max)) {
    return err(`This action can go up to ${WORD[max]} at most.`)
  }
  return ok(level)
}

/** Lower `level` to the row's cap when it is above it. */
export function capLevel(
  def: Pick<ActionDefLevels, 'key' | 'maxLevel'>,
  level: AutopilotLevel
): AutopilotLevel {
  const max = effectiveMax(def)
  return max !== null && isAbove(level, max) ? max : level
}

export function modeDefault(def: ActionDefLevels, mode: AutopilotMode): AutopilotLevel {
  if (mode === 'careful') return def.defaultCareful
  if (mode === 'balanced') return def.defaultBalanced
  return def.defaultHandsOff
}

/**
 * The level each configurable, unlocked row takes under `mode`: its per-mode default, capped at its
 * max level. Rows that are not configurable, locked in data or fixed by code are absent from the map,
 * so a preset can never touch them. Throws on a default no row could hold (`never` on an unlocked row),
 * which only a broken seed produces.
 */
export function presetLevels(
  mode: AutopilotMode,
  defs: readonly ActionDefLevels[]
): Map<string, AutopilotLevel> {
  const out = new Map<string, AutopilotLevel>()
  for (const def of defs) {
    if (!def.configurable || isLocked(def)) continue
    const level = capLevel(def, modeDefault(def, mode))
    const checked = validateLevel(def, level)
    if (!checked.success) {
      throw new Error(`autopilot preset ${mode}: ${def.key} default ${level} is not allowed`)
    }
    out.set(def.key, level)
  }
  return out
}

/** For tests and UI: every ordered level a row may take (a locked row: just its lock). */
export function allowedLevels(
  def: Pick<ActionDefLevels, 'key' | 'lockedLevel' | 'maxLevel'>
): AutopilotLevel[] {
  const lock = effectiveLock(def)
  if (lock !== null) return [lock]
  return AUTONOMY_ORDER.filter((l) => validateLevel(def, l).success)
}

/**
 * The Careful rule (board 83 "sends nothing without you", architecture §1.3): keys that email someone
 * outside Indus and still default above Draft and ask under Careful, other than the exceptions in
 * CAREFUL_SEND_EXCEPTIONS. Must be empty; the catalogue guard and the database test both check it.
 */
export function carefulSendViolations(defs: readonly ActionDefLevels[]): string[] {
  return defs
    .filter((d) => sendsExternally(d.key) && !Object.hasOwn(CAREFUL_SEND_EXCEPTIONS, d.key))
    .filter((d) => isAbove(d.defaultCareful, 'draft_and_ask'))
    .map((d) => d.key)
}
