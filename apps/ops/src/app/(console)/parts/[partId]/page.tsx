import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'
import { to } from '../../../../lib/routes'

/** Boards 163–166 · Part (T7). S29 builds it. */
export default async function PartsPartIdPage({ params }: { params: Promise<{ partId: string }> }) {
  const { partId } = await params
  await requireOpsUser().catch(signInFor(`/parts/${partId}`))
  routeParam(recordId, partId)
  return (
    <SettingsSkeleton
      crumb="Directory · Parts"
      title="Part"
      subnav={
        <SubNav groups={[{ items: [{ label: 'Overview', href: to(`/parts/${partId}`) }] }]} />
      }
      sprint="S29"
      what="Boards 163 to 166: one part’s equivalents, prices and history."
    />
  )
}
