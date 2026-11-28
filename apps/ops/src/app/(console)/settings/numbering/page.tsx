import { enquiryRefOf } from '@indus/ops-core'
import { Chip } from '@indus/ops-ui/status'
import { DataTable, type Column } from '@indus/ops-ui/table'
import type { Tone } from '@indus/ops-ui/types'
import EnquirySeedCard from '../../../../components/settings/EnquirySeedCard'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { currentEnquiryYear, proposeEnquirySeed } from '../../../../server/numbering/enquiry-seed'
import {
  listSequences,
  proposeSeed,
  type SequenceRow,
} from '../../../../server/numbering/sequences'
import NumberingActions, { OutOfStepCard, SequencePanel } from './NumberingPanels'

const CONTINUITY: Record<SequenceRow['continuity'], { tone: Tone; label: string }> = {
  clear: { tone: 'ok', label: 'Clear' },
  out_of_step: { tone: 'warn', label: 'Out of step' },
  not_checked: { tone: 'n', label: 'Not checked' },
  unseeded: { tone: 'n', label: 'Unseeded' },
  check_failed: { tone: 'warn', label: 'Not checked · retry' },
}

const chipOf = (r: SequenceRow) => {
  if (r.key === 'quotation' && !r.seeded)
    return { tone: 'n' as Tone, label: 'Unseeded · cutover batch' }
  if (r.continuity === 'out_of_step') {
    const clash = r.detail?.perSource.find((s) => s.clashesWithNext)
    if (clash?.maxFormatted)
      return { tone: 'warn' as Tone, label: `${clash.maxFormatted} used outside` }
  }
  if (r.continuity === 'clear' && r.detail?.perSource.some((s) => s.maxSeen !== null))
    return { tone: 'ok' as Tone, label: 'Clear in Gmail' }
  return CONTINUITY[r.continuity]
}

/**
 * Settings › Numbering (board 214, S11-T08, ADR-15, C4–C6): every number series with its pattern, the next
 * number (ops.peek_number), the continuity found by the nightly check (Sent mail, the website admin; Zoho with
 * S20) and the revision style. A row opens its evidence, seed and pattern panel. INDUS/Q stays unseeded until
 * the cutover batch. Everyone signed in may read; only the Owner seeds, edits or confirms.
 */
export default async function SettingsNumberingPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const user = await requireOpsUser().catch(signInFor(`/settings/numbering`))
  const isOwner = user.role === 'owner'
  const sp = await searchParams
  const rows = await listSequences()
  const selected = rows.find((r) => r.key === sp.key) ?? null
  const year = currentEnquiryYear()
  const [enq, proposal] = await Promise.all([
    selected?.key === 'enquiry' ? proposeEnquirySeed(year) : Promise.resolve(null),
    selected &&
    selected.key !== 'enquiry' &&
    selected.key !== 'quotation' &&
    selected.scopeKind !== 'parent'
      ? proposeSeed(selected.key)
      : Promise.resolve(null),
  ])
  const outOfStep = rows.filter((r) => r.continuity === 'out_of_step')

  const columns: Column<SequenceRow>[] = [
    {
      key: 'doc',
      label: 'Document',
      type: 'ref',
      value: (r) => r.label,
      href: (r) => `/settings/numbering?key=${r.key}`,
    },
    { key: 'pattern', label: 'Pattern', type: 'text', value: (r) => r.pattern },
    { key: 'next', label: 'Next', type: 'num', value: (r) => r.next ?? '—' },
    {
      key: 'continuity',
      label: 'Continuity',
      type: 'text',
      value: (r) => {
        const c = chipOf(r)
        return <Chip tone={c.tone} label={c.label} />
      },
    },
    {
      key: 'revision',
      label: 'Revision',
      type: 'text',
      value: (r) => (r.key === 'tax_invoice' ? 'Credit note' : (r.revisionPattern ?? '—')),
    },
  ]

  return (
    <div data-built="numbering" className="flex flex-col gap-5 pt-4 pb-8">
      {isOwner ? (
        <NumberingActions awaiting={rows.some((r) => r.signoffStatus === 'awaiting')} />
      ) : null}
      <DataTable
        caption="Number series"
        gridClass="grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_110px]"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.key}
        {...(selected ? { selectedKey: selected.key } : {})}
        rowTone={(r) => (r.continuity === 'out_of_step' ? 'flag' : undefined)}
      />
      <div className="grid grid-cols-2 gap-5">
        {outOfStep.length ? (
          outOfStep.map((r) => <OutOfStepCard key={r.key} row={r} isOwner={isOwner} />)
        ) : (
          <section
            aria-labelledby="continuity-eyebrow"
            className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-[18px] py-4"
          >
            <h2 id="continuity-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
              Continuity
            </h2>
            <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">
              Every night the numbers used in sales@ and purchase@ sent mail and by the website
              admin are compared with the next number of each series. Zoho joins with the accounting
              connection.
            </p>
          </section>
        )}
        <section
          aria-labelledby="changing-eyebrow"
          className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-[18px] py-4"
        >
          <h2 id="changing-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
            Changing a next number
          </h2>
          <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">
            Shows the last numbers used in Gmail sent mail and by the website admin, and refuses a
            next number that would duplicate one. INDUS/Q is seeded in the cutover batch from the
            highest number found in all of them.
          </p>
        </section>
      </div>
      {selected ? (
        selected.key === 'enquiry' && enq ? (
          <EnquirySeedCard
            v={{
              year,
              legacyMaxRef: enq.legacyMax ? enquiryRefOf(year, enq.legacyMax) : null,
              opsNextRef: enq.opsNext ? enquiryRefOf(year, enq.opsNext) : null,
              proposedNext: enq.proposedNext,
              proposedRef: enq.proposedRef,
              outOfStep: enq.outOfStep,
              isOwner,
            }}
          />
        ) : (
          <SequencePanel row={selected} proposal={proposal} isOwner={isOwner} />
        )
      ) : null}
    </div>
  )
}
