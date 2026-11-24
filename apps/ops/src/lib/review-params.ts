import { z } from 'zod'
import { REVIEW_FAMILIES } from '@indus/ops-core'

/**
 * Review search params (S06-T02, board 104): `?type=` one family chip, `?record=` one record, `?group=flat`,
 * `?sort=due|value`, `?card=<actionRef>` the expanded card, `?edit=1` its inline editor, `?seen=<version>` the version an
 * approve was refused for (board 110's conflict panel). Anything malformed
 * falls back to the default, so a hand-edited URL never fails the page.
 */
const schema = z.object({
  type: z.enum(REVIEW_FAMILIES).optional().catch(undefined),
  record: z.string().max(80).optional().catch(undefined),
  group: z.enum(['record', 'flat']).catch('record'),
  sort: z.enum(['oldest', 'due', 'value']).catch('oldest'),
  card: z
    .string()
    .regex(/^[A-Z0-9-]{4,40}$/)
    .optional()
    .catch(undefined),
  /** Board 110: the card version the person had open when an approve was refused as 'changed'. */
  seen: z.coerce.number().int().min(0).max(1_000_000).optional().catch(undefined),
  edit: z
    .enum(['1'])
    .optional()
    .catch(undefined)
    .transform((v) => v === '1'),
})

export type ReviewSearch = z.infer<typeof schema>

export function parseReviewSearch(
  raw: Record<string, string | string[] | undefined>
): ReviewSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return schema.parse({
    type: one(raw.type),
    record: one(raw.record) || undefined,
    group: one(raw.group) ?? 'record',
    sort: one(raw.sort) ?? 'oldest',
    card: one(raw.card),
    seen: one(raw.seen),
    edit: one(raw.edit),
  })
}

/** A Review link that keeps the person's filters; `over` replaces some (undefined drops a param). */
export function reviewQuery(s: Partial<ReviewSearch>, over: Partial<ReviewSearch> = {}): string {
  const v = { ...s, ...over }
  const p = new URLSearchParams()
  if (v.type) p.set('type', v.type)
  if (v.record) p.set('record', v.record)
  if (v.group === 'flat') p.set('group', 'flat')
  if (v.sort && v.sort !== 'oldest') p.set('sort', v.sort)
  if (v.card) p.set('card', v.card)
  if (v.seen !== undefined) p.set('seen', String(v.seen))
  if (v.edit) p.set('edit', '1')
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}
