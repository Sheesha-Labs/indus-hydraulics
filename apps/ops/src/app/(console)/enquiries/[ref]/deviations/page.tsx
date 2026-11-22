import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 150 · Deviations tab (T2). S16 builds it. */
export default async function EnquiriesRefDeviationsPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/deviations`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S16"
      what="Board 150: where the offers differ from what the client asked for."
    />
  )
}
