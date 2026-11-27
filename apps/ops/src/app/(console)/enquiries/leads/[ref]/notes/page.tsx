import { notFound } from 'next/navigation'
import { NotesEditor } from '../../../../../../components/leads/LeadClient'
import { getLead } from '../../../../../../data/leads'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { leadRef, routeParam } from '../../../../../../lib/route-params'

/** Board 22 · Notes (S09-T05): free notes on the lead; they move to the enquiry's activity on convert. */
export default async function LeadNotesPage({ params }: { params: Promise<{ ref: string }> }) {
  const raw = (await params).ref
  await requireOpsUser().catch(signInFor(`/enquiries/leads/${raw}/notes`))
  const lead = await getLead(routeParam(leadRef, raw))
  if (!lead) notFound()
  return (
    <section
      data-built="lead-notes"
      aria-label="Notes"
      className="bg-io-card border-io-line rounded-io-card max-w-[760px] border p-5"
    >
      <NotesEditor leadId={lead.id} leadRef={lead.ref} version={lead.version} value={lead.notes} />
    </section>
  )
}
