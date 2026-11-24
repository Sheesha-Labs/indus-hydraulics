import { AccessError, requireOpsUser } from '../../../../../../../lib/access'
import { parseHistorySearch } from '../../../../../../../lib/history-params'
import { resolveHistoryScope } from '../../../../../../../server/history/scope'
import { historyCsvStream, recordHistoryExport } from '../../../../../../../server/history/export'

export const dynamic = 'force-dynamic'

/**
 * Export a record's history as CSV (S06-T06, board 113). Owner only, checked here (the proxy already demands
 * a session). `type` is enquiry (by ref), supplier or client (by id). Streams the current filter and records
 * who exported it. A Helper is refused: the export is unmasked.
 */
export async function GET(req: Request, ctx: { params: Promise<{ type: string; id: string }> }) {
  let user
  try {
    user = await requireOpsUser(['owner'])
  } catch (e) {
    if (e instanceof AccessError)
      return new Response('Only the Owner can export history', { status: 403 })
    throw e
  }
  const { type, id } = await ctx.params
  const scope = await resolveHistoryScope(type, id)
  if (!scope) return new Response('Not found', { status: 404 })
  const search = parseHistorySearch(Object.fromEntries(new URL(req.url).searchParams))
  await recordHistoryExport(user, scope.scope, scope.label)
  return new Response(historyCsvStream(scope.scope, search.kind), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="history-${scope.file}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
