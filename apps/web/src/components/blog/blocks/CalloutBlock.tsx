import type { CalloutBlock } from '@indus/domain'
import { DangerIcon, InfoIcon, WarningIcon } from '../../designed/icons'

/**
 * `danger` is reserved for genuine safety content — injection injury, stored
 * energy, whip restraint. Every tone shows a text label AND its own icon shape
 * (circle, triangle, octagon), so colour is never the only signal — and a red
 * box means nothing to a reader who has skipped straight to it.
 */
const TONES = {
  note: {
    box: 'border-ih-border-strong bg-ih-surface',
    label: 'text-ih-accent',
    name: 'Note',
    Icon: InfoIcon,
  },
  warning: {
    box: 'border-ih-warning-line bg-ih-warning-tint',
    label: 'text-ih-warning-ink',
    name: 'Warning',
    Icon: WarningIcon,
  },
  danger: {
    box: 'border-ih-danger-line bg-ih-danger-tint',
    label: 'text-ih-danger-label',
    name: 'Danger',
    Icon: DangerIcon,
  },
} as const

export default function CalloutBlockView({ block }: { block: CalloutBlock }) {
  const tone = TONES[block.tone]
  return (
    <aside
      role={block.tone === 'danger' ? 'note' : undefined}
      className={`rounded-lg border px-[22px] py-5 ${tone.box}`}
    >
      <p
        className={`flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] ${tone.label}`}
      >
        <tone.Icon />
        {tone.name}
      </p>
      <h3 className="mt-2.5 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-ih-ink">{block.title}</h3>
      <p className="mt-1.5 text-[15px] leading-[1.65] text-ih-ink-2">{block.body}</p>
    </aside>
  )
}
