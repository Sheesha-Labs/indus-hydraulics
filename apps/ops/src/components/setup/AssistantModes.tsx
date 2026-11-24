'use client'

import { presetSummary, type AutopilotMode, type AutopilotModeOrCustom } from '@indus/ops-core'
import { cn } from '@indus/ops-ui/lib/cn'
import { useToast } from '@indus/ops-ui/overlay'
import { Tag } from '@indus/ops-ui/status'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { applyAutopilotPresetAction } from '../../actions/autopilot'
import { useSaveStatus } from './SaveStatus'

/**
 * Setup 5 · How much should the Assistant do? (board 83), the client half: three radio cards. Choosing
 * one applies the preset at once (applyAutopilotPresetAction: every configurable, unlocked Autopilot row
 * plus `assistant.mode`, one transaction) and toasts "Autopilot set to Balanced · n actions changed" with
 * Undo, which re-applies the previous mode (an internal effect: nothing is sent). While a change is in
 * flight the cards are disabled; a refused change puts the selection back and says why.
 */

export interface AssistantModesProps {
  /** Custom (S07, D17): no card is selected until the Owner picks one. */
  mode: AutopilotModeOrCustom
  version: number
  /** The undo window of the toast (the `undo` setting). */
  undoMs: number
}

type ModeCard = {
  mode: AutopilotMode
  name: string
  recommended?: boolean
  points: readonly string[]
  /** P01: the preset's contents still wait for the Owner's sign-off. */
  awaiting?: boolean
}

const CARDS: readonly ModeCard[] = [
  {
    mode: 'careful',
    name: 'Careful',
    recommended: true,
    points: [
      'Drafts everything; sends nothing without you',
      'Except supplier reminders you have approved once',
      'Files and labels mail on its own',
    ],
  },
  {
    mode: 'balanced',
    name: 'Balanced',
    awaiting: true,
    points: [
      'Creates enquiries and captures supplier quotes, tells you after',
      'Chases suppliers on its own',
      'Asks before RFQs, quotations and client mail',
    ],
  },
  {
    mode: 'hands_off',
    name: 'Hands-off',
    awaiting: true,
    points: [
      'Sends RFQs to known suppliers on its own',
      'Chases and relays questions on its own',
      'Still asks for quotations, supplier POs and anything new',
    ],
  },
]

export default function AssistantModes({ mode: initial, version, undoMs }: AssistantModesProps) {
  const status = useSaveStatus()
  const { toast } = useToast()
  const [mode, setMode] = useState<AutopilotModeOrCustom>(initial)
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const versionRef = useRef(version)

  async function apply(next: AutopilotMode, options: { undo: boolean }) {
    const before = mode
    setPending(true)
    setProblem(null)
    setMode(next)
    status.report('saving')
    const res = await applyAutopilotPresetAction({
      mode: next,
      expectedVersion: versionRef.current,
    })
    setPending(false)
    if (!res.success) {
      setMode(before)
      setProblem(res.error)
      status.report('error')
      return res
    }
    versionRef.current = res.data.version
    status.report('saved', res.data.savedAt)
    const previous = res.data.previous
    // Undo re-applies a preset; from Custom there is no preset to go back to (the rows were set one by one).
    if (options.undo && previous && previous !== 'custom' && previous !== next) {
      toast({
        kind: 'success',
        title: presetSummary(res.data.mode, res.data.changed),
        undo: { remainingMs: undoMs, onUndo: () => apply(previous, { undo: false }) },
      })
    } else if (!options.undo) {
      toast({ kind: 'info', title: presetSummary(res.data.mode, res.data.changed) })
    }
    return res
  }

  return (
    <div data-assistant-modes="" className="flex max-w-[1040px] flex-col gap-4">
      <fieldset className="m-0 border-0 p-0" disabled={pending} aria-busy={pending}>
        <legend className="sr-only">Assistant mode</legend>
        <div className="grid grid-cols-3 gap-4">
          {CARDS.map((card) => {
            const on = card.mode === mode
            return (
              <label
                key={card.mode}
                data-mode={card.mode}
                data-state={on ? 'on' : 'off'}
                className={cn(
                  'rounded-io-card flex cursor-pointer flex-col gap-2.5 p-5',
                  on
                    ? 'border-io-accent bg-io-accent-wash border-[1.5px]'
                    : 'border-io-line bg-io-card hover:border-io-stroke-hover border'
                )}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="assistant-mode"
                    value={card.mode}
                    checked={on}
                    onChange={() => void apply(card.mode, { undo: true })}
                    className="border-io-stroke rounded-io-pill bg-io-card io-focus checked:border-io-accent m-0 size-4 flex-none cursor-pointer appearance-none border checked:border-[5px]"
                  />
                  <span className="text-io-ink text-[17px] font-medium">{card.name}</span>
                  {card.recommended ? <Tag kind="action">Recommended to start</Tag> : null}
                </span>
                <ul className="text-io-ink-2 m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-[12.5px] leading-[1.45]">
                  {card.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {card.awaiting ? (
                  <span className="mt-auto pt-1">
                    <Tag kind="level">
                      Preset contents awaiting sign-off
                      <span className="sr-only">
                        . The Owner has not confirmed this preset yet.
                      </span>
                    </Tag>
                  </span>
                ) : null}
              </label>
            )
          })}
        </div>
      </fieldset>

      {problem ? (
        <p role="alert" className="text-io-bad text-[12.5px]">
          {problem}
        </p>
      ) : null}

      <Link
        href="/assistant/autopilot"
        className="text-io-accent io-focus rounded-io-tag self-start text-[13px] font-medium hover:underline"
      >
        Fine-tune in Autopilot →
      </Link>

      <div className="border-io-line bg-io-card rounded-io-8 flex items-center gap-2.5 border px-4 py-3.5 text-[13px]">
        <Lock aria-hidden="true" className="text-io-ink-3 size-4 flex-none" strokeWidth={1.75} />
        The Assistant never sends prices to clients or moves money without you.
      </div>
    </div>
  )
}
