'use client'

import { Button, DeleteButton, type ButtonProps } from '@indus/ui'
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
  /**
   * Render as the trash-icon DeleteButton instead of a labelled button. The
   * aria-label then becomes the button's name and tooltip, so it is required
   * in practice; `children` is ignored.
   */
  trash?: boolean
  /** Leading icon for the labelled button. */
  icon?: React.ReactNode
}

/**
 * One button, one server action, its outcome said beside it. For row actions
 * and small bulk actions that need no form.
 */
export default function ActionButton({ action, children, confirm, kind = 'ghost', size = 'dense-sm', trash = false, icon, ...rest }: Props) {
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
      {trash ? (
        <DeleteButton label={rest['aria-label'] ?? 'Delete'} size="sm" onClick={run} pending={pending} />
      ) : (
        <Button type="button" kind={kind} size={size} onClick={run} disabled={pending} aria-label={rest['aria-label']} icon={pending ? undefined : icon}>
          {pending ? 'Working…' : children}
        </Button>
      )}
      {note ? (
        <span role={note.ok ? 'status' : 'alert'} className={note.ok ? 'text-[12.5px] text-ih-success-ink' : 'text-[12.5px] text-ih-danger-ink'}>
          {note.text}
        </span>
      ) : null}
    </span>
  )
}
