'use client'

import { CORRECTION_REASON_LABEL, CORRECTION_REASONS, type CorrectionReason } from '@indus/ops-core'
import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { startCorrectionAction } from '../../actions/start-correction'

/**
 * Board 114 part 2 · "Send a correction instead?" (S06-T07): opened when an undo finds the email already left.
 * The person picks what was wrong (chips) and may add a note; Start asks the Assistant for a correction card
 * in Review (same thread, same mailbox, always for a person to approve).
 */
export interface CorrectionTarget {
  actionId: string
  ref: string
  /** "10:19", when known. */
  at: string | null
}

const Ctx = createContext<((t: CorrectionTarget) => void) | null>(null)

/** Opens the correction modal. Needs <CorrectionProvider> (mounted by the console Providers). */
export function useOfferCorrection(): (t: CorrectionTarget) => void {
  const open = useContext(Ctx)
  if (!open) throw new Error('useOfferCorrection() needs <CorrectionProvider>')
  return open
}

export function CorrectionProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<CorrectionTarget | null>(null)
  const open = useCallback((t: CorrectionTarget) => setTarget(t), [])
  const value = useMemo(() => open, [open])
  return (
    <Ctx value={value}>
      {children}
      {target ? (
        <CorrectionModal key={target.actionId} target={target} onClose={() => setTarget(null)} />
      ) : null}
    </Ctx>
  )
}

export default function CorrectionModal({
  target,
  onClose,
}: {
  target: CorrectionTarget
  onClose: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const noteId = useId()
  const [reason, setReason] = useState<CorrectionReason>('wrong_price')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setBusy(true)
    setError(null)
    try {
      const r = await startCorrectionAction({
        actionId: target.actionId,
        reason,
        note: note.trim() || null,
      })
      if (!r.success) {
        setError(r.error)
        return
      }
      toast({
        kind: 'success',
        title:
          r.data.kind === 'reissue'
            ? `Reissued as ${r.data.ref} · in Review for your approval`
            : 'The Assistant is drafting a correction · it will wait in Review',
      })
      onClose()
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
      title="Send a correction instead?"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" busy={busy} onClick={() => void start()}>
            Start correction
          </Button>
        </>
      }
      note="Nothing is sent until you approve the card."
    >
      <div className="flex flex-col gap-3.5">
        <Banner tone="info" title={`${target.ref} left${target.at ? ` at ${target.at}` : ''}.`}>
          It can’t be recalled. Send a correction instead?
        </Banner>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="text-io-ink mb-2 text-[13px] font-medium">What was wrong?</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="What was wrong?">
            {CORRECTION_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={
                  reason === r
                    ? 'bg-io-navy border-io-navy rounded-io-pill io-focus h-io-btn border px-3.5 text-[13px] text-white'
                    : 'bg-io-card border-io-stroke text-io-ink rounded-io-pill io-focus h-io-btn hover:bg-io-fill border px-3.5 text-[13px]'
                }
              >
                {CORRECTION_REASON_LABEL[r]}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor={noteId} className="flex flex-col gap-1.5 text-[12px] font-medium">
          <span className="text-io-ink-2">Note for the Assistant (optional)</span>
          <input
            id={noteId}
            className="io-focus-field border-io-stroke rounded-io-ctl bg-io-card text-io-ink h-io-field w-full border px-2.5 text-[13px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={400}
            placeholder="e.g. line 2 unit price was shown incorrectly"
          />
        </label>
        <section aria-label="The Assistant will" className="flex flex-col gap-1.5">
          <h3 className="io-eyebrow m-0">The Assistant will</h3>
          <ol className="text-io-ink-2 m-0 flex list-decimal flex-col gap-1 pl-5 text-[13px]">
            <li>Draft a short correction in the same thread, from the same mailbox.</li>
            <li>Put it in Review as one card for your approval; you add the corrected figure.</li>
          </ol>
        </section>
        {error ? (
          <p role="alert" className="text-io-bad-solid m-0 text-[12.5px]">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
