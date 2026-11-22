import Arrives from '../../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { enquiryRef, quotationRev, routeParam } from '../../../../../../lib/route-params'

/** Board 159 · A quotation revision (T2). S23 builds it. */
export default async function EnquiriesRefQuotationRevPage({
  params,
}: {
  params: Promise<{ ref: string; rev: string }>
}) {
  const { ref, rev } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/quotation/${rev}`))
  routeParam(enquiryRef, ref)
  routeParam(quotationRev, rev)
  return <Arrives sprint="S23" what="Board 159: one revision of the quotation and what changed." />
}
