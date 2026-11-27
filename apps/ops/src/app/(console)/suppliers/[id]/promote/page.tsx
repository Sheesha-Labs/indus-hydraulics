import { notFound } from 'next/navigation'
import { Mark } from '../../../../../components/directory/SupplierProfileParts'
import { PromoteButton } from '../../../../../components/directory/TrustForms'
import { promoteData } from '../../../../../data/supplier-trust'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/**
 * Board 130 · Promote a supplier (S10-T07): the checklist with its evidence (Contact only → Trial), the Trial →
 * Approved suggestion after good POs, and → Principal through the onboarding wizard. The card goes to Review for
 * Krishan (Draft and ask): promotion is never done here.
 */
export default async function PromotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/suppliers/${id}/promote`))
  const supplierId = routeParam(recordId, id)
  const d = await promoteData(supplierId)
  if (!d) notFound()
  const to = d.tier === 'trial' ? 'approved' : 'trial'
  return (
    <div className="px-io-page-x max-w-[760px] py-6" data-built="supplier-promote">
      <section
        aria-label="Promotion checklist"
        className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
      >
        <h2 className="io-eyebrow m-0 mb-3">
          {d.tier === 'trial' ? 'Trial → Approved' : 'Contact only → Trial'}
        </h2>
        <ul className="m-0 list-none p-0">
          {d.rows.map((r) => (
            <li
              key={r.key}
              className="border-io-line flex items-center gap-3 border-t py-2.5 text-[13px] first:border-t-0"
            >
              <Mark tone={r.mark === 'ok' ? 'ok' : r.mark === 'bad' ? 'bad' : 'n'} />
              {r.text}
            </li>
          ))}
        </ul>
        {d.tier === 'approved' || d.tier === 'principal' ? (
          <p className="m-0 mt-3 text-[13px]">
            To make the supplier a Principal, set it up through{' '}
            <a
              href={`/suppliers/new/${supplierId}/company`}
              className="io-focus rounded-io-tag text-io-accent"
            >
              New supplier
            </a>{' '}
            (documents, vetting and the line card).
          </p>
        ) : d.tier === 'blocked' ? (
          <p className="text-io-bad m-0 mt-3 text-[13px]">A blocked supplier is unblocked first.</p>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              {d.open
                ? `Card ${d.open.ref} is waiting in Review.`
                : 'Krishan approves the promotion in Review.'}
            </p>
            <PromoteButton
              supplierId={supplierId}
              to={to}
              disabled={!!d.open || d.rows.some((r) => r.mark === 'bad')}
              label={to === 'trial' ? `Promote ${d.name} to Trial` : 'Suggest Approved'}
            />
          </div>
        )}
      </section>
    </div>
  )
}
