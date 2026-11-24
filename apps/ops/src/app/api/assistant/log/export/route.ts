import { AccessError, requireOpsUser } from '../../../../../lib/access'
import { parseLogSearch } from '../../../../../lib/log-params'
import { logCsvStream, recordExport } from '../../../../../server/assistant/log-export'

export const dynamic = 'force-dynamic'

/**
 * Export the Assistant log as CSV (S06-T04, board 111). Owner only, checked here (the proxy already demands a
 * session). Streams the current filters; records who exported what.
 */
export async function GET(req: Request) {
  let user
  try {
    user = await requireOpsUser(['owner'])
  } catch (e) {
    if (e instanceof AccessError)
      return new Response('Only the Owner can export the log', { status: 403 })
    throw e
  }
  const search = parseLogSearch(Object.fromEntries(new URL(req.url).searchParams))
  const now = new Date()
  await recordExport(user, search, now)
  return new Response(logCsvStream(search, now), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="assistant-log-${search.day}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
