import HistoryTab from '../../../../../components/history/HistoryTab'
import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { parseHistorySearch } from '../../../../../lib/history-params'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam, supplierSection } from '../../../../../lib/route-params'

/**
 * Board 129 · A supplier profile section (T7). S10 builds the profile; S06 builds its History section
 * (board 113's RecordHistory over the supplier's company row).
 */
export default async function SuppliersIdSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; section: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id, section } = await params
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}/${section}`))
  const supplierId = routeParam(recordId, id)
  const s = routeParam(supplierSection, section)
  if (s === 'history') {
    return (
      <div className="px-io-page-x py-6">
        <HistoryTab
          scope={{ subjectType: 'company', subjectId: supplierId }}
          noun="supplier"
          path={`/suppliers/${supplierId}/history`}
          search={parseHistorySearch(await searchParams)}
          user={user}
          exportPath={`/api/records/supplier/${supplierId}/history/export`}
        />
      </div>
    )
  }
  return <Arrives sprint="S10" what="Board 129: one section of the supplier’s profile." />
}
