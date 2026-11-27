import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import EnquiryRail from '../../../../components/record/EnquiryRail'
import RecordCockpit from '../../../../components/record/RecordCockpit'
import StateRecordHeader, {
  RecordRailSkeleton,
  RecordStrip,
} from '../../../../components/record/StateRecordHeader'
import { getRecordHeaderState } from '../../../../data/cockpit'
import { getEnquiryCockpit } from '../../../../data/enquiry-cockpit'
import { requireOpsUser } from '../../../../lib/access'
import { enquiryRef, routeParam } from '../../../../lib/route-params'

/**
 * The enquiry cockpit (T2, 05 §6.2): RecordHeader with the eleven enquiry tabs (C8), the Assistant strip and
 * the rail, around the tab pages. S09-T01: one cached cockpit read (two statements) gives the header, the
 * strip and the rail; every tab page reading it again costs nothing. The header's primary comes from
 * resolveEnquiryHeader per tab (Questions asks for a question). A tender (C9) shows the tender header on
 * `tender/*`.
 *
 * Not an authorization boundary (CLAUDE.md §4.2): every tab page calls requireOpsUser() itself. The layout
 * reads the viewer only to choose what the header offers (a Helper has no Reopen) and to mask the rail.
 *
 * Outside production, ENQ-2026-0001 without a row is the S02 neutral fixture, so the route skeleton keeps a
 * record to render; in production an unknown ref is notFound() (board 211's "not imported" state).
 */
export default async function EnquiryLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ ref: string }>
}) {
  const ref = routeParam(enquiryRef, (await params).ref)
  const viewer = await requireOpsUser().catch(() => null)
  const c = await getEnquiryCockpit(ref, viewer?.role ?? 'helper', viewer?.canSeeMargins ?? false)
  if (!c) {
    const [state, tender] = [
      await getRecordHeaderState('enquiry', ref),
      await getRecordHeaderState('tender', ref),
    ]
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
  const overview = c.header('overview')
  // C9: a tender shows its own header on tender/*. Not a tender: the S02 sample outside production.
  const tender = c.isTender ? overview : await getRecordHeaderState('tender', ref)
  return (
    <RecordCockpit
      header={<StateRecordHeader state={overview} />}
      {...(tender ? { tenderHeader: <StateRecordHeader state={tender} /> } : {})}
      tabHeaders={{ questions: <StateRecordHeader state={c.header('questions')} /> }}
      strip={<RecordStrip state={overview} />}
      rail={<EnquiryRail c={c} />}
      bleed={['quotation']}
      // Overview (board 05/167) and Questions (171) draw their own rails beside the tab body.
      wide={['activity', '', 'questions']}
    >
      {children}
    </RecordCockpit>
  )
}
