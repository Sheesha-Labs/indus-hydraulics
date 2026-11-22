import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { mailFolder, recordId, routeParam } from '../../../../../lib/route-params'

/** Boards 92/95 · A thread in the reading pane (T3). S05 builds it. */
export default async function MailFolderThreadIdPage({
  params,
}: {
  params: Promise<{ folder: string; threadId: string }>
}) {
  const { folder, threadId } = await params
  await requireOpsUser().catch(signInFor(`/mail/${folder}/${threadId}`))
  routeParam(mailFolder, folder)
  routeParam(recordId, threadId)
  return (
    <Arrives
      sprint="S05"
      what="Boards 92 and 95: the thread, its messages and the Assistant’s note."
    />
  )
}
