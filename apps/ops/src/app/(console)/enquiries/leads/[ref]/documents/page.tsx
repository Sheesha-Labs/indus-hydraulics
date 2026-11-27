import { EmptyState } from '@indus/ops-ui/states'
import { notFound } from 'next/navigation'
import { getLead } from '../../../../../../data/leads'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { leadRef, routeParam } from '../../../../../../lib/route-params'

/** Board 22 · Documents (S09-T05): the files read into this lead, with how many lines each gave. */
export default async function LeadDocumentsPage({ params }: { params: Promise<{ ref: string }> }) {
  const raw = (await params).ref
  await requireOpsUser().catch(signInFor(`/enquiries/leads/${raw}/documents`))
  const lead = await getLead(routeParam(leadRef, raw))
  if (!lead) notFound()
  if (!lead.documents.length)
    return (
      <EmptyState
        title="No documents yet"
        text="Upload the client’s files with “Upload more files” and place their lines on this lead."
        align="left"
      />
    )
  return (
    <ul
      data-built="lead-documents"
      className="bg-io-card border-io-line rounded-io-card m-0 flex list-none flex-col border p-0"
    >
      {lead.documents.map((d) => (
        <li
          key={d.id}
          className="border-io-line flex items-center gap-3 border-b px-5 py-3.5 last:border-b-0"
        >
          <span
            aria-hidden="true"
            className="io-hatch border-io-line rounded-io-tag h-9 w-8 flex-none border"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium">{d.filename}</span>
            <span className="text-io-ink-3 text-[12px]">
              {d.kind.toUpperCase()} ·{' '}
              {d.linesFound ? `${d.linesFound} lines read · ${d.linesKept} kept` : 'no lines'}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
