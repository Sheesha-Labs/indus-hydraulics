'use server'

import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { requireOpsUser } from '../../lib/access'
import { LIVE_KEY_PATTERN, MAX_LIVE_KEYS, type LiveKey } from '../../lib/live-poller'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../../lib/safe-message'

const keysSchema = z.array(z.string().regex(LIVE_KEY_PATTERN)).max(MAX_LIVE_KEYS)

/**
 * The live-counts read action (C24, ADR-19): the sidebar badges and the open record's counter, polled by
 * `useLiveKeys` every 30 s while a tab is visible (one leader tab per browser). A read action, not an API
 * route (05 §7.1): it checks the session itself, like every action, and returns `Result<T>`.
 *
 * S02: zeros. S05 replaces the body with one indexed read of `ops.live_counter`, cached briefly so the
 * Owner's and the Helper's tabs share it. The Helper has no Review badge, so `review` is never answered for
 * the Helper.
 */
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
    return ok(Object.fromEntries(answered.map((k) => [k, 0])) as Partial<Record<LiveKey, number>>)
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}
