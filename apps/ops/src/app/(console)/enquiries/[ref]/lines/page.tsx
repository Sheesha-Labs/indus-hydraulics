import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Lines tab (T2). S09 builds it. */
export default async function EnquiriesRefLinesPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/lines`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S09"
      what="Boards 164 and 169: the client’s lines, quantities and what each still needs."
    />
  )
}
