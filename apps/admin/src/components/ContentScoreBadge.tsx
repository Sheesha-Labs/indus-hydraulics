import { bandForScore } from '@indus/domain'

type ContentScoreBadgeProps = {
  score: number
  /** Compact pill (list grid) vs full pill with label (editor panel). */
  compact?: boolean
}

const BAND_CLASSES: Record<ReturnType<typeof bandForScore>, string> = {
  good: 'bg-[oklch(0.94_0.06_145)] text-[oklch(0.4_0.14_145)]',
  warn: 'bg-[oklch(0.96_0.07_85)] text-[oklch(0.45_0.13_75)]',
  danger: 'bg-[oklch(0.96_0.04_25)] text-[oklch(0.5_0.12_25)]',
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
        className={`inline-flex items-center justify-center min-w-[36px] h-5 px-1.5 font-mono text-[11px] font-semibold ${BAND_CLASSES[band]}`}
        title={`Content depth: ${BAND_LABELS[band]}`}
      >
        {score}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 font-mono text-[11px] font-semibold ${BAND_CLASSES[band]}`}
    >
      <span>{score}</span>
      <span className="opacity-80">·</span>
      <span>{BAND_LABELS[band]}</span>
    </span>
  )
}
