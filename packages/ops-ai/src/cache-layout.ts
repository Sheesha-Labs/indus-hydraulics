/**
 * Byte-stable system prompts for prompt caching (ADR-08). The cache is a prefix match: any byte that changes
 * between calls (a timestamp, an id) invalidates everything after it. So system blocks hold only versioned
 * prompt text; today's date and the message under review go in the user turn.
 *
 * The last block carries `cache_control` with the 1-hour TTL. A prefix below the model's minimum cacheable
 * length simply is not cached; that costs nothing.
 */

export interface SystemPart {
  /** A stable name for the part, used in error messages only. */
  id: string
  text: string
}

export interface SystemTextBlock {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral'; ttl: '1h' }
}

const ISO_TIMESTAMP = /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i

export class UnstableSystemPromptError extends Error {
  constructor(id: string, what: string) {
    super(`System prompt part "${id}" contains ${what}; put per-call values in the user turn`)
    this.name = 'UnstableSystemPromptError'
  }
}

/** Throws when a system part holds a value that differs per call (an ISO timestamp or a uuid). */
export function assertStable(part: SystemPart): void {
  if (ISO_TIMESTAMP.test(part.text)) throw new UnstableSystemPromptError(part.id, 'a timestamp')
  if (UUID.test(part.text)) throw new UnstableSystemPromptError(part.id, 'a uuid')
}

export function buildSystem(parts: readonly SystemPart[]): SystemTextBlock[] {
  if (parts.length === 0) throw new RangeError('buildSystem needs at least one part')
  parts.forEach(assertStable)
  return parts.map((p, i) =>
    i === parts.length - 1
      ? { type: 'text', text: p.text, cache_control: { type: 'ephemeral', ttl: '1h' } }
      : { type: 'text', text: p.text }
  )
}
