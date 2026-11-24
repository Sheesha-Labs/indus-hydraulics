import MailScreen from '../../../../components/mail/MailScreen'
import { requireOpsUser } from '../../../../lib/access'
import { parseMailSearch } from '../../../../lib/mail-params'
import { signInFor } from '../../../../lib/page-access'
import { mailFolder, routeParam } from '../../../../lib/route-params'

/** Board 91 · A mail folder: the rail, the folder's threads, and "Pick a thread". */
export default async function MailFolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ folder: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { folder } = await params
  const user = await requireOpsUser().catch(signInFor(`/mail/${folder}`))
  const f = routeParam(mailFolder, folder)
  return <MailScreen user={user} folder={f} search={parseMailSearch(await searchParams)} />
}
