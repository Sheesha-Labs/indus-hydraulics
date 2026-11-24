'use client'

import { OptionGroup } from '@indus/ops-ui/assistant'
import { Select } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { correctValueAction } from '../../actions/correct-value'
import { getLinkSuggestions } from '../../actions/read/link-suggestions'
import type { WhyCorrection } from '../../data/why'

/**
 * "This is wrong…" (S06-T05, board 112 "Change it"): the right value (a type from the list, one of the
 * alternatives the Assistant weighed, or typed text) and a one-line reason, both required. The submit button
 * lives in the drawer's foot (`form={formId}`), so the drawer keeps one primary action.
 */
export default function CorrectValueForm({
  correction,
  formId,
  onBusy,
  onSaved,
}: {
  correction: WhyCorrection
  formId: string
  onBusy: (busy: boolean) => void
  onSaved: (label: string) => void
}) {
  const { toast } = useToast()
  const reasonId = useId()
  const valueId = useId()
  const errorId = useId()
  const first = correction.choices[0]?.key ?? ''
  const [value, setValue] = useState(correction.valueType === 'text' ? '' : first)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const searchId = useId()
  const [q, setQ] = useState('')
  const [found, setFound] = useState<WhyCorrection['choices']>([])
  const seq = useRef(0)
  const search = correction.search

  // Link to…'s search (board 95), debounced 120 ms; a stale answer never replaces a newer one.
  useEffect(() => {
    if (!search || q.trim().length < 2) return
    const n = ++seq.current
    const t = setTimeout(async () => {
      const res = await getLinkSuggestions({ messageId: search.messageId, q })
      if (n !== seq.current || !res.success) return
      setFound(res.data.map((x) => ({ key: x.key, label: x.title, sub: x.detail })))
    }, 120)
    return () => clearTimeout(t)
  }, [search, q])

  const shown = [
    ...correction.choices,
    ...(q.trim().length >= 2 ? found : []).filter(
      (f) => !correction.choices.some((c) => c.key === f.key)
    ),
  ]

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!value.trim()) return setError('Choose the right value')
    if (!reason.trim()) return setError('Say in a line why it is wrong')
    setError(null)
    onBusy(true)
    try {
      const res = await correctValueAction({ actionRef: correction.actionRef, value, reason })
      if (!res.success) {
        setError(res.error)
        return
      }
      toast({ kind: 'success', title: `Overridden: ${correction.label} → ${res.data.label}` })
      onSaved(res.data.label)
    } finally {
      onBusy(false)
    }
  }

  const field =
    'io-focus-field border-io-stroke rounded-io-ctl bg-io-card text-io-ink h-io-field w-full border px-2.5 text-[13px]'
  return (
    <form
      id={formId}
      onSubmit={(e) => void submit(e)}
      className="flex flex-col gap-3.5"
      aria-describedby={error ? errorId : undefined}
    >
      <p className="text-io-ink-2 m-0 text-[12.5px]">
        Pick the right {correction.label.toLowerCase()} and say why. {correction.consequence}
      </p>
      {correction.valueType === 'class' ? (
        <label htmlFor={valueId} className="flex flex-col gap-1.5 text-[12px] font-medium">
          <span className="text-io-ink-2">{correction.label}</span>
          <Select
            id={valueId}
            size="md"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            options={correction.choices.map((c) => ({ value: c.key, label: c.label }))}
          />
        </label>
      ) : correction.valueType === 'option' ? (
        <>
          {search ? (
            <label htmlFor={searchId} className="flex flex-col gap-1.5 text-[12px] font-medium">
              <span className="text-io-ink-2">Search for another record</span>
              <input
                id={searchId}
                type="search"
                className={field}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                maxLength={120}
                placeholder="A reference, client or supplier"
              />
            </label>
          ) : null}
          {shown.length ? (
            <OptionGroup
              name="value"
              legend={correction.label}
              value={value}
              onValueChange={setValue}
              items={shown.map((c) => ({
                value: c.key,
                title: c.label,
                ...(c.sub ? { sub: c.sub } : {}),
              }))}
            />
          ) : (
            <p className="text-io-ink-3 m-0 text-[12.5px]">No record found yet.</p>
          )}
        </>
      ) : (
        <label htmlFor={valueId} className="flex flex-col gap-1.5 text-[12px] font-medium">
          <span className="text-io-ink-2">{correction.label}</span>
          <input
            id={valueId}
            className={field}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={300}
          />
        </label>
      )}
      <label htmlFor={reasonId} className="flex flex-col gap-1.5 text-[12px] font-medium">
        <span className="text-io-ink-2">Why is it wrong?</span>
        <input
          id={reasonId}
          name="reason"
          className={field}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          required
          placeholder="One line, e.g. the sender is a supplier, not a client"
        />
      </label>
      {error ? (
        <p id={errorId} role="alert" className="text-io-bad-solid m-0 text-[12.5px]">
          {error}
        </p>
      ) : null}
    </form>
  )
}
