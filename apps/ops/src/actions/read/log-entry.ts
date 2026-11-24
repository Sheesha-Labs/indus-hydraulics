'use server'

import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { getLogEntry, type LogEntryDetail } from '../../data/assistant-log'
import { requireOpsUser } from '../../lib/access'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../../lib/safe-message'

const schema = z.object({ actionId: z.uuid() })

/** Board 111's expanded row (S06-T04): a read action; money hidden from a Helper without margins. */
export async function readLogEntry(input: {
  actionId: string
}): Promise<Result<LogEntryDetail | null>> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err(SAFE_MESSAGES.invalid)
  try {
    const user = await requireOpsUser(['owner', 'helper'])
    return ok(await getLogEntry(parsed.data.actionId, user))
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}
