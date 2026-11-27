'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, type RefObject } from 'react'
import { addQuestionAction } from '../../../app/(console)/enquiries/[ref]/questions/actions/questions'

/**
 * Board 171 · "Add question" (the header's CTA, `?add=1`; S09-T07): the lines to ask about and, optionally, what
 * to ask. The Assistant drafts the email (#7) for Review; only those lines are held once it is approved.
 */
const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field w-full border px-2.5 py-2 text-[13px] leading-[1.45]'

export default function AddQuestionSheet({
  enquiryId,
  enquiryRef,
  lines,
}: {
  enquiryId: string
  enquiryRef: string
  lines: Array<{ no: number; description: string }>
}) {
  const search = useSearchParams()
  const path = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const open = search.get('add') === '1'
  const [picked, setPicked] = useState<number[]>([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const close = () => router.replace(path as Route, { scroll: false })
  // The header's "Add question" link re-renders with the URL; it is found again when the sheet closes.
  const back = useMemo(
    () =>
      ({
        get current() {
          return typeof document === 'undefined'
            ? null
            : document.querySelector<HTMLElement>('a[href$="/questions?add=1"]')
        },
      }) as RefObject<HTMLElement | null>,
    []
  )
  async function ask() {
    setBusy(true)
    const r = await addQuestionAction({
      enquiryId,
      ref: enquiryRef,
      lineNos: picked,
      ...(note.trim() ? { note: note.trim() } : {}),
    })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({ kind: 'success', title: 'The Assistant is drafting the questions for Review' })
    setPicked([])
    setNote('')
    close()
    router.refresh()
  }
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
      title="Ask the client before sourcing"
      variant="sheet"
      eyebrow={`Add question · ${enquiryRef}`}
      returnFocusRef={back}
      actions={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" disabled={busy || !picked.length} onClick={ask}>
            {busy
              ? 'Asking…'
              : `Draft ${picked.length || ''} question${picked.length === 1 ? '' : 's'}`.replace(
                  '  ',
                  ' '
                )}
          </Button>
        </>
      }
      note="Only the lines you pick are held; the rest go to suppliers."
    >
      {lines.length ? (
        <fieldset className="m-0 border-0 p-0">
          <legend className="io-eyebrow">Lines to ask about</legend>
          <ul className="m-0 mt-2 flex max-h-72 list-none flex-col gap-1 overflow-y-auto p-0">
            {lines.map((l) => {
              const on = picked.includes(l.no)
              return (
                <li key={l.no}>
                  <label className="hover:bg-io-fill rounded-io-ctl flex cursor-pointer items-start gap-2.5 px-2 py-1.5 text-[13px]">
                    <input
                      type="checkbox"
                      className="io-focus mt-0.5 size-4"
                      checked={on}
                      onChange={() =>
                        setPicked(
                          on
                            ? picked.filter((x) => x !== l.no)
                            : [...picked, l.no].sort((a, b) => a - b)
                        )
                      }
                    />
                    <span className="text-io-ink-3 w-8 flex-none tabular-nums">#{l.no}</span>
                    <span className="min-w-0">{l.description}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      ) : (
        <p className="m-0">Every line has gone to suppliers or is already waiting on a question.</p>
      )}
      <label className="io-eyebrow mt-4 block" htmlFor="add-question-note">
        What to ask (optional)
      </label>
      <textarea
        id="add-question-note"
        rows={3}
        className={`${FIELD} mt-2`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. trim material and the flange rating"
      />
    </Modal>
  )
}
