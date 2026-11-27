'use server'

import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { requireOpsUser } from '../../lib/access'
import { LIVE_KEY_PATTERN, MAX_LIVE_KEYS, type LiveKey } from '../../lib/live-poller'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../../lib/safe-message'
import { readCounters, recordCounterKey } from '../../server/assistant/live-counter'

const keysSchema = z.array(z.string().regex(LIVE_KEY_PATTERN)).max(MAX_LIVE_KEYS)

/**
 * The live-counts read action (C24, ADR-19): the sidebar badges and the open record's counter, polled by
 * `useLiveKeys` every 30 s while a tab is visible (one leader tab per browser). A read action, not an API
 * route (05 §7.1): it checks the session itself, like every action, and returns `Result<T>`.
 *
 * S05-T02: one indexed read of `ops.live_counter`. A badge may sum several counters (Mail = Unsure + Needs
 * you); a record key reads its own counter. The Helper has no Review badge, so `review` is never answered for
 * the Helper.
 */
const SOURCES: Record<'today' | 'review' | 'mail', readonly string[]> = {
  today: ['today.items'],
  review: ['review.pending'],
  mail: ['mail.unsure', 'mail.needs_you'],
}

function sourcesOf(key: LiveKey): readonly string[] {
  return key === 'today' || key === 'review' || key === 'mail'
    ? SOURCES[key]
    : [recordCounterKey(key.slice('record:'.length))]
}

export async function getLiveCounts(
  keys: LiveKey[]
): Promise<Result<Partial<Record<LiveKey, number>>>> {
  const parsed = keysSchema.safeParse(keys)
  if (!parsed.success) return err(SAFE_MESSAGES.invalid)
  try {
    const user = await requireOpsUser()
    const answered = (parsed.data as LiveKey[]).filter(
      (k) => k !== 'review' || user.role === 'owner'
    )
    const values = await readCounters(answered.flatMap(sourcesOf))
    return ok(
      Object.fromEntries(
        answered.map((k) => [k, sourcesOf(k).reduce((n, c) => n + (values[c] ?? 0), 0)])
      ) as Partial<Record<LiveKey, number>>
    )
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}
