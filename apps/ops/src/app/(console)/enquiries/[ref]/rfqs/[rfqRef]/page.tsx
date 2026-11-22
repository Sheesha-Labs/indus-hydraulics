import Arrives from '../../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { enquiryRef, rfqRef as rfqRefParam, routeParam } from '../../../../../../lib/route-params'

/** Boards 135–136 · One RFQ group (T2). S12 builds it. */
export default async function EnquiriesRefRfqsRfqRefPage({
  params,
}: {
  params: Promise<{ ref: string; rfqRef: string }>
}) {
  const { ref, rfqRef } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/rfqs/${rfqRef}`))
  routeParam(enquiryRef, ref)
  routeParam(rfqRefParam, rfqRef)
  return (
    <Arrives
      sprint="S12"
      what="Boards 135, 136 and 63: one IH-RFQ group’s drafts, send plan and preview."
    />
  )
}
