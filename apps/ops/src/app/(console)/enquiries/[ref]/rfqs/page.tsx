import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 137 · RFQs tab (T2). S12 builds it. */
export default async function EnquiriesRefRfqsPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/rfqs`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S12"
      what="Board 137: every supplier RFQ sent, chased, changed or withdrawn."
    />
  )
}
