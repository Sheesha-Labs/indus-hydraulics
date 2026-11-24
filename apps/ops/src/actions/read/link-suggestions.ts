'use server'

import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { requireOpsUser } from '../../lib/access'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../../lib/safe-message'
import { suggestLinks, type LinkSuggestion } from '../../server/mail/suggest-links'

const schema = z.object({ messageId: z.uuid(), q: z.string().max(120).default('') })

/**
 * Board 95's suggestions (S05-T06): a read action (05 §7.1), not an API route. The modal debounces it by 120 ms.
 */
export async function getLinkSuggestions(input: {
  messageId: string
  q: string
}): Promise<Result<LinkSuggestion[]>> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err(SAFE_MESSAGES.invalid)
  try {
    await requireOpsUser(['owner', 'helper'])
    return ok(await suggestLinks(parsed.data.messageId, parsed.data.q))
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}
