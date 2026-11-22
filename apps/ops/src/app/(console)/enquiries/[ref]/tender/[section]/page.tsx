import { notFound } from 'next/navigation'
import Arrives from '../../../../../../components/skeleton/Arrives'
import { getRecordHeaderState } from '../../../../../../data/cockpit'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { enquiryRef, routeParam, tenderSection } from '../../../../../../lib/route-params'

/** Boards 172–176 · Tender sections (T2, tender kind, C9). S32 builds them. Only a tender has them. */
export default async function EnquiriesRefTenderSectionPage({
  params,
}: {
  params: Promise<{ ref: string; section: string }>
}) {
  const { ref, section } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/tender/${section}`))
  const enquiry = routeParam(enquiryRef, ref)
  routeParam(tenderSection, section)
  // Only a tender has tender sections; S02's stub answers for the ENQ-2026-0001 fixture outside production.
  if (!(await getRecordHeaderState('tender', enquiry))) notFound()
  return (
    <Arrives
      sprint="S32"
      what="Boards 172 to 176: the tender’s timeline, requirements, queries, vendors and bid."
    />
  )
}
