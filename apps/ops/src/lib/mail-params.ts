import { z } from 'zod'
import { MAIL_TYPE_SLUGS } from '@indus/ops-core'

/**
 * Mail search params (S05-T05, board 91): `?type=` one Type folder, `?q=` search, `?cursor=` the next page,
 * `?past=1` include past (backfilled) mail. Anything malformed falls back to the default, so a hand-edited
 * URL never fails the page.
 */
const schema = z.object({
  type: z.enum(MAIL_TYPE_SLUGS).optional().catch(undefined),
  q: z.string().trim().max(120).optional().catch(undefined),
  cursor: z.string().max(400).optional().catch(undefined),
  past: z
    .enum(['1'])
    .optional()
    .catch(undefined)
    .transform((v) => v === '1'),
})

export type MailSearch = z.infer<typeof schema>

export function parseMailSearch(raw: Record<string, string | string[] | undefined>): MailSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return schema.parse({
    type: one(raw.type),
    q: one(raw.q) || undefined,
    cursor: one(raw.cursor),
    past: one(raw.past),
  })
}

/** The query string for a folder link that keeps the person's search and past-mail choice. */
export function mailQuery(s: Partial<MailSearch>, over: Partial<MailSearch> = {}): string {
  const v = { ...s, ...over }
  const p = new URLSearchParams()
  if (v.type) p.set('type', v.type)
  if (v.q) p.set('q', v.q)
  if (v.cursor) p.set('cursor', v.cursor)
  if (v.past) p.set('past', '1')
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}
