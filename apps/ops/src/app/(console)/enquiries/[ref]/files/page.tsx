import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Files tab (T2). S11 builds it. */
export default async function EnquiriesRefFilesPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/files`))
  routeParam(enquiryRef, ref)
  return (
    <Arrives
      sprint="S11"
      what="Every file on the enquiry: the client’s, the suppliers’ and ours."
    />
  )
}
