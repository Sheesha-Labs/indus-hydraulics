import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'
import { to } from '../../../../lib/routes'

/** Board 12 · Client profile (T7). S10 builds it. */
export default async function ClientsIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/clients/${id}`))
  routeParam(recordId, id)
  return (
    <SettingsSkeleton
      crumb="Directory · Clients"
      title="Client"
      subnav={<SubNav groups={[{ items: [{ label: 'Overview', href: to(`/clients/${id}`) }] }]} />}
      sprint="S10"
      what="Board 12: the client’s contacts, enquiries, orders and documents."
    />
  )
}
