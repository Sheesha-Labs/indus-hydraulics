import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { mailFolder, routeParam } from '../../../../lib/route-params'

/** Boards 91/94 · A mail folder (T3; the folder rail is mail/layout.tsx). S05 builds it. */
export default async function MailFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params
  await requireOpsUser().catch(signInFor(`/mail/${folder}`))
  routeParam(mailFolder, folder)
  return (
    <Arrives
      sprint="S05"
      what="Boards 91 and 94: pick a thread to read it here, with what the Assistant noticed."
    />
  )
}
