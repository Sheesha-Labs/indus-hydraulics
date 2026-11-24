import MailScreen from '../../../../../components/mail/MailScreen'
import { requireOpsUser } from '../../../../../lib/access'
import { parseMailSearch } from '../../../../../lib/mail-params'
import { signInFor } from '../../../../../lib/page-access'
import { mailFolder, recordId, routeParam } from '../../../../../lib/route-params'

/** Board 91 · A thread in the reading pane, with what the Assistant did beside it. */
export default async function MailFolderThreadIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ folder: string; threadId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { folder, threadId } = await params
  const user = await requireOpsUser().catch(signInFor(`/mail/${folder}/${threadId}`))
  const f = routeParam(mailFolder, folder)
  const id = routeParam(recordId, threadId)
  return (
    <MailScreen user={user} folder={f} search={parseMailSearch(await searchParams)} threadId={id} />
  )
}
