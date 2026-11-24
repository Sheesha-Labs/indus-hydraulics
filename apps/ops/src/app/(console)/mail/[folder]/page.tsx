import MailScreen from '../../../../components/mail/MailScreen'
import UnsurePile from '../../../../components/mail/UnsurePile'
import { folderCounts, listUnsure } from '../../../../data/mail'
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
  if (f === 'unsure') {
    // Board 94: the Unsure pile is a page of its own, not the three-pane list.
    const [items, counts] = await Promise.all([listUnsure(), folderCounts()])
    return <UnsurePile items={items} today={counts.today} />
  }
  return <MailScreen user={user} folder={f} search={parseMailSearch(await searchParams)} />
}
