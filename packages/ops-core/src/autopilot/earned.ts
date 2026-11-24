import type { AutopilotLevel } from '../state/labels'
import { isPricedClientSend } from './keys'
import { AUTONOMY_ORDER, autonomyRank } from './levels'
import { effectiveLock, validateLevel, type ActionDefLevels } from './presets'

/**
 * Earned suggestions (S07-T01, 08-map §2.3): "You approved the last 25 chasers without edits. Switch to Do
 * and tell?" A pure function over the action's history since its last level change. It never changes a
 * level; the nightly job stores it as an `autopilot_suggestion` the Owner may accept or snooze.
 */

export const EARNED_STREAK = 25

/** Money actions never get a suggestion (#20, #26, #27, #31, #28, #32, pricing and price talks). */
export const NO_SUGGESTION: ReadonlySet<string> = new Set([
  'send_quotation',
  'supplier_pos',
  'supplier_payments',
  'price_quotation',
  'negotiate_supplier_price',
  'order_ack_proforma',
  'advance_reminders',
  'payment_reminders',
])

export interface RunHistory {
  /** A person approved it (Draft and ask), or it ran on its own and was not undone (Do and tell). */
  approved: boolean
  edited: boolean
  rejected: boolean
  undone: boolean
  at: Date | string
}

export interface EarnedSuggestion {
  toLevel: AutopilotLevel
  streak: number
}

/** The next level up the row may take, or null (locked, money, at its max, at the top). */
export function nextLevelUp(def: ActionDefLevels, current: AutopilotLevel): AutopilotLevel | null {
  if (NO_SUGGESTION.has(def.key) || isPricedClientSend(def.key)) return null
  if (effectiveLock(def) !== null) return null
  const rank = autonomyRank(current)
  if (rank === null) return null
  const up = AUTONOMY_ORDER[rank + 1]
  if (!up) return null
  return validateLevel(def, up).success ? up : null
}

/**
 * `history` holds this action's runs since its last level change, any order. The streak is the number of
 * approved runs, newest first, before the first edit, reject or undo. At 25 the row may move one level up.
 */
export function earnedSuggestion(
  history: readonly RunHistory[],
  def: ActionDefLevels,
  current: AutopilotLevel
): EarnedSuggestion | null {
  const toLevel = nextLevelUp(def, current)
  if (!toLevel) return null
  const runs = [...history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  let streak = 0
  for (const r of runs) {
    if (r.edited || r.rejected || r.undone) break
    if (r.approved) streak += 1
  }
  return streak >= EARNED_STREAK ? { toLevel, streak } : null
}
