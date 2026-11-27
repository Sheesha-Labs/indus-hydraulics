import { ButtonLink } from '@indus/ops-ui/controls'
import type { Route } from 'next'
import type { ReactNode } from 'react'
import type { SupplierWizard, WizardStep } from '../../../data/supplier-wizard'

/** The new-supplier wizard frame (boards 50–52): the company pane on the left, the step on the right, the foot. */
function Kv({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-[12.5px]">
      <dt className="text-io-ink-3">{label}</dt>
      <dd className="m-0 min-w-0 break-words">{value || '—'}</dd>
    </div>
  )
}

/** Board 50's left pane: the company facts and contacts, read-only, with the not-selectable note. */
export function CompanyPane({ wizard }: { wizard: SupplierWizard }) {
  const f = wizard.facts
  return (
    <aside
      aria-label="Company facts"
      className="border-io-line bg-io-card flex flex-col gap-5 border-r px-6 py-6"
    >
      <section aria-label="Company">
        <h2 className="io-eyebrow m-0 mb-2">Company</h2>
        <dl className="m-0">
          <Kv label="Legal name" value={f.legalName} />
          <Kv label="Country" value={f.countryWord} />
          <Kv label="Address" value={f.address} />
          <Kv label="Website" value={f.website} />
          <Kv label="Registry no." value={f.registryNo} />
          <Kv label="Tax ID" value={f.taxId} />
          <Kv
            label="Founded"
            value={[f.foundedYear, f.staffCount ? `${f.staffCount} staff` : null]
              .filter(Boolean)
              .join(' · ')}
          />
          <Kv label="Introduced by" value={f.introducedBy} />
          <Kv label="Quote currency" value={f.quoteCurrencies.join(', ')} />
        </dl>
      </section>
      <section aria-label="Contacts" className="border-io-line border-t pt-4">
        <h2 className="io-eyebrow m-0 mb-2">Contacts</h2>
        <dl className="m-0">
          {wizard.contacts.length
            ? wizard.contacts.map((c) => (
                <Kv
                  key={c.id}
                  label={c.role || 'Contact'}
                  value={
                    <span className="flex flex-col">
                      <span>{c.name ?? c.email}</span>
                      {c.email && c.name ? (
                        <span className="text-io-ink-3 text-[12px] break-all">{c.email}</span>
                      ) : null}
                    </span>
                  }
                />
              ))
            : 'None yet'}
        </dl>
      </section>
      <p className="bg-io-fill rounded-io-card text-io-ink-2 m-0 px-4 py-3 text-[12.5px]">
        Until approval the supplier is visible to Ayush and the Assistant only and cannot be
        selected for an RFQ, research or a PO.
      </p>
      <ButtonLink size="sm" variant="ghost" href={`/suppliers/new/${wizard.id}/company` as Route}>
        Edit company and contacts
      </ButtonLink>
    </aside>
  )
}

export function TwoPanes({
  wizard,
  children,
  foot,
}: {
  wizard: SupplierWizard
  children: ReactNode
  foot: ReactNode
}) {
  return (
    <>
      <div className="grid flex-1 grid-cols-[420px_minmax(0,1fr)]">
        <CompanyPane wizard={wizard} />
        <div className="px-6 py-6">{children}</div>
      </div>
      {foot}
    </>
  )
}

export function Foot({
  wizard,
  next,
  nextLabel,
  back,
  extra,
  nextPrimary = true,
}: {
  wizard: SupplierWizard
  next: WizardStep | null
  nextLabel: string
  back: WizardStep
  extra?: ReactNode
  /** False when the step's own decision holds the page's one primary. */
  nextPrimary?: boolean
}) {
  return (
    <div className="border-io-line bg-io-card sticky bottom-0 flex items-center justify-between border-t px-6 py-3.5">
      <span className="text-io-ink-3 text-[12.5px]">{wizard.started}</span>
      <span className="flex gap-2">
        <ButtonLink href={`/suppliers/new/${wizard.id}/${back}` as Route}>Back</ButtonLink>
        {extra}
        {next ? (
          <ButtonLink
            variant={nextPrimary ? 'primary' : 'secondary'}
            href={`/suppliers/new/${wizard.id}/${next}` as Route}
          >
            {nextLabel}
          </ButtonLink>
        ) : null}
      </span>
    </div>
  )
}

/** A foot bar with its own left text and primary (board 52). */
export function FootBar({
  left,
  backHref,
  primary,
}: {
  left: string
  backHref: string
  primary: ReactNode
}) {
  return (
    <div className="border-io-line bg-io-card sticky bottom-0 flex items-center justify-between border-t px-6 py-3.5">
      <span className="text-io-ink-3 text-[12.5px]">{left}</span>
      <span className="flex gap-2">
        <ButtonLink href={backHref as Route}>Back</ButtonLink>
        {primary}
      </span>
    </div>
  )
}
