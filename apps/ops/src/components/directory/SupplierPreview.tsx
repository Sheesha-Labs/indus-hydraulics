import { ButtonLink } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import { TIER_TONE, TIER_WORD, type getSupplierPreview } from '../../data/suppliers'

/** Board 128's 360 preview (`?selected=`): header, tier, what they carry and the first contacts. */
export default function SupplierPreview({
  p,
}: {
  p: NonNullable<Awaited<ReturnType<typeof getSupplierPreview>>>
}) {
  const h = p.header
  return (
    <div className="flex flex-col gap-4 p-5" data-part="supplier-preview">
      <div className="flex flex-col gap-1.5">
        <h2 className="io-display text-io-section m-0 text-[26px] leading-tight">{h.name}</h2>
        <span className="text-io-ink-3 text-[12px]">
          {[h.type, h.place].filter(Boolean).join(' · ')}
        </span>
        <span className="flex gap-2">
          <Chip tone={TIER_TONE[h.tier]} label={TIER_WORD[h.tier]} />
          {h.quotesIn ? <Chip tone="n" label={`Quotes in ${h.quotesIn}`} /> : null}
        </span>
      </div>
      <dl className="m-0 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <dt className="text-io-ink-3">RFQs</dt>
          <dd className="m-0 text-[15px] font-medium">{p.stats.rfqs}</dd>
        </div>
        <div>
          <dt className="text-io-ink-3">Reply</dt>
          <dd className="m-0 text-[15px] font-medium">{p.stats.replyRate ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-io-ink-3">Median</dt>
          <dd className="m-0 text-[15px] font-medium">{p.stats.median ?? '—'}</dd>
        </div>
      </dl>
      <section aria-label="What they carry">
        <h3 className="io-eyebrow m-0 mb-2">What they carry</h3>
        <p className="m-0 text-[12.5px]">{p.carry.map((c) => c.label).join(' · ') || '—'}</p>
      </section>
      <section aria-label="Contacts">
        <h3 className="io-eyebrow m-0 mb-2">Contacts</h3>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[12.5px]">
          {p.contacts.length
            ? p.contacts.map((c) => (
                <li key={c.id}>
                  {c.name}
                  {c.role ? <span className="text-io-ink-3"> · {c.role}</span> : null}
                </li>
              ))
            : '—'}
        </ul>
      </section>
      <ButtonLink href={`/suppliers/${h.id}` as Route}>Open profile</ButtonLink>
    </div>
  )
}
