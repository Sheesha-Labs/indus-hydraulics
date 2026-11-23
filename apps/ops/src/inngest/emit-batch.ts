import 'server-only'
import { inngest } from './client'
import type { OpsEvent } from './emit'

/** Send many Ops events in batches of 200 (Inngest accepts up to 512 per call; 200 keeps payloads small). */
export async function emitEvents(events: readonly OpsEvent[]): Promise<number> {
  for (let i = 0; i < events.length; i += 200) {
    const batch = events.slice(i, i + 200)
    await inngest.send(
      batch.map((e) => ({ name: e.name, data: e.data, ...(e.id ? { id: e.id } : {}) }))
    )
  }
  return events.length
}
