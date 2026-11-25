'use client'

import type { AutopilotLevel, AutopilotMode, AutopilotModeOrCustom } from '@indus/ops-core'
import { Button, Segmented } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setModeAction } from '../../app/(console)/assistant/autopilot/actions/autopilot'
import { usePauseControls } from '../shell/use-pause-controls'

const MODE_WORD: Record<AutopilotModeOrCustom, string> = {
  careful: 'Careful',
  balanced: 'Balanced',
  hands_off: 'Hands-off',
  custom: 'Custom',
}
const LEVEL_WORD: Partial<Record<AutopilotLevel, string>> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
}

export interface MasterCardProps {
  isOwner: boolean
  pausedAt: string | null
  mode: { value: AutopilotModeOrCustom; version: number }
  preview: Record<
    AutopilotMode,
    { changed: number; byLevel: Partial<Record<AutopilotLevel, number>> }
  >
  firstDay: boolean
}

/**
 * Board 98's master card: whether the Assistant runs (Pause everything / Resume, the S05 actions), and the mode
 * (Careful · Balanced · Hands-off, with Custom shown when any row differs from its preset; Custom is shown, never
 * chosen). Choosing a preset asks first with the count of rows that change, by new level (board 98 / D17).
 * The Helper sees the card but cannot pause or switch (board 102 state 6).
 */
export default function MasterCard({
  isOwner,
  pausedAt,
  mode,
  preview,
  firstDay,
}: MasterCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { pause, resume } = usePauseControls()
  const [target, setTarget] = useState<AutopilotMode | null>(null)
  const [busy, setBusy] = useState(false)
  const paused = pausedAt !== null

  async function apply(next: AutopilotMode) {
    setBusy(true)
    const res = await setModeAction({ mode: next, expectedVersion: mode.version })
    setBusy(false)
    setTarget(null)
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({
      kind: 'success',
      title: `Autopilot set to ${MODE_WORD[next]} · ${res.data.changed} changed`,
    })
    router.refresh()
  }

  const p = target ? preview[target] : null
  return (
    <section
      data-part="autopilot-master"
      aria-label="Assistant"
      className="rounded-io-card border-io-line bg-io-card flex w-[380px] flex-none flex-col gap-3 border px-[18px] py-4"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn('rounded-io-pill size-2.5', paused ? 'bg-io-warn' : 'bg-io-ok')}
        />
        <h2 className="m-0 flex-1 text-[15px] font-medium">
          {paused ? 'Assistant paused' : 'Assistant running'}
        </h2>
        {isOwner ? (
          paused ? (
            <Button variant="secondary" onClick={() => void resume()}>
              Resume
            </Button>
          ) : (
            <Button variant="danger" onClick={() => void pause()}>
              Pause everything
            </Button>
          )
        ) : null}
      </div>
      <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">
        {paused
          ? 'Nothing is read or sent until you resume. Mail keeps arriving in Gmail; nothing is lost.'
          : 'Pausing stops all reading and sending at once. Mail keeps arriving in Gmail; nothing is lost.'}
      </p>
      <div className="flex items-center gap-2.5">
        <span className="text-[12.5px]">Mode</span>
        {isOwner ? (
          <Segmented<AutopilotModeOrCustom>
            aria-label="Autopilot mode"
            value={mode.value}
            options={(['careful', 'balanced', 'hands_off', 'custom'] as const).map((m) => ({
              value: m,
              label: MODE_WORD[m],
            }))}
            onValueChange={(v) => {
              if (v !== 'custom' && v !== mode.value) setTarget(v)
            }}
          />
        ) : (
          <span className="text-io-ink-2 text-[12.5px]">{MODE_WORD[mode.value]} · read only</span>
        )}
      </div>
      {firstDay ? (
        <p data-part="first-day" className="text-io-ink-2 m-0 text-[12.5px] leading-[1.5]">
          Everything except classifying and linking mail asks you. Suggestions to relax a level
          appear once you have approved 25 of a kind without edits.
        </p>
      ) : null}
      {target && p ? (
        <Modal
          open
          onOpenChange={(o) => {
            if (!o) setTarget(null)
          }}
          title={`Switch Autopilot to ${MODE_WORD[target]}?`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                busy={busy}
                onClick={() => void apply(target)}
              >{`Switch to ${MODE_WORD[target]}`}</Button>
            </>
          }
        >
          <div className="flex flex-col gap-2 text-[13px]">
            <p className="m-0">
              {p.changed === 0
                ? 'No action changes level.'
                : `${p.changed} ${p.changed === 1 ? 'action changes' : 'actions change'} level:`}
            </p>
            {p.changed ? (
              <ul className="m-0 flex list-disc flex-col gap-1 pl-[18px]">
                {Object.entries(p.byLevel).map(([level, n]) => (
                  <li key={level}>
                    {n} to {LEVEL_WORD[level as AutopilotLevel] ?? level}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              Locked actions, guardrails and fixed rules do not change.
              {target !== 'careful' ? ' This preset is awaiting your sign-off.' : ''}
            </p>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
