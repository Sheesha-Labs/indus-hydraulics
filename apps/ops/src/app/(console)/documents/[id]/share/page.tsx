import SubNav from '../../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'
import { to } from '../../../../../lib/routes'

/** Board 232 · Sharing controls (T7). S18 builds it. */
export default async function DocumentsIdSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/documents/${id}/share`))
  routeParam(recordId, id)
  return (
    <SettingsSkeleton
      crumb="Documents"
      title="Sharing"
      subnav={
        <SubNav groups={[{ items: [{ label: 'Sharing', href: to(`/documents/${id}/share`) }] }]} />
      }
      sprint="S18"
      what="Board 232: who a client document is shared with, its link and its expiry."
    />
  )
}
