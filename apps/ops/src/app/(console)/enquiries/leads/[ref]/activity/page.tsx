import { notFound } from 'next/navigation'
import { activityText } from '../../../../../../data/enquiry-overview'
import { getLead, leadActivity } from '../../../../../../data/leads'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { leadRef, routeParam } from '../../../../../../lib/route-params'

const TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** Board 22 · Activity (S09-T05): every change on the lead, newest first, with who made it. */
export default async function LeadActivityPage({ params }: { params: Promise<{ ref: string }> }) {
  const raw = (await params).ref
  await requireOpsUser().catch(signInFor(`/enquiries/leads/${raw}/activity`))
  const lead = await getLead(routeParam(leadRef, raw))
  if (!lead) notFound()
  const rows = await leadActivity(lead.id, 100)
  return (
    <ol
      data-built="lead-activity"
      className="bg-io-card border-io-line rounded-io-card m-0 flex list-none flex-col border p-0"
    >
      {rows.length === 0 ? (
        <li className="text-io-ink-3 px-5 py-4 text-[12.5px]">Nothing recorded yet.</li>
      ) : (
        rows.map((a) => (
          <li
            key={a.id}
            className="border-io-line flex gap-4 border-b px-5 py-3 text-[12.5px] last:border-b-0"
          >
            <time dateTime={a.at.toISOString()} className="text-io-ink-3 w-[120px] flex-none">
              {TIME.format(a.at).replace('Sept', 'Sep')}
            </time>
            <span className="text-io-ink-3 w-8 flex-none">{a.initials ?? 'AI'}</span>
            <span>{activityText(a)}</span>
          </li>
        ))
      )}
    </ol>
  )
}
