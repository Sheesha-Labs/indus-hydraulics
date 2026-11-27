import { Chip } from '@indus/ops-ui/status'
import { notFound } from 'next/navigation'
import { Mark } from '../../../../../../components/directory/SupplierProfileParts'
import { BankChangeCallback } from '../../../../../../components/directory/TrustForms'
import { bankChangeData } from '../../../../../../data/supplier-trust'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../../lib/route-params'

/**
 * Board 132 · Bank-detail change (S10-T07, C21): the email (text only), its flags, the account on file and the one
 * requested (bank and last 4 only), the number on file and the numbers in the email marked "do not use", and the
 * Owner's call-back. Genuine → verified with the 24 h cooling-off; not genuine → rejected, the old account stays,
 * and a warning to the address on file is drafted for Review. Payments stay blocked meanwhile (canPaySupplier).
 */
export default async function BankChangePage({
  params,
}: {
  params: Promise<{ id: string; accountId: string }>
}) {
  const { id, accountId } = await params
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}/bank-change/${accountId}`))
  const supplierId = routeParam(recordId, id)
  const d = await bankChangeData(supplierId, routeParam(recordId, accountId))
  if (!d) notFound()
  return (
    <div
      className="px-io-page-x grid grid-cols-[minmax(0,1fr)_440px] gap-5 py-6"
      data-built="bank-change"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <section
          aria-label="The email"
          className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="io-eyebrow m-0">The email</h2>
            <Chip
              tone={d.risk === 'high' ? 'bad' : 'warn'}
              label={d.risk === 'high' ? 'High risk' : 'Check'}
            />
          </div>
          {d.email ? (
            <div className="bg-io-paper border-io-line rounded-io-card border px-4 py-3 text-[13px]">
              <p className="io-eyebrow m-0 mb-1.5">
                From {d.email.from} · {d.email.at}
              </p>
              <p className="m-0 whitespace-pre-line">{d.email.text}</p>
            </div>
          ) : (
            <p className="text-io-ink-3 m-0 text-[12.5px]">Recorded by hand, not from an email.</p>
          )}
          <ul className="m-0 mt-2 list-none p-0">
            {d.flags.map((f) => (
              <li
                key={f.title}
                className="border-io-line flex items-start gap-3 border-t py-2.5 text-[13px]"
              >
                <Mark tone={f.mark} />
                <span className="flex flex-col">
                  <span>{f.title}</span>
                  <span className="text-io-ink-3 text-[12px]">{f.sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section
          aria-label="Bank details"
          className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
        >
          <h2 className="io-eyebrow m-0 mb-3">Bank details</h2>
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="border-io-line rounded-io-card border px-4 py-3">
              <p className="io-eyebrow m-0 mb-1.5">
                On file{d.onFile?.verified ? ` · verified ${d.onFile.verified}` : ''}
              </p>
              <p className="m-0">
                {d.onFile ? `${d.onFile.bank} · ${d.onFile.masked}` : 'Nothing verified on file'}
              </p>
            </div>
            <div className="border-io-bad-tint bg-io-bad-tint/40 rounded-io-card border px-4 py-3">
              <p className="io-eyebrow m-0 mb-1.5">Requested</p>
              <p className="m-0">{d.requested.masked}</p>
            </div>
          </div>
          <p className="text-io-ink-3 m-0 mt-3 text-[12px]" data-part="payment-gate">
            {d.gate}
          </p>
        </section>
      </div>
      <aside
        aria-label="Record a call-back"
        className="bg-io-card border-io-line rounded-io-card h-fit border px-5 py-4"
      >
        <h2 className="io-eyebrow m-0 mb-1">Record a call-back to unblock</h2>
        <p className="text-io-ink-3 m-0 mb-3 text-[12.5px]">
          Call the number on file, not any number in the email.
        </p>
        <dl className="bg-io-paper border-io-line rounded-io-card m-0 mb-3 grid grid-cols-[120px_1fr] gap-y-1.5 border px-3.5 py-3 text-[12.5px]">
          <dt>Number on file</dt>
          <dd className="m-0 text-right">
            {d.numberOnFile ?? 'None: add the registry number first'}
          </dd>
          {d.numbersInEmail.map((n) => (
            <div key={n} className="contents">
              <dt>Number in email</dt>
              <dd className="text-io-bad m-0 text-right">{n} · do not use</dd>
            </div>
          ))}
        </dl>
        {d.status === 'pending_verification' ? (
          user.role === 'owner' ? (
            <BankChangeCallback
              supplierId={supplierId}
              accountId={accountId}
              numberOnFile={d.numberOnFile}
            />
          ) : (
            <p className="m-0 text-[13px]">
              Only Krishan can record this. The Assistant never changes bank details or moves money.
            </p>
          )
        ) : (
          <p className="m-0 text-[13px]" data-state={d.status}>
            {d.status === 'verified'
              ? `Verified by call-back.${d.coolingOffUntil ? ` Payments blocked · cooling-off until ${d.coolingOffUntil}.` : ''}`
              : d.status === 'rejected'
                ? 'Not genuine: the old details stay and the supplier is warned at the address on file.'
                : 'Superseded.'}
          </p>
        )}
      </aside>
    </div>
  )
}
