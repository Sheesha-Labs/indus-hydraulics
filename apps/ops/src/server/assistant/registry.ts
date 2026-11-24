import 'server-only'
import { isActionKey } from '@indus/ops-core'
import type { ActionDefinition, Json } from './types'

/**
 * Action definitions by key (S05-T02). Each module under server/assistant/actions registers itself; the
 * runner looks the key up from the event. A key must exist in the catalogue (`ACTION_KEYS`, seeded into
 * `ops.autopilot_action_def`; the catalogue guard keeps the two equal).
 */
const DEFINITIONS = new Map<string, ActionDefinition<Json, Json>>()

export function registerAction<In extends Json, Out extends Json>(
  def: ActionDefinition<In, Out>
): void {
  if (!isActionKey(def.key))
    throw new Error(`Unknown action key "${def.key}": add it to ACTION_KEYS first`)
  if (DEFINITIONS.has(def.key) && DEFINITIONS.get(def.key) !== (def as unknown)) {
    throw new Error(`Action "${def.key}" is registered twice`)
  }
  DEFINITIONS.set(def.key, def as unknown as ActionDefinition<Json, Json>)
}

export function actionDefinition(key: string): ActionDefinition<Json, Json> | undefined {
  return DEFINITIONS.get(key)
}

export function registeredActionKeys(): string[] {
  return [...DEFINITIONS.keys()].sort()
}

/** Test seam. */
export function unregisterAction(key: string): void {
  DEFINITIONS.delete(key)
}
