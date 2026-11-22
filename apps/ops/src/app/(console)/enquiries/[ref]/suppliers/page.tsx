import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 134 · Suppliers tab (T2). S12 builds it. */
export default async function EnquiriesRefSuppliersPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/suppliers`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives sprint="S12" what="Board 134: suppliers for each line, and the gaps research fills." />
  )
}
