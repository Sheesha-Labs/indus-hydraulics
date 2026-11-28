'use client'

import { Button } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { putFile } from '../../../../components/directory/wizard/DocumentsStep'
import {
  archiveBankAccountAction,
  confirmBankBlockAction,
  estimateSlotAction,
  parseEstimateAction,
  saveBankAccountAction,
} from './actions/documents'

export interface BankAccountRow {
  id: string
  bankName: string
  accountName: string
  currency: string
  ibanShown: string
  swift: string | null
  branch: string | null
  printLines: string[]
  source: string | null
  confirmedAt: string | null
  confirmedByName: string | null
  isDefaultForCcy: boolean
}

interface Draft {
  id: string | null
  sourceFileId: string | null
  bankName: string
  accountName: string
  currency: string
  iban: string
  swift: string
  branch: string
  printLines: string
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * The bank block (S11-T07, open item 1): the block client documents print, read from one of the Owner's own
 * Zoho estimates, reviewed, then confirmed. Until one is confirmed the section says plainly that client
 * documents cannot be approved. An edit of a confirmed block's lines asks for confirmation again.
 */
export default function BankBlockSection({
  accounts,
  isOwner,
}: {
  accounts: BankAccountRow[]
  isOwner: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState<null | string>(null)

  async function readEstimate(file: File) {
    setBusy('read')
    const slot = await estimateSlotAction({ name: file.name, size: file.size })
    if (!slot.success || !(await putFile(slot.data.uploadUrl, file))) {
      setBusy(null)
      toast({ kind: 'error', title: slot.success ? 'The upload did not arrive. Try again.' : slot.error })
      return
    }
    const r = await parseEstimateAction({ key: slot.data.key, filename: file.name })
    setBusy(null)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    const b = r.data.block
    setDraft({
      id: null,
      sourceFileId: r.data.fileId,
      bankName: b.bankName ?? '',
      accountName: b.accountName ?? '',
      currency: b.currency ?? 'AED',
      iban: b.iban ?? '',
      swift: b.swift ?? '',
      branch: b.branch ?? '',
      printLines: b.printLines.join('\n'),
    })
    if (!b.ibanValid) toast({ kind: 'warning', title: 'Check the IBAN: it does not pass its check digits' })
  }

  async function save(f: FormData) {
    if (!draft) return
    setBusy('save')
    const r = await saveBankAccountAction({
      id: draft.id,
      sourceFileId: draft.sourceFileId,
      bankName: String(f.get('bankName') ?? ''),
      accountName: String(f.get('accountName') ?? ''),
      currency: String(f.get('currency') ?? ''),
      iban: String(f.get('iban') ?? ''),
      swift: String(f.get('swift') ?? '').trim() || null,
      branch: String(f.get('branch') ?? '').trim() || null,
      printLines: String(f.get('printLines') ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    })
    setBusy(null)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({
      kind: 'success',
      title: r.data.unconfirmed ? 'Saved · confirm the block again' : 'Saved · now confirm the block',
    })
    setDraft(null)
    router.refresh()
  }

  async function confirm(id: string) {
    setBusy(id)
    const r = await confirmBankBlockAction({ accountId: id })
    setBusy(null)
    if (!r.success) toast({ kind: 'error', title: r.error })
    else toast({ kind: 'success', title: 'Bank block confirmed · client documents print it' })
    router.refresh()
  }

  return (
    <section
      aria-labelledby="bank-eyebrow"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="bank-eyebrow" className="io-eyebrow text-io-ink-3 m-0 scroll-mt-4">
          Bank block
        </h2>
        {isOwner && !draft ? (
          <label className="text-io-accent io-focus rounded-io-ctl cursor-pointer text-[13px]">
            {busy === 'read' ? 'Reading the estimate…' : 'Read from a Zoho estimate'}
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              aria-label="Zoho estimate PDF"
              disabled={!!busy}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                if (file) void readEstimate(file)
                e.currentTarget.value = ''
              }}
            />
          </label>
        ) : null}
      </div>
      {accounts.length ? null : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          No bank block yet. Upload one of your own Zoho estimates: the block is read from it for you to
          check and confirm.
        </p>
      )}
      {accounts.map((a) => (
        <div key={a.id} className="border-io-line flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2">
              <b className="font-medium">{a.bankName}</b>
              <span className="text-io-ink-3">{a.currency}</span>
              {a.confirmedAt ? (
                <Chip
                  tone="ok"
                  label={`Confirmed ${DATE.format(new Date(a.confirmedAt))}${a.confirmedByName ? ` by ${a.confirmedByName.split(/\s+/)[0]}` : ''}`}
                />
              ) : (
                <Chip tone="warn" label="Awaiting confirmation" />
              )}
            </span>
            {isOwner ? (
              <span className="flex gap-1.5">
                {a.confirmedAt ? null : (
                  <Button size="sm" onClick={() => confirm(a.id)} busy={busy === a.id}>
                    Confirm bank block
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDraft({
                      id: a.id,
                      sourceFileId: null,
                      bankName: a.bankName,
                      accountName: a.accountName,
                      currency: a.currency,
                      iban: a.ibanShown,
                      swift: a.swift ?? '',
                      branch: a.branch ?? '',
                      printLines: a.printLines.join('\n'),
                    })
                  }
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const r = await archiveBankAccountAction({ accountId: a.id })
                    if (!r.success) toast({ kind: 'error', title: r.error })
                    router.refresh()
                  }}
                >
                  Archive
                </Button>
              </span>
            ) : null}
          </div>
          <div className="bg-io-paper rounded-io-ctl text-io-ink-2 m-0 px-3 py-2 text-[12.5px] leading-[1.55] whitespace-pre-wrap tabular-nums">
            {a.printLines.join('\n')}
          </div>
        </div>
      ))}
      {draft ? (
        <form
          aria-label="Review the bank block"
          className="border-io-line flex flex-col gap-3 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault()
            void save(new FormData(e.currentTarget))
          }}
        >
          <p className="text-io-ink-2 m-0 text-[12.5px]">
            Check every line against the estimate. The lines below print exactly as written.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Field type="text" name="bankName" label="Bank" required defaultValue={draft.bankName} />
            <Field type="text" name="accountName" label="Account name" required defaultValue={draft.accountName} />
            <Field type="text" name="currency" label="Currency" required defaultValue={draft.currency} />
            <Field type="text" name="iban" label="IBAN" required defaultValue={draft.iban} className="col-span-2" />
            <Field type="text" name="swift" label="SWIFT" optional defaultValue={draft.swift} />
            <Field type="text" name="branch" label="Branch" optional defaultValue={draft.branch} />
          </div>
          <Field
            type="textarea"
            name="printLines"
            label="Printed lines"
            required
            defaultValue={draft.printLines}
            hint="One line per row, in order, as the estimate prints them."
          />
          <div className="flex gap-2">
            <Button type="submit" busy={busy === 'save'}>
              Save block
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
