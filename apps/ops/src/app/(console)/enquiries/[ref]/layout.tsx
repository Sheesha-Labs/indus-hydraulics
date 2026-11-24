import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import RecordCockpit from '../../../../components/record/RecordCockpit'
import StateRecordHeader, {
  RecordRailSkeleton,
  RecordStrip,
} from '../../../../components/record/StateRecordHeader'
import { getRecordHeaderState } from '../../../../data/cockpit'
import { enquiryRef, routeParam } from '../../../../lib/route-params'

/**
 * The enquiry cockpit (T2, 05 §6.2): RecordHeader with the eleven enquiry tabs (C8), the Assistant strip
 * and the rail, around the tab pages. The header read is React-cached, so a tab page asking again costs
 * nothing. A reference that does not parse, or has no record, is notFound(): the enquiries segment's
 * not-found shows board 211's "not imported" state. In production the S02 stub returns null, so every
 * enquiry 404s until S09 reads the database.
 *
 * Not an authorization boundary (CLAUDE.md §4.2): every tab page calls requireOpsUser() itself.
 *
 * Tender (C9): the stub answers per kind, so the layout asks for both and the cockpit shows the tender
 * header (TENDER_TABS) on `tender/*`. S09's single read returns the record's own kind instead.
 */
export default async function EnquiryLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ ref: string }>
}) {
  const ref = routeParam(enquiryRef, (await params).ref)
  const [state, tender] = await Promise.all([
    getRecordHeaderState('enquiry', ref),
    getRecordHeaderState('tender', ref),
  ])
  if (!state) notFound()
  return (
    <RecordCockpit
      header={<StateRecordHeader state={state} />}
      {...(tender ? { tenderHeader: <StateRecordHeader state={tender} /> } : {})}
      strip={<RecordStrip state={state} />}
      rail={<RecordRailSkeleton />}
      bleed={['quotation']}
      wide={['activity']}
    >
      {children}
    </RecordCockpit>
  )
}
