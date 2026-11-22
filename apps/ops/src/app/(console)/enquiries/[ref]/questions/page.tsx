import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 64 · Questions tab (T2). S14 builds it. */
export default async function EnquiriesRefQuestionsPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/questions`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S14"
      what="Boards 64 and 171: questions to and from the client and suppliers."
    />
  )
}
