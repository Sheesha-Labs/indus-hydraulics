import 'server-only'
import { opsDb } from '@indus/ops-db'

/**
 * "Pause everything" (boards 98 and 102, 08-map-integrations §1.10). S07 builds the switch; from S04 every
 * background function reads the state through here (defineOpsFunction's `pause` behaviour) so pausing works the
 * day the switch lands. The state is the settings row `assistant.paused` ({ pausedAt, pausedById } or absent).
 */
export type PauseState = { pausedAt: string; pausedById: string | null } | null

export async function assistantPauseState(): Promise<PauseState> {
  const row = await opsDb.settingsEntry.findUnique({
    where: { key: 'assistant.paused' },
    select: { value: true },
  })
  const v = row?.value as { pausedAt?: unknown; pausedById?: unknown } | null | undefined
  if (!v || typeof v.pausedAt !== 'string') return null
  return {
    pausedAt: v.pausedAt,
    pausedById: typeof v.pausedById === 'string' ? v.pausedById : null,
  }
}

export async function isAssistantPaused(): Promise<boolean> {
  return (await assistantPauseState()) !== null
}
