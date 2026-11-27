import { Card, type KVPair } from '@indus/ops-ui/card'
import type { EnquiryCockpit } from '../../data/enquiry-cockpit'
import { fmtDay } from '../../data/enquiry-cockpit'

/**
 * The enquiry cockpit's 330 rail (S09-T01): the record's facts from the one cockpit read, and the proposals
 * waiting for a person. Server-rendered; it keeps its place across tabs.
 */
export default function EnquiryRail({ c }: { c: EnquiryCockpit }) {
  const n = c.counts
  const lines: string[] = []
  if (n.held) lines.push(`${n.held} on hold`)
  if (n.noSource) lines.push(`${n.noSource} no source`)
  if (n.toFollow) lines.push(`${n.toFollow} to follow`)
  const pairs: KVPair[] = [
    { label: 'Owner', value: c.ownerInitials ?? 'Not set' },
    { label: 'Contact', value: c.contactName ?? '—' },
    {
      label: 'Lines',
      value: String(n.linesTotal),
      ...(lines.length ? { sub: lines.join(' · ') } : {}),
    },
    { label: 'RFQs sent', value: String(n.rfqsSent) },
    { label: 'Quotes in', value: String(n.quotesCaptured) },
    { label: 'Revert by', value: c.revertBy ? fmtDay(c.revertBy) : '—' },
    { label: 'Decision by', value: c.decisionBy ? fmtDay(c.decisionBy) : '—' },
  ]
  return (
    <div data-part="enquiry-rail" className="flex flex-col gap-3">
      <Card eyebrow="Record facts" pairs={pairs} kvLabelWidth={110} />
      <Card
        eyebrow="Waiting for you"
        text={
          c.pending === 0
            ? 'Nothing on this enquiry is waiting in Review.'
            : `${c.pending} proposal${c.pending === 1 ? '' : 's'} on this enquiry ${c.pending === 1 ? 'is' : 'are'} in Review.`
        }
        {...(c.pending
          ? {
              link: {
                label: 'Open Review',
                href: `/review?record=${encodeURIComponent(`enquiry:${c.id}`)}`,
              },
            }
          : {})}
      />
    </div>
  )
}
