import { T2Record } from '@indus/ops-ui/templates'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ConvertLeadModal } from '../../../../../components/leads/LeadClient'
import { LeadHeader } from '../../../../../components/leads/LeadParts'
import { activeOwners } from '../../../../../data/enquiry-overview'
import { getLead } from '../../../../../data/leads'
import { leadRef, routeParam } from '../../../../../lib/route-params'
import { nextEnquiryRef, UNCATEGORISED } from '../../../../../server/lead/convert'

/**
 * Board 22 · Lead detail (T2, lead variant; S09-T05): the lead header with its four tabs around the tab pages,
 * and board 23's convert modal, opened by ?convert=1. Not an authorization boundary: every page calls
 * requireOpsUser() itself.
 */
export default async function LeadLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ ref: string }>
}) {
  const ref = routeParam(leadRef, (await params).ref)
  const lead = await getLead(ref)
  if (!lead) notFound()
  const [owners, nextRef] = [await activeOwners(), await nextEnquiryRef()]
  const by = new Map<string, { key: string; label: string; count: number }>()
  for (const l of lead.lines) {
    const key = l.tradeId ?? UNCATEGORISED
    const cur = by.get(key) ?? { key, label: l.trade ?? 'Uncategorised', count: 0 }
    cur.count += 1
    by.set(key, cur)
  }
  return (
    <T2Record header={<LeadHeader lead={lead} />} strip={null}>
      {children}
      {lead.stage === 'converted' || lead.stage === 'dropped' ? null : (
        <ConvertLeadModal
          m={{
            leadId: lead.id,
            leadRef: lead.ref,
            nextRef,
            clientRef: lead.clientRef,
            deadline: lead.neededBy ? lead.neededBy.toISOString().slice(0, 10) : null,
            ownerId: lead.owner?.id ?? null,
            owners,
            categories: [...by.values()],
            total: lead.lines.length,
          }}
        />
      )}
    </T2Record>
  )
}
