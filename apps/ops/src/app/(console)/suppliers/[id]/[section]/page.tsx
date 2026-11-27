import { EmptyState } from '@indus/ops-ui/states'
import { notFound } from 'next/navigation'
import { ContactsEditor } from '../../../../../components/directory/DirectoryEditors'
import { DocumentsRail } from '../../../../../components/directory/SupplierProfileParts'
import LineCardSection from '../../../../../components/directory/LineCardSection'
import HistoryTab from '../../../../../components/history/HistoryTab'
import { supplierLessons, supplierProfileOnce } from '../../../../../data/suppliers'
import { requireOpsUser } from '../../../../../lib/access'
import { parseHistorySearch } from '../../../../../lib/history-params'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam, supplierSection } from '../../../../../lib/route-params'

/**
 * Board 129 · one supplier section (S10-T03): Contacts (add, prefer, remove; directory listings never receive mail),
 * Documents, Notes and lessons, the Line card (S10-T06) and History (S06). RFQs and quotes, Prices and Orders fill
 * in with S12, S16 and S24 and show what they will hold until then.
 */
const LATER: Record<string, { title: string; text: string }> = {
  quotes: {
    title: 'No RFQs or quotes yet',
    text: 'Every RFQ sent to this supplier and every quote captured from them will list here (S12, S15).',
  },
  prices: {
    title: 'No prices yet',
    text: 'Prices quoted by this supplier, by part, appear once quotes are captured (S16).',
  },
  orders: {
    title: 'No purchase orders yet',
    text: 'Supplier POs, their ready dates and deliveries list here once orders start (S24).',
  },
}

export default async function SuppliersIdSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; section: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id, section } = await params
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}/${section}`))
  const supplierId = routeParam(recordId, id)
  const s = routeParam(supplierSection, section)
  if (s === 'history') {
    return (
      <div className="px-io-page-x py-6">
        <HistoryTab
          scope={{ subjectType: 'company', subjectId: supplierId }}
          noun="supplier"
          path={`/suppliers/${supplierId}/history`}
          search={parseHistorySearch(await searchParams)}
          user={user}
          exportPath={`/api/records/supplier/${supplierId}/history/export`}
        />
      </div>
    )
  }
  const page = await supplierProfileOnce(supplierId, user)
  if (!page) notFound()
  const body =
    s === 'contacts' ? (
      <ContactsEditor
        companyId={supplierId}
        contacts={page.contacts}
        roles={['Sales', 'Accounts', 'Quality', 'Logistics']}
      />
    ) : s === 'documents' ? (
      <DocumentsRail page={page} />
    ) : s === 'notes' ? (
      <Lessons supplierId={supplierId} />
    ) : s === 'line-card' ? (
      <LineCardSection supplierId={supplierId} />
    ) : (
      <EmptyState title={LATER[s]!.title} text={LATER[s]!.text} align="left" />
    )
  return (
    <div className="px-io-page-x max-w-[960px] py-6" data-built={`supplier-${s}`}>
      {body}
    </div>
  )
}

async function Lessons({ supplierId }: { supplierId: string }) {
  const lessons = await supplierLessons(supplierId)
  if (!lessons.length)
    return (
      <EmptyState
        title="No notes or lessons yet"
        text="Lessons recorded on orders and claims for this supplier collect here."
        align="left"
      />
    )
  return (
    <ul className="bg-io-card border-io-line rounded-io-card m-0 list-none border p-0">
      {lessons.map((l) => (
        <li key={l.id} className="border-io-line border-b px-5 py-3.5 text-[13px] last:border-b-0">
          <p className="m-0">{l.text}</p>
          <p className="text-io-ink-3 m-0 mt-1 text-[12px]">{l.at}</p>
        </li>
      ))}
    </ul>
  )
}
