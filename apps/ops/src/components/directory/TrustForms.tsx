'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  blockSupplierAction,
  requestPromotionAction,
  unblockSupplierAction,
} from '../../app/(console)/suppliers/actions/trust'
import { recordCallbackAction } from '../../app/(console)/suppliers/new/actions/vetting'
import { FIELD } from './DirectoryEditors'

/** Boards 130–132 (S10-T07): ask for a promotion, block / unblock, and the Owner's call-back on a bank change. */
type R<T> = { success: true; data: T } | { success: false; error: string }
function useRun() {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  return {
    busy,
    router,
    async run<T>(fn: () => Promise<R<T>>, ok: string): Promise<T | null> {
      setBusy(true)
      try {
        const r = await fn()
        if (!r.success) {
          toast({ kind: 'error', title: r.error })
          return null
        }
        toast({ kind: 'success', title: ok })
        router.refresh()
        return r.data
      } finally {
        setBusy(false)
      }
    },
  }
}

export function PromoteButton({
  supplierId,
  to,
  label,
  disabled,
}: {
  supplierId: string
  to: 'trial' | 'approved'
  label: string
  disabled?: boolean
}) {
  const { busy, run } = useRun()
  return (
    <Button
      variant="primary"
      disabled={busy || disabled}
      onClick={() =>
        void run(
          () => requestPromotionAction({ supplierId, to }),
          'The card is in Review for Krishan'
        )
      }
    >
      {label}
    </Button>
  )
}

const REASONS = [
  ['fake_company', 'Fake company'],
  ['counterfeit', 'Counterfeit'],
  ['payment_fraud_attempt', 'Payment fraud attempt'],
  ['persistent_non_delivery', 'Persistent non-delivery'],
  ['quality_failure', 'Quality failure'],
] as const

export function BlockForm({ supplierId, name }: { supplierId: string; name: string }) {
  const [reason, setReason] = useState<(typeof REASONS)[number][0] | ''>('')
  const [note, setNote] = useState('')
  const [evidence, setEvidence] = useState('')
  const { busy, run, router } = useRun()
  return (
    <div className="flex flex-col gap-4" data-part="block-form">
      <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
        <legend className="io-eyebrow mb-2">Reason</legend>
        {REASONS.map(([v, l]) => (
          <label
            key={v}
            className={`rounded-io-pill io-focus cursor-pointer border px-3 py-1.5 text-[12.5px] ${reason === v ? 'bg-io-navy border-io-navy text-white' : 'border-io-stroke bg-io-card'}`}
          >
            <input
              type="radio"
              name="block-reason"
              value={v}
              className="sr-only"
              checked={reason === v}
              onChange={() => setReason(v)}
            />
            {l}
          </label>
        ))}
      </fieldset>
      <p className="text-io-ink-3 m-0 text-[12px]">
        Not for sanctions alone: a screening hit is decided in vetting.
      </p>
      <label className="flex flex-col gap-1 text-[12.5px]">
        Evidence (a message, document or link)
        <input className={FIELD} value={evidence} onChange={(e) => setEvidence(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-[12.5px]">
        Note
        <input className={FIELD} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push(`/suppliers/${supplierId}` as Route)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          disabled={busy || !reason}
          onClick={() =>
            void (async () => {
              const out = await run(
                () =>
                  blockSupplierAction({
                    supplierId,
                    reason: reason as 'counterfeit',
                    ...(note.trim() ? { note: note.trim() } : {}),
                    evidence: evidence.trim() ? [evidence.trim()] : [],
                  }),
                `${name} blocked`
              )
              if (out) router.push(`/suppliers/${supplierId}` as Route)
            })()
          }
        >
          {`Block ${name}`}
        </Button>
      </div>
    </div>
  )
}

export function UnblockForm({ supplierId }: { supplierId: string }) {
  const [reason, setReason] = useState('')
  const { busy, run, router } = useRun()
  return (
    <div className="flex items-end gap-2">
      <label className="flex flex-1 flex-col gap-1 text-[12.5px]">
        Why the block is lifted
        <input className={FIELD} value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <Button
        variant="primary"
        disabled={busy || !reason.trim()}
        onClick={() =>
          void (async () => {
            if (
              await run(
                () => unblockSupplierAction({ supplierId, reason: reason.trim() }),
                'Unblocked'
              )
            )
              router.push(`/suppliers/${supplierId}` as Route)
          })()
        }
      >
        Unblock
      </Button>
    </div>
  )
}

export function BankChangeCallback({
  supplierId,
  accountId,
  numberOnFile,
}: {
  supplierId: string
  accountId: string
  numberOnFile: string | null
}) {
  const [v, setV] = useState({
    calledAt: '',
    spokeTo: '',
    role: '',
    outcome: 'genuine' as 'genuine' | 'not_genuine',
  })
  const { busy, run } = useRun()
  return (
    <div className="flex flex-col gap-3 text-[12.5px]" data-part="bank-change-callback">
      <label className="flex flex-col gap-1">
        Date and time
        <input
          type="datetime-local"
          className={FIELD}
          value={v.calledAt}
          onChange={(e) => setV({ ...v, calledAt: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        Spoke to (name and role)
        <input
          className={FIELD}
          value={v.spokeTo}
          onChange={(e) => setV({ ...v, spokeTo: e.target.value })}
        />
      </label>
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">Outcome</legend>
        {[
          [
            'genuine',
            'Confirmed: change is genuine',
            'New details saved; payments unblock after the cooling-off',
          ],
          [
            'not_genuine',
            'Not genuine: fraud attempt',
            'Old details kept; supplier warned at the address on file',
          ],
        ].map(([val, title, sub]) => (
          <label
            key={val}
            className={`rounded-io-card flex cursor-pointer gap-3 border px-4 py-3 ${v.outcome === val ? 'border-io-accent bg-io-accent-faint' : 'border-io-line'}`}
          >
            <input
              type="radio"
              name="bank-outcome"
              value={val}
              checked={v.outcome === val}
              onChange={() => setV({ ...v, outcome: val as 'genuine' })}
            />
            <span className="flex flex-col">
              <span className="font-medium">{title}</span>
              <span className="text-io-ink-3">{sub}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <Button
        variant="primary"
        disabled={busy || !v.spokeTo.trim() || !numberOnFile}
        onClick={() =>
          void run(
            () =>
              recordCallbackAction({
                supplierId,
                accountId,
                numberSource: 'registry',
                numberDialled: numberOnFile!,
                spokeTo: v.spokeTo.trim(),
                outcome: v.outcome,
                ...(v.calledAt ? { calledAt: new Date(v.calledAt).toISOString() } : {}),
              }),
            v.outcome === 'genuine'
              ? 'Verified: payments wait for the cooling-off'
              : 'Not genuine: the warning is in Review'
          )
        }
      >
        Save call-back
      </Button>
      <p className="text-io-ink-3 m-0 text-[12px]">
        Only Krishan can record this. The Assistant never changes bank details or moves money.
      </p>
    </div>
  )
}
