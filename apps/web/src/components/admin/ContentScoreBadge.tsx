import { bandForScore } from '@indus/domain'

type ContentScoreBadgeProps = {
  score: number
  /** Compact pill (list grid) vs full pill with label (editor panel). */
  compact?: boolean
}

const BAND_CLASSES: Record<ReturnType<typeof bandForScore>, string> = {
  good: 'bg-ih-success-soft text-ih-success-ink',
  warn: 'bg-[oklch(0.96_0.07_85)] text-[oklch(0.45_0.13_75)]',
  danger: 'bg-ih-danger-soft text-ih-danger-ink',
}

const BAND_LABELS: Record<ReturnType<typeof bandForScore>, string> = {
  good: 'Strong',
  warn: 'Needs work',
  danger: 'Thin',
}

export default function ContentScoreBadge({ score, compact = false }: ContentScoreBadgeProps) {
  const band = bandForScore(score)
  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[36px] h-5 px-1.5 font-mono text-[11px] font-medium ${BAND_CLASSES[band]}`}
        title={`Content depth: ${BAND_LABELS[band]}`}
      >
        {score}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 font-mono text-[11px] font-medium ${BAND_CLASSES[band]}`}
    >
      <span>{score}</span>
      <span className="opacity-80">·</span>
      <span>{BAND_LABELS[band]}</span>
    </span>
  )
}
