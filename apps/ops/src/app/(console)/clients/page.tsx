import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 11 · Clients (T1 Index). S10 builds it; S02-T07 placeholder. */
export default async function ClientsPage() {
  await requireOpsUser().catch(signInFor(`/clients`))
  return (
    <IndexSkeleton
      crumb="Directory"
      title="Clients"
      sprint="S10"
      what="Board 11: every client with open enquiries, orders and what they owe."
    />
  )
}
