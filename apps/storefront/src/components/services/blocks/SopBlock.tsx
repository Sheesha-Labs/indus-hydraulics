import type { SopBlock } from '@indus/domain'

export default function SopBlockView({ block }: { block: SopBlock }) {
  return (
    <div className="my-4 mb-7 overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] font-sans">
      <div className="mono flex items-center justify-between bg-[var(--color-primary)] px-5 py-3.5 text-[11px] uppercase tracking-[0.1em] text-[var(--color-elevated)]">
        <span>{block.header}</span>
        <span>
          <strong className="font-medium text-[var(--color-accent)]">{block.completion}</strong>
        </span>
      </div>
      {block.phases.map((phase, pi) => (
        <div key={pi}>
          <div className="mono border-t border-[var(--color-border-2)] px-5 pb-2 pt-4 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-muted)] [&:first-of-type]:border-t-0">
            {phase.name}
          </div>
          {phase.rows.map((row, ri) => (
            <div
              key={ri}
              className="grid grid-cols-[24px_1fr_90px_120px] items-center gap-4.5 border-b border-dashed border-[var(--color-border-2)] px-5 py-3 text-sm last:border-b-0 max-md:grid-cols-[24px_1fr]"
            >
              <div
                className={`grid size-[18px] place-items-center rounded-[3px] border-[1.5px] text-xs font-semibold ${
                  row.done
                    ? 'border-[var(--color-good)] bg-[var(--color-good)] text-white'
                    : 'border-[var(--color-caption)] bg-[var(--color-elevated)]'
                }`}
                aria-label={row.done ? 'Done' : 'Pending'}
              >
                {row.done ? '✓' : ''}
              </div>
              <div>
                <strong className="font-medium text-[var(--color-primary)]">{row.task}</strong>
                <small className="mt-0.5 block text-xs text-[var(--color-muted)]">{row.detail}</small>
              </div>
              <div className="mono text-[11px] tracking-[0.04em] text-[var(--color-muted)] max-md:hidden">
                {row.who}
              </div>
              <div className="mono rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-center text-[11px] text-[var(--color-muted)] max-md:hidden">
                {row.tool}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
