import HistoryTab from '../../../../components/history/HistoryTab'
import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { parseHistorySearch } from '../../../../lib/history-params'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'
import { to } from '../../../../lib/routes'

/**
 * Board 12 · Client profile (T7). S10 builds it; S06 adds its History view (`?view=history`, board 113's
 * RecordHistory over the client's company row).
 */
export default async function ClientsIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const user = await requireOpsUser().catch(signInFor(`/clients/${id}`))
  const clientId = routeParam(recordId, id)
  const raw = await searchParams
  const subnav = (
    <SubNav
      groups={[
        {
          items: [
            { label: 'Overview', href: to(`/clients/${clientId}`) },
            { label: 'History', href: to(`/clients/${clientId}?view=history`) },
          ],
        },
      ]}
    />
  )
  if (raw.view === 'history') {
    return (
      <div className="px-io-page-x py-6">
        <HistoryTab
          scope={{ subjectType: 'company', subjectId: clientId }}
          noun="client"
          path={`/clients/${clientId}`}
          search={parseHistorySearch(raw)}
          user={user}
          exportPath={`/api/records/client/${clientId}/history/export`}
          keep={{ view: 'history' }}
        />
      </div>
    )
  }
  return (
    <SettingsSkeleton
      crumb="Directory · Clients"
      title="Client"
      subnav={subnav}
      sprint="S10"
      what="Board 12: the client’s contacts, enquiries, orders and documents."
    />
  )
}
