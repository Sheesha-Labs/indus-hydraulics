import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam, supplierSection } from '../../../../../lib/route-params'

/** Board 129 · A supplier profile section (T7). S10 builds it. */
export default async function SuppliersIdSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>
}) {
  const { id, section } = await params
  await requireOpsUser().catch(signInFor(`/suppliers/${id}/${section}`))
  routeParam(recordId, id)
  routeParam(supplierSection, section)
  return <Arrives sprint="S10" what="Board 129: one section of the supplier’s profile." />
}
