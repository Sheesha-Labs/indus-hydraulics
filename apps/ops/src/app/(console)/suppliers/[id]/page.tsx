import { notFound } from 'next/navigation'
import {
  AuthorisedCard,
  BankRail,
  CarryCard,
  ContactsRail,
  DocumentsRail,
  MergedNote,
  RecentCard,
  ReliabilityCard,
  TierCard,
} from '../../../../components/directory/SupplierProfileParts'
import { supplierProfileOnce, supplierRecent } from '../../../../data/suppliers'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'

/**
 * Board 129 · Supplier overview (S10-T03): What they carry, Authorised for and Recent on the left; Reliability (the
 * Assistant's paragraph, or board 133 state 1 "not enough history"), Tier, Contacts, Documents and Bank on the right.
 */
export default async function SuppliersIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}`))
  const supplierId = routeParam(recordId, id)
  const [page, recent] = await Promise.all([
    supplierProfileOnce(supplierId, user),
    supplierRecent(supplierId),
  ])
  if (!page) notFound()
  const isOwner = user.role === 'owner'
  return (
    <div
      className="px-io-page-x grid grid-cols-[minmax(0,1fr)_400px] gap-5 py-6"
      data-built="supplier-overview"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <CarryCard page={page} />
        <AuthorisedCard page={page} />
        <RecentCard items={recent} />
        <MergedNote page={page} />
      </div>
      <aside aria-label="Supplier facts" className="flex flex-col gap-4">
        <ReliabilityCard page={page} />
        <TierCard page={page} isOwner={isOwner} />
        <ContactsRail page={page} />
        <DocumentsRail page={page} />
        <BankRail page={page} isOwner={isOwner} />
      </aside>
    </div>
  )
}
