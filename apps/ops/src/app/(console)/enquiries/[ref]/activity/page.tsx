import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 113 · Activity tab (T2). S06 builds it. */
export default async function EnquiriesRefActivityPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/activity`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives sprint="S06" what="Board 113: the record’s timeline and its history of changes." />
  )
}
