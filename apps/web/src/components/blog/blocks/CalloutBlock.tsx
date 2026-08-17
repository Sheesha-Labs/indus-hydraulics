import type { CalloutBlock } from '@indus/domain'

/**
 * `danger` is reserved for genuine safety content — injection injury, stored
 * energy, whip restraint. Tone is paired with a text label rather than carried
 * by colour alone, both for accessibility and because a red box means nothing
 * to a reader who has skipped straight to it.
 */
const TONES = {
  note: { border: 'border-ih-border-strong', bg: 'bg-ih-surface-2', label: 'Note', accent: 'text-ih-muted' },
  warning: { border: 'border-ih-warning', bg: 'bg-ih-warning-soft', label: 'Warning', accent: 'text-ih-warning' },
  danger: { border: 'border-ih-danger', bg: 'bg-ih-danger-soft', label: 'Safety', accent: 'text-ih-danger' },
} as const

export default function CalloutBlockView({ block }: { block: CalloutBlock }) {
  const tone = TONES[block.tone]
  return (
    <aside
      role={block.tone === 'danger' ? 'note' : undefined}
      className={`my-6 rounded-md border-l-4 ${tone.border} ${tone.bg} p-4`}
    >
      <p className={`mono mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.13em] ${tone.accent}`}>
        {tone.label}
      </p>
      <p className="mb-1 text-[14.5px] font-semibold text-ih-ink">{block.title}</p>
      <p className="text-[14px] leading-[1.6] text-ih-ink-2">{block.body}</p>
    </aside>
  )
}
