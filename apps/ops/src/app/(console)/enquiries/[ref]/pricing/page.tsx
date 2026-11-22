import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Boards 154–155 · Pricing tab (T2). S17 builds it. */
export default async function EnquiriesRefPricingPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/pricing`))
  routeParam(enquiryRef, ref)
  return <Arrives sprint="S17" what="Boards 154 and 155: margins, FX and the price of each line." />
}
