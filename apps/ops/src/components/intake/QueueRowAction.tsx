'use client'

import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  cancelExtractionAction,
  removeQueuedFileAction,
} from '../../app/(console)/enquiries/intake/actions/queue'
import type { QueueRow } from '../../data/intake'
import { INTAKE_ACCEPT, sendFiles } from './send-files'

const LINK = 'io-focus rounded-io-tag text-[13px] font-medium hover:underline'

/** The queue row's one verb (board 14): Review →, Map columns →, Cancel, Remove or Re-upload. */
export default function QueueRowAction({ row }: { row: QueueRow }) {
  const router = useRouter()
  const { toast } = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setBusy(true)
    const r = await fn()
    setBusy(false)
    if (!r.success) toast({ kind: 'error', title: r.error ?? 'That did not work' })
    router.refresh()
  }

  if (row.action === 'map' && row.href)
    return (
      <Link href={row.href as Route} className={`${LINK} text-io-accent`}>
        Map columns →
      </Link>
    )
  if (row.action === 'review' && row.href)
    return (
      <Link href={row.href as Route} className={`${LINK} text-io-accent`}>
        Review →
      </Link>
    )
  if (row.action === 'cancel')
    return (
      <button
        type="button"
        disabled={busy}
        className={`${LINK} text-io-ink-3`}
        onClick={() => void run(() => cancelExtractionAction({ fileId: row.id }))}
      >
        Cancel
      </button>
    )
  if (row.action === 'remove')
    return (
      <button
        type="button"
        disabled={busy}
        className={`${LINK} text-io-ink-3`}
        onClick={() => void run(() => removeQueuedFileAction({ fileId: row.id }))}
      >
        Remove
      </button>
    )
  if (row.action === 'reupload')
    return (
      <>
        <button
          type="button"
          disabled={busy}
          className={`${LINK} text-io-bad`}
          onClick={() => input.current?.click()}
        >
          Re-upload
        </button>
        <input
          ref={input}
          type="file"
          accept={INTAKE_ACCEPT}
          className="hidden"
          aria-label={`Re-upload ${row.name}`}
          onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (!f) return
            setBusy(true)
            const out = await sendFiles([f], { batchId: row.batchId, replacesFileId: row.id })
            setBusy(false)
            for (const r of out.refused) toast({ kind: 'error', title: `${r.name}: ${r.why}` })
            router.refresh()
          }}
        />
      </>
    )
  return null
}
