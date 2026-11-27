import { MaterialSpecTable, LeadRail } from '../../../../../components/leads/LeadParts'
import { activityText } from '../../../../../data/enquiry-overview'
import { getLead, leadActivityFeed } from '../../../../../data/leads'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { leadRef, routeParam } from '../../../../../lib/route-params'
import { notFound } from 'next/navigation'

/**
 * Board 22 · Material specs (S09-T05): the lines read into the lead with their sources (Why?), spec notes
 * editable inline; the rail carries the lead's facts, its source documents and recent activity.
 */
export default async function LeadSpecsPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = (await params).ref
  await requireOpsUser().catch(signInFor(`/enquiries/leads/${raw}`))
  const ref = routeParam(leadRef, raw)
  const lead = await getLead(ref)
  if (!lead) notFound()
  const all = (await searchParams).all === '1'
  const activity = await leadActivityFeed(lead.id, activityText)
  return (
    <div data-built="lead-specs" className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
      <MaterialSpecTable lead={lead} all={all} />
      <LeadRail lead={lead} activity={activity} />
    </div>
  )
}
