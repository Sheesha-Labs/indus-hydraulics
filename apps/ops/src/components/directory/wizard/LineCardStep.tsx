import { companyInitials } from '@indus/ops-core'
import { Chip } from '@indus/ops-ui/status'
import { getLineCardData, type SupplierWizard } from '../../../data/supplier-wizard'
import type { OpsUser } from '../../../lib/access-core'
import LineCardEditor from '../LineCardEditor'
import ActivateButton from './ActivateButton'
import { FootBar } from './WizardFrame'

/**
 * Board 52 · Line card & terms (S10-T06): the editor on the left; on the right the status rail (Proposed → Under
 * review → Approved · trial → Approved after the trial POs → Suspended), the trial limits and the document expiries.
 * The one primary is "Activate supplier", refused until Krishan has decided.
 */
export default async function LineCardStep({ wizard }: { wizard: SupplierWizard; user: OpsUser }) {
  const data = await getLineCardData(wizard.id)
  const order = ['proposed', 'under_review', 'approved_trial', 'approved', 'suspended']
  const now = order.indexOf(
    wizard.onboarding === 'draft' ? 'proposed' : (wizard.onboarding ?? 'proposed')
  )
  const decided = ['approved', 'approved_trial'].includes(wizard.onboarding ?? '')
  return (
    <>
      <div className="border-io-line bg-io-card flex items-center justify-between border-b px-7 py-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="bg-io-navy rounded-io-ctl flex size-11 items-center justify-center text-[13px] font-semibold text-white"
          >
            {companyInitials(wizard.name)}
          </span>
          <p className="io-display text-io-record m-0 leading-tight">{wizard.name}</p>
        </div>
        <Chip
          tone={decided ? 'ok' : 'warn'}
          label={
            decided
              ? wizard.onboarding === 'approved'
                ? 'Approved'
                : 'Approved · trial'
              : 'Under review'
          }
        />
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_380px]" data-built="supplier-line-card">
        <div className="px-6 py-5">
          <LineCardEditor supplierId={wizard.id} data={data} />
        </div>
        <aside
          aria-label="Status"
          className="border-io-line flex flex-col gap-5 border-l px-5 py-5"
        >
          <section aria-label="Status rail">
            <h2 className="io-eyebrow m-0 mb-3">Status</h2>
            <ol className="m-0 flex list-none flex-col p-0">
              {data.rail.map((r, i) => (
                <li
                  key={r.key}
                  className="border-io-line flex items-center justify-between gap-3 border-b py-2.5 text-[13px] last:border-b-0"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`size-3.5 rounded-full ${i < now ? 'bg-io-accent' : i === now ? 'border-io-accent border-4' : 'border-io-stroke border'}`}
                    />
                    <span className={i === now ? 'font-medium' : ''}>{r.label}</span>
                  </span>
                  <span className="text-io-ink-3 text-[12px]">
                    {i === now && !r.at ? 'Today' : (r.at ?? '')}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-label="Trial limits">
            <h2 className="io-eyebrow m-0 mb-2">Trial limits</h2>
            <dl className="bg-io-paper border-io-line rounded-io-card m-0 flex flex-col gap-1.5 border px-3.5 py-3 text-[12.5px]">
              <div className="flex justify-between">
                <dt>POs on trial</dt>
                <dd className="m-0">
                  {data.trial.used} of {data.trial.limit}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Limit per PO</dt>
                <dd className="m-0">USD {data.trial.maxUsd.toLocaleString('en-US')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Inspection</dt>
                <dd className="m-0">{data.trial.tpi ? 'TPI at works on each PO' : 'As agreed'}</dd>
              </div>
            </dl>
          </section>
          <section aria-label="Document expiry">
            <h2 className="io-eyebrow m-0 mb-2">Document expiry</h2>
            <dl className="bg-io-paper border-io-line rounded-io-card m-0 flex flex-col gap-1.5 border px-3.5 py-3 text-[12.5px]">
              {data.expiries.map((d) => (
                <div key={d.id} className="flex justify-between gap-3">
                  <dt>{d.title}</dt>
                  <dd className="m-0 text-right">{d.expires} · remind 60 days before</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt>Screening</dt>
                <dd className="m-0">
                  {data.nextScreening ? `Next run ${data.nextScreening}` : 'Not run yet'}
                </dd>
              </div>
            </dl>
            <p className="text-io-ink-3 m-0 mt-3 text-[12px] leading-[1.5]">
              A lapsed certificate suspends the categories it covers. Open RFQs to the supplier stay
              visible but cannot be selected in Compare quotes.
            </p>
          </section>
        </aside>
      </div>
      <FootBar
        left={`Line card version ${data.version}${data.versionAt ? ` · ${data.versionAt}` : ''}`}
        backHref={`/suppliers/new/${wizard.id}/approve`}
        primary={<ActivateButton supplierId={wizard.id} disabled={!decided} />}
      />
    </>
  )
}
