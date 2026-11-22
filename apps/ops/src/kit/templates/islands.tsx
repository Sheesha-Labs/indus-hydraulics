'use client'

import { ProposalCard, type ProposalCardProps } from '@indus/ops-ui/assistant'
import { Composer, type ComposerProps } from '@indus/ops-ui/mail'
import { DataTableClient, type Column } from '@indus/ops-ui/table'
import { useState } from 'react'
import { SAMPLE_SUPPLIERS, type SampleSupplier } from '../fixtures'

// Client islands for the template specimens. These parts take functions (actions, handlers, columns for
// a client table), which a server component cannot pass, so they are built here with stand-in actions
// that wait a moment and succeed. Nothing leaves the page.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const ok = async () => {
  await wait(300)
  return { success: true as const, data: undefined }
}

export type SpecimenProposalProps = Omit<ProposalCardProps, 'createdAt' | 'actions'> & {
  /** "12 min" in the header, from this render's clock (frozen in visual tests). */
  minutesAgo: number
}

/** A ProposalCard with stand-in verbs. */
export function SpecimenProposal({ minutesAgo, ...props }: SpecimenProposalProps) {
  const [createdAt] = useState(() => new Date(Date.now() - minutesAgo * 60_000))
  return (
    <ProposalCard
      {...props}
      createdAt={createdAt}
      actions={{
        approve: async () => {
          await wait(400)
          return { success: true, data: { undoRemainingMs: 5 * 60_000 } }
        },
        edit: { href: `#proposal-${props.id}` },
        reject: ok,
        later: ok,
        undo: ok,
        reopen: ok,
      }}
    />
  )
}

type SpecimenComposerProps = Omit<
  ComposerProps,
  'onSend' | 'onSaveDraft' | 'onDiscard' | 'onAttach'
>

/** The T5 cover email: a Composer whose send and draft actions are stand-ins. */
export function SpecimenComposer(props: SpecimenComposerProps) {
  return (
    <Composer
      {...props}
      onSend={async () => ({
        success: true,
        data: { sendId: 'kit-send', undoRemainingMs: 5 * 60_000 },
      })}
      onSaveDraft={async () => ({ success: true, data: { draftId: 'kit-draft' } })}
      onDiscard={() => {}}
      onAttach={() => {}}
    />
  )
}

const SUPPLIER_COLUMNS: Column<SampleSupplier>[] = [
  { key: 'name', label: 'Supplier', type: 'text', value: (r) => r.name, sub: (r) => r.sub },
  { key: 'type', label: 'Type', type: 'muted', value: (r) => r.type },
  {
    key: 'tier',
    label: 'Tier',
    type: 'chip',
    value: () => '',
    chip: { family: 'supplier', word: (r) => r.tier },
  },
  { key: 'country', label: 'Country', type: 'muted', value: (r) => r.country },
  { key: 'reply', label: 'Reply', type: 'num', value: (r) => r.reply || '—' },
  { key: 'win', label: 'Win', type: 'num', value: (r) => r.win || '—' },
]

/** T1b: the supplier index with its bulk-select column; the open row drives the preview. */
export function SupplierIndex() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  return (
    <DataTableClient
      caption="Suppliers"
      gridClass="grid-cols-[16px_minmax(0,1.4fr)_150px_110px_90px_80px_60px]"
      columns={SUPPLIER_COLUMNS}
      rows={SAMPLE_SUPPLIERS}
      rowKey={(r) => r.key}
      rowTone={(r) => (r.flag ? 'flag' : undefined)}
      selectable={{ selected, onChange: setSelected, label: (r) => `Select ${r.name}` }}
    />
  )
}
