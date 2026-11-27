import { notFound } from 'next/navigation'
import { BlockForm, UnblockForm } from '../../../../../components/directory/TrustForms'
import { blockData } from '../../../../../data/supplier-trust'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/**
 * Board 131 · Block a supplier (S10-T07, a ConfirmDialog page): the reason, the evidence, and the effects on open work
 * listed before confirming, ending "Nothing is sent to the supplier." Unblock (`?unblock=1`) is the Owner's.
 */
export default async function BlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}/block`))
  const supplierId = routeParam(recordId, id)
  const d = await blockData(supplierId)
  if (!d) notFound()
  const unblock = (await searchParams).unblock === '1'
  const e = d.effects
  return (
    <div className="px-io-page-x flex justify-center py-8" data-built="supplier-block">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="block-title"
        className="bg-io-card border-io-line rounded-io-dialog shadow-io-e2 w-full max-w-[560px] border px-6 py-5"
      >
        {unblock && d.tier === 'blocked' ? (
          <>
            <h2 id="block-title" className="m-0 text-[17px] font-semibold">
              Unblock {d.name}
            </h2>
            <p className="text-io-ink-2 m-0 mt-2 text-[13px]">
              Blocked {d.blockedAt} · {d.blockReason?.replace(/_/g, ' ')}. The block stays on
              record.
            </p>
            <div className="mt-4">
              {user.role === 'owner' ? (
                <UnblockForm supplierId={supplierId} />
              ) : (
                <p className="m-0 text-[13px]">Only Krishan lifts a block.</p>
              )}
            </div>
          </>
        ) : d.tier === 'blocked' ? (
          <h2 id="block-title" className="m-0 text-[17px] font-semibold">
            {d.name} is already blocked
          </h2>
        ) : (
          <>
            <h2 id="block-title" className="text-io-bad m-0 text-[17px] font-semibold">
              Block {d.name}
            </h2>
            <div
              className="bg-io-paper rounded-io-card border-io-line mt-3 border px-4 py-3 text-[12.5px]"
              data-part="block-effects"
            >
              <p className="io-eyebrow m-0 mb-1.5">What happens</p>
              <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
                <li>Never suggested again; RFQ drafts adding them are stopped</li>
                <li>
                  {e.draftRecipients.length} draft RFQ recipient
                  {e.draftRecipients.length === 1 ? '' : 's'} removed
                </li>
                <li>
                  {e.sentRfqs.length} sent RFQ{e.sentRfqs.length === 1 ? '' : 's'} marked to
                  withdraw
                </li>
                <li>
                  {e.pos.length} open PO{e.pos.length === 1 ? '' : 's'} stay, flagged
                </li>
                <li>
                  {e.payments} payment{e.payments === 1 ? '' : 's'} will need a call-back
                </li>
                <li>Nothing is sent to the supplier.</li>
              </ul>
            </div>
            <div className="mt-4">
              <BlockForm supplierId={supplierId} name={d.name} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
