import { Card } from '@indus/ops-ui/card'
import { EmptyState } from '@indus/ops-ui/states'
import type { Route } from 'next'
import Link from 'next/link'
import { AckSkipped } from '../../../../components/enquiry/AckStates'
import HeaderFactsEditor from '../../../../components/enquiry/HeaderFactsEditor'
import {
  ActivityRail,
  CoverageCard,
  EstimateCard,
  LineTable,
  RfqCard,
  type LineFilter,
} from '../../../../components/enquiry/OverviewParts'
import { activeOwners, getEnquiryOverview } from '../../../../data/enquiry-overview'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../lib/route-params'

const DAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const day = (d: Date | null) => (d ? DAY.format(d).replace('Sept', 'Sep') : '—')
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)

/**
 * Board 05 · Enquiry Overview (T2, Overview tab; S09-T03): the line table is the spine; the rail carries
 * Coverage, the C38 estimate snapshot (masked for a Helper without canSeeMargins, in the data layer), the
 * supplier RFQs, the activity and the header facts with their editor. The header's primary comes from the
 * cockpit. Board 167's qualification card takes the line table's place while the path is open (S09-T06).
 */
export default async function EnquiryOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { ref } = await params
  const user = await requireOpsUser().catch(signInFor(`/enquiries/${ref}`))
  routeParam(enquiryRef, ref)
  const sp = await searchParams
  const raw = Array.isArray(sp.lines) ? sp.lines[0] : sp.lines
  const filter: LineFilter = raw === 'awaiting' || raw === 'multi' ? raw : 'all'
  const o = await getEnquiryOverview(ref, user)
  if (!o)
    return (
      <EmptyState
        title="This enquiry has no lines on record"
        text="The sample record in this environment has no database row. Enquiries created from mail, uploads or typed lines open here with their lines."
        align="left"
      />
    )
  const owners = await activeOwners()
  const owner = owners.find((x) => x.id === o.ownerId)
  return (
    <div
      data-built="enquiry-overview"
      className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-4"
    >
      <div className="flex min-w-0 flex-col gap-4">
        {o.ackSkipped ? (
          <AckSkipped text={o.ackSkipped.text} preferenceHref="/assistant/learned" />
        ) : null}
        {o.questions ? (
          <p className="text-io-ink-2 m-0 text-[12.5px]">
            {o.questions} line question{o.questions === 1 ? '' : 's'} wait in{' '}
            <Link
              href={`/review?record=${encodeURIComponent(`enquiry:${o.id}`)}` as Route}
              className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
            >
              Review
            </Link>
            .
          </p>
        ) : null}
        <LineTable
          o={o}
          filter={filter}
          hrefFor={(f) => (f === 'all' ? `/enquiries/${o.ref}` : `/enquiries/${o.ref}?lines=${f}`)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <CoverageCard o={o} />
        <EstimateCard o={o} />
        <RfqCard o={o} />
        <ActivityRail items={o.activity} />
        <Card
          eyebrow="Record facts"
          pairs={[
            { label: 'Title', value: o.title },
            { label: 'Client ref', value: o.clientRef ?? '—' },
            { label: 'Deadline', value: day(o.deadline) },
            { label: 'Decision by', value: day(o.decisionBy) },
            { label: 'Owner', value: owner?.initials ?? 'Not set' },
          ]}
          kvLabelWidth={110}
        >
          <div>
            <HeaderFactsEditor
              enquiryId={o.id}
              enquiryRef={o.ref}
              version={o.version}
              owners={owners}
              value={{
                title: o.title,
                clientRef: o.clientRef,
                deadline: iso(o.deadline),
                decisionBy: iso(o.decisionBy),
                ownerId: o.ownerId,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
