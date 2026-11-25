'use client'

import { verbPhrase, type AutopilotLevel } from '@indus/ops-core'
import { Button } from '@indus/ops-ui/controls'
import { Modal } from '@indus/ops-ui/overlay'

const TO_WORD: Partial<Record<AutopilotLevel, string>> = {
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
}

export interface LevelSwitchConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  to: AutopilotLevel
  lines: { from: string[]; stillAsks: string | null } | undefined
  busy?: boolean
  onConfirm: () => void
}

/**
 * Board 102 state 4 · "Let the Assistant chase suppliers without asking?": shown before an action is raised to
 * Do and tell or Do quietly (from a row, the drawer or an earned suggestion). It lists what happens from now on
 * (the action's rules) and which guardrails still ask. Cancel leaves the level as it was.
 */
export default function LevelSwitchConfirm({
  open,
  onOpenChange,
  label,
  to,
  lines,
  busy = false,
  onConfirm,
}: LevelSwitchConfirmProps) {
  const word = TO_WORD[to] ?? to
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Let the Assistant ${verbPhrase(label)} without asking?`}
      actions={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" busy={busy} onClick={onConfirm}>{`Switch to ${word}`}</Button>
        </>
      }
    >
      <div data-part="switch-confirm" className="flex flex-col gap-2 text-[13px]">
        <p className="m-0">From now on:</p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-[18px]">
          {(lines?.from ?? []).map((l) => (
            <li key={l}>{l}</li>
          ))}
          {lines?.stillAsks ? <li>{lines.stillAsks}</li> : null}
        </ul>
      </div>
    </Modal>
  )
}
