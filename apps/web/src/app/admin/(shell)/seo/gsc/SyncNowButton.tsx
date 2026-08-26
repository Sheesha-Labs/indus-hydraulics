'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@indus/ui'

import { requestGscSync } from './actions'

/**
 * Runs the sync on demand.
 *
 * The row counts on this page come from the database, and the job writes to it
 * asynchronously, so a press cannot report "N rows written" — the honest
 * message is that the job was queued and the page should be refreshed. A first
 * run backfills roughly sixteen months and takes a while; saying so is better
 * than a spinner that looks stuck.
 */
export default function SyncNowButton({ disabled }: { disabled: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function run() {
    startTransition(async () => {
      const result = await requestGscSync()
      setMessage(
        result.success
          ? {
              ok: true,
              text: 'Sync queued. A first run backfills about sixteen months — refresh in a minute or two to see the row counts move.',
            }
          : { ok: false, text: result.message }
      )
      if (result.success) router.refresh()
    })
  }

  return (
    <div>
      <Button kind="primary" size="sm" onClick={run} disabled={disabled || pending}>
        {pending ? 'Queueing…' : 'Sync now'}
      </Button>
      {disabled && (
        <p className="text-ih-muted mt-2 text-[12.5px]">
          Available once the credential is configured.
        </p>
      )}
      {message && (
        <p
          className={`mt-2 text-[12.5px] ${message.ok ? 'text-ih-ink-2' : 'text-ih-accent'}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
