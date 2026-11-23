'use client'

import {
  THREAD_MODE_LABELS,
  type CcChoice,
  type SendingRole,
  type ThreadModeValue,
} from '@indus/ops-core'
import { Select } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { SignoffTag } from '@indus/ops-ui/status'
import { cn } from '@indus/ops-ui/lib/cn'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveSendingRuleAction } from '../../app/(console)/settings/sending/actions/sending'
import type { SendingPage, SendingRowView } from '../../data/sending'

/**
 * Board 87's mail-type table: From, CC, Signature and Thread per mail type, one select per cell. A change saves
 * the row at once (the board's implicit Save) and signs its default off; a row still on the seeded default
 * shows "Default · awaiting sign-off". The client rows sit above a heavier rule, the supplier rows below it.
 */
const THREADS = Object.entries(THREAD_MODE_LABELS).map(([value, label]) => ({
  value: value as ThreadModeValue,
  label,
}))

export default function SendingRulesTable({
  page,
}: {
  page: Pick<SendingPage, 'rows' | 'fromOptions' | 'ccOptions' | 'signers' | 'canEdit'>
}) {
  return (
    <div className="bg-io-card border-io-line rounded-io-card overflow-hidden border">
      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">
          Who sends each type of email, with which CC, signature and thread
        </caption>
        <thead>
          <tr className="border-io-line border-b">
            {['When the Assistant sends…', 'From', 'CC', 'Signature', 'Thread'].map((h) => (
              <th key={h} scope="col" className="io-eyebrow px-4 py-3 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {page.rows.map((row, i) => (
            <RuleRow
              key={row.key}
              row={row}
              page={page}
              divider={i > 0 && row.audience !== page.rows[i - 1]?.audience}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RuleRow({
  row,
  page,
  divider,
}: {
  row: SendingRowView
  page: Pick<SendingPage, 'fromOptions' | 'ccOptions' | 'signers' | 'canEdit'>
  divider: boolean
}) {
  const [value, setValue] = useState({
    fromRole: row.fromRole,
    cc: row.cc,
    signatureUserId: row.signatureUserId,
    threadMode: row.threadMode,
  })
  const [awaiting, setAwaiting] = useState(row.awaiting)
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function save(patch: Partial<typeof value>) {
    const before = value
    const next = { ...value, ...patch }
    setValue(next)
    start(async () => {
      const res = await saveSendingRuleAction({ row: row.key, ...next })
      if (!res.success) {
        setValue(before)
        toast({ kind: 'error', title: res.error })
        return
      }
      setAwaiting(false)
      toast({ kind: 'success', title: `${row.label}: saved.` })
      router.refresh()
    })
  }

  const disabled = !page.canEdit || pending
  const signers = page.signers.map((s) => ({ value: s.userId, label: s.firstName }))
  return (
    <tr
      data-rule={row.key}
      aria-busy={pending || undefined}
      className={cn(
        'border-io-line border-b last:border-b-0',
        divider && 'border-t-io-stroke border-t-2'
      )}
    >
      <th scope="row" className="text-io-ink px-4 py-2.5 text-left align-middle font-normal">
        <span className="flex flex-col gap-1">
          {row.label}
          {awaiting ? <SignoffTag className="self-start" /> : null}
        </span>
      </th>
      <td className="px-2 py-2">
        <Select
          size="md"
          aria-label={`${row.label}: from`}
          value={value.fromRole}
          disabled={disabled}
          onChange={(e) => save({ fromRole: e.target.value as SendingRole })}
          options={page.fromOptions}
          className="w-full"
        />
      </td>
      <td className="px-2 py-2">
        <Select
          size="md"
          aria-label={`${row.label}: CC`}
          value={value.cc}
          disabled={disabled}
          onChange={(e) => save({ cc: e.target.value as CcChoice })}
          options={page.ccOptions.map((o) => ({
            ...o,
            disabled:
              o.value === value.fromRole ||
              (o.value === 'accounts_contact' && row.audience !== 'client'),
          }))}
          className="w-full"
        />
      </td>
      <td className="px-2 py-2">
        <Select
          size="md"
          aria-label={`${row.label}: signature`}
          value={value.signatureUserId ?? ''}
          disabled={disabled || !signers.length}
          onChange={(e) => save({ signatureUserId: e.target.value || null })}
          options={signers.length ? signers : [{ value: '', label: '—' }]}
          className="w-full"
        />
      </td>
      <td className="px-2 py-2 pr-4">
        <Select
          size="md"
          aria-label={`${row.label}: thread`}
          value={value.threadMode}
          disabled={disabled}
          onChange={(e) => save({ threadMode: e.target.value as ThreadModeValue })}
          options={THREADS}
          className="w-full"
        />
      </td>
    </tr>
  )
}
