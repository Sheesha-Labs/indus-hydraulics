import HistoryTab from '../../../../../components/history/HistoryTab'
import Arrives from '../../../../../components/skeleton/Arrives'
import { enquiryIdForRef } from '../../../../../data/history'
import { requireOpsUser } from '../../../../../lib/access'
import { parseHistorySearch } from '../../../../../lib/history-params'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/**
 * Board 113 · the enquiry's Activity tab (T2): Timeline | History. History is S06's RecordHistory over every
 * change on the enquiry and the records under it. (decision) History is the default view until S09 builds
 * the Timeline, so the tab never opens on a placeholder; S09 flips the default.
 */
export default async function EnquiriesRefActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { ref } = await params
  const user = await requireOpsUser().catch(signInFor(`/enquiries/${ref}/activity`))
  const r = routeParam(enquiryRef, ref)
  const search = parseHistorySearch(await searchParams)
  const path = `/enquiries/${r}/activity`
  if (search.view === 'timeline') {
    return (
      <Arrives
        sprint="S09"
        what="Board 113: the enquiry’s timeline of mail, tasks and decisions."
      />
    )
  }
  const enquiryId = await enquiryIdForRef(r)
  return (
    <HistoryTab
      scope={enquiryId ? { subjectType: 'enquiry', subjectId: enquiryId, enquiryId } : null}
      noun="enquiry"
      path={path}
      search={search}
      user={user}
      exportPath={`/api/records/enquiry/${r}/history/export`}
      timeline
    />
  )
}
