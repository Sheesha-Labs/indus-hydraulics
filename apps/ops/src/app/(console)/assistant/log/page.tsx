import LogScreen from '../../../../components/log/LogScreen'
import { listLog } from '../../../../data/assistant-log'
import { requireOpsUser } from '../../../../lib/access'
import { parseLogSearch } from '../../../../lib/log-params'
import { signInFor } from '../../../../lib/page-access'
import { requestTime } from '../../../../lib/request-time'

/** Board 111 · Assistant log (T1 Index): every action the Assistant took or proposed, append-only (S06-T04). */
export default async function AssistantLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/assistant/log'))
  const search = parseLogSearch(await searchParams)
  const data = await listLog(search, user, requestTime())
  return <LogScreen data={data} search={search} isOwner={user.role === 'owner'} />
}
