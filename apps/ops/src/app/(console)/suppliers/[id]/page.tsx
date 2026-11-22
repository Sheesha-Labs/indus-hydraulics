import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'

/** Boards 126/129 · Supplier overview (T7 profile). S10 builds it. */
export default async function SuppliersIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/suppliers/${id}`))
  routeParam(recordId, id)
  return (
    <Arrives
      sprint="S10"
      what="Boards 126 and 129: who the supplier is, what it sells and how it has done."
    />
  )
}
