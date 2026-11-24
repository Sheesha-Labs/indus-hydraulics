import 'server-only'
import { opsDb } from '@indus/ops-db'

/**
 * The version of a conversation for a proposal's basis (S06-T01): its latest inbound message. A reply in the
 * thread after a draft changes it, so the draft is stale.
 */
export async function threadVersion(threadId: string): Promise<string> {
  const m = await opsDb.mailMessage.findFirst({
    where: { threadId, direction: 'inbound' },
    orderBy: [{ sentAt: 'desc' }, { id: 'desc' }],
    select: { id: true },
  })
  return m?.id ?? 'none'
}
