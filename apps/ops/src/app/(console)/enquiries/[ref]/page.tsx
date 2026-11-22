import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../lib/route-params'

/** Board 05 · Enquiry overview (T2, Overview tab). S09 builds it. */
export default async function EnquiriesRefPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S09"
      what="Board 05: the enquiry’s lines, client, deadline and what happens next."
    />
  )
}
