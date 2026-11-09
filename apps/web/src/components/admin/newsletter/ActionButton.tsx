'use client'

import { Button, type ButtonProps } from '@indus/ui'
import { useState, useTransition } from 'react'

import type { Result } from '../../../lib/result'

type Props = {
  /** A server action, already bound to its arguments. */
  action: () => Promise<Result<{ message: string }>>
  children: React.ReactNode
  /** Asked with window.confirm before running; omit for no question. */
  confirm?: string
  kind?: ButtonProps['kind']
  size?: ButtonProps['size']
  'aria-label'?: string
}

/**
 * One button, one server action, its outcome said beside it. For row actions
 * and small bulk actions that need no form.
 */
export default function ActionButton({ action, children, confirm, kind = 'ghost', size = 'dense-sm', ...rest }: Props) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  function run() {
    if (confirm && !window.confirm(confirm)) return
    setNote(null)
    start(async () => {
      const r = await action()
      setNote(r.success ? { ok: true, text: r.data.message } : { ok: false, text: r.message })
    })
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" kind={kind} size={size} onClick={run} disabled={pending} aria-label={rest['aria-label']}>
        {pending ? 'Working…' : children}
      </Button>
      {note ? (
        <span role={note.ok ? 'status' : 'alert'} className={note.ok ? 'text-[12.5px] text-ih-success-ink' : 'text-[12.5px] text-ih-danger-ink'}>
          {note.text}
        </span>
      ) : null}
    </span>
  )
}
