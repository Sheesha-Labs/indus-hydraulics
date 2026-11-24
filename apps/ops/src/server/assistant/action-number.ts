import 'server-only'
import type { Prisma } from '@indus/ops-db'

/** The Dubai calendar day an action ref is scoped to ("26-11-24"). */
export function dubaiDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** The next assistant_action ref (A-yy-mm-dd-nnnn), inside the transaction that inserts the row. */
export async function allocateActionRef(tx: Prisma.TransactionClient, now: Date): Promise<string> {
  const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('assistant_action', ${dubaiDay(now)})`
  if (!num) throw new Error('allocate_number returned no row')
  return num.formatted
}
