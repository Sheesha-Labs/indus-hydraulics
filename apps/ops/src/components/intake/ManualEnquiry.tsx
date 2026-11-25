'use client'

import { Select } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setBatchFactsAction } from '../../app/(console)/enquiries/intake/actions/queue'

/**
 * Board 92 · "New enquiry without an email" (S08-T06): a tender from a portal, a list read out on the phone, a PDF
 * on a USB stick. Three ways in — paste text, upload files, type lines — and the client, the client's reference
 * and the deadline, kept on the intake and written onto the enquiry when its lines are confirmed. Then the same
 * review (board 15). Replaces the website admin's paste-a-tender form.
 */
export interface ManualFacts {
  clientCompanyId: string | null
  clientRef: string | null
  deadline: string | null
}

const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-io-field w-full border px-2.5 text-[13px]'
const TILE =
  'rounded-io-card border-io-line bg-io-card io-focus flex min-h-[64px] flex-col items-start justify-center gap-1 border px-3 text-left'
const TILE_ON =
  'rounded-io-card border-io-accent bg-io-accent-tint io-focus flex min-h-[64px] flex-col items-start justify-center gap-1 border px-3 text-left'

export default function ManualEnquiry({
  batchId,
  hasFiles,
  clients,
  facts,
}: {
  batchId: string | null
  hasFiles: boolean
  clients: ReadonlyArray<{ id: string; name: string }>
  facts: ManualFacts
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [ref, setRef] = useState(facts.clientRef ?? '')

  async function save(
    change: Partial<{
      clientCompanyId: string | null
      clientRef: string | null
      deadline: string | null
    }>,
    source: 'upload' | 'paste' = 'upload'
  ): Promise<string | null> {
    setBusy(true)
    const r = await setBatchFactsAction({ batchId, source, ...change })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return null
    }
    if (!batchId)
      router.replace(`/enquiries/new?batch=${r.data.batchId}` as Route, { scroll: false })
    else router.refresh()
    return r.data.batchId
  }

  function click(selector: string) {
    document.querySelector<HTMLElement>(selector)?.click()
  }

  return (
    <section
      aria-labelledby="manual-enquiry"
      data-part="manual-enquiry"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border p-5"
    >
      <h2 id="manual-enquiry" className="m-0 text-[15px] font-medium">
        New enquiry without an email
      </h2>
      <p className="text-io-ink-2 m-0 text-[13px]">
        A tender from a portal, a list read out on the phone, a PDF on a USB stick.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          className={TILE}
          onClick={() => click('[data-action="paste-text"]')}
          disabled={busy}
        >
          <span className="text-[13px] font-medium">Paste text</span>
          <span className="text-io-ink-2 text-[12px]">From a portal or a chat</span>
        </button>
        <button
          type="button"
          className={hasFiles ? TILE_ON : TILE}
          onClick={() => click('input[aria-label="Choose enquiry files"]')}
          disabled={busy}
        >
          <span className="text-[13px] font-medium">Upload files</span>
          <span className="text-io-ink-2 text-[12px]">PDF, XLSX, DOCX, images</span>
        </button>
        <button
          type="button"
          className={TILE}
          disabled={busy}
          onClick={() =>
            void save({}, 'paste').then((id) => {
              if (id) router.push(`/enquiries/intake/${id}` as Route)
            })
          }
        >
          <span className="text-[13px] font-medium">Type lines</span>
          <span className="text-io-ink-2 text-[12px]">One by one</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <label className="flex flex-col gap-1.5 text-[12.5px]">
          Client
          <Select
            aria-label="Client"
            size="md"
            className="w-full [&>select]:w-full [&>select]:min-w-0"
            value={facts.clientCompanyId ?? ''}
            disabled={busy}
            options={[
              { value: '', label: 'Pick a client' },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
            onChange={(e) => void save({ clientCompanyId: e.target.value || null })}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px]">
          Client reference
          <input
            className={FIELD}
            placeholder="e.g. tender no."
            value={ref}
            disabled={busy}
            onChange={(e) => setRef(e.target.value)}
            onBlur={() => {
              if (ref.trim() !== (facts.clientRef ?? ''))
                void save({ clientRef: ref.trim() || null })
            }}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px]">
          Deadline
          <input
            className={FIELD}
            type="date"
            value={facts.deadline ?? ''}
            disabled={busy}
            onChange={(e) => void save({ deadline: e.target.value || null })}
          />
        </label>
      </div>
      <p className="text-io-ink-2 m-0 text-[12.5px]">
        Then the same review of the lines; the enquiry is created when you continue. A client not in
        the list yet is added from the directory first.
      </p>
    </section>
  )
}
