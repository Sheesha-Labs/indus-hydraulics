'use client'

import { useState, useTransition } from 'react'
import { Button, Field, Textarea } from '@indus/ui'

import { updateCallbackLead } from '../actions'

const STEPS = [
  { value: 'called', label: 'Mark called' },
  { value: 'quoted', label: 'Mark quoted' },
  { value: 'closed', label: 'Close' },
  { value: 'spam', label: 'Spam' },
] as const

export default function CallbackActions({ id, status, notes }: { id: string; status: string; notes: string | null }) {
  const [text, setText] = useState(notes ?? '')
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()

  function save(next: string) {
    setNote(null)
    start(async () => {
      const r = await updateCallbackLead({ id, status: next as (typeof STEPS)[number]['value'] | 'new', notes: text })
      setNote(r.success ? { ok: true, text: r.data.message } : { ok: false, text: r.message })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Notes" hint="What was said, what was promised, the part numbers." htmlFor="cb-notes">
        <Textarea id="cb-notes" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <Button
            key={s.value}
            type="button"
            kind={s.value === 'called' && status === 'new' ? 'primary' : s.value === 'spam' ? 'ghost' : 'outline'}
            size="dense"
            disabled={pending || status === s.value}
            onClick={() => save(s.value)}
          >
            {s.label}
          </Button>
        ))}
        <Button type="button" kind="ghost" size="dense" disabled={pending} onClick={() => save(status)}>
          Save note
        </Button>
      </div>
      {note ? (
        <p role={note.ok ? 'status' : 'alert'} className={`text-[13px] ${note.ok ? 'text-ih-success-ink' : 'text-ih-danger-ink'}`}>
          {note.text}
        </p>
      ) : null}
    </div>
  )
}
