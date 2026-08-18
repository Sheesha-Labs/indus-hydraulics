'use client'

import { useState, useTransition } from 'react'
import { revertChange } from './actions'

interface Props {
  auditLogId: string
  /** Display the user reverted to. Used in the confirm dialog. */
  beforeSummary: string
}

export default function RevertButton({ auditLogId, beforeSummary }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function handleClick() {
    if (done) return
    if (
      !confirm(
        `Revert this change?\n\nThe field will return to:\n${truncate(beforeSummary, 280)}\n\nA new audit row tagged "reverted" will be appended.`,
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await revertChange(auditLogId)
      if (!res.success) {
        setError(res.message)
        return
      }
      setDone(true)
    })
  }

  if (done) {
    return (
      <span className="font-mono text-[11px] text-ih-success-ink">Reverted ✓</span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="font-mono text-[11px] text-ih-muted hover:text-ih-ink disabled:opacity-50"
      >
        {pending ? 'Reverting…' : 'Revert'}
      </button>
      {error && (
        <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}
