import Arrives from '../../../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../../../lib/access'
import { signInFor } from '../../../../../../../lib/page-access'
import { enquiryRef, recordId, routeParam } from '../../../../../../../lib/route-params'

/** Boards 122–124 · Supplier research for one gap (T2). S13 builds it. */
export default async function EnquiriesRefSuppliersResearchGapIdPage({
  params,
}: {
  params: Promise<{ ref: string; gapId: string }>
}) {
  const { ref, gapId } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/suppliers/research/${gapId}`))
  routeParam(enquiryRef, ref)
  routeParam(recordId, gapId)
  return (
    <Arrives
      sprint="S13"
      what="Boards 122 to 124: the Assistant’s research for suppliers of one gap."
    />
  )
}
