'use client'

import { Button } from '@indus/ui'
import { useState, useTransition } from 'react'

import type { Result } from '../../../lib/result'

type Props = {
  /** A server action, already bound to its arguments. */
  action: () => Promise<Result<{ csv: string; filename: string; rows: number }>>
  label?: string
}

/**
 * Runs an export action and hands the CSV to the browser as a download. The
 * file is built in memory from the action's result; nothing is stored.
 */
export default function DownloadCsvButton({ action, label = 'Export CSV' }: Props) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run() {
    setError(null)
    start(async () => {
      const r = await action()
      if (!r.success) {
        setError(r.message)
        return
      }
      // A UTF-8 BOM so Excel reads non-ASCII names correctly.
      const blob = new Blob(['﻿', r.data.csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = r.data.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" kind="outline" size="dense" onClick={run} disabled={pending}>
        {pending ? 'Exporting…' : label}
      </Button>
      {error ? (
        <span role="alert" className="text-[12.5px] text-ih-danger-ink">
          {error}
        </span>
      ) : null}
    </span>
  )
}
