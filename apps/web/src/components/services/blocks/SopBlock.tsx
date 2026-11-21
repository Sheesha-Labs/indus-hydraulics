import type { SopBlock } from '@indus/domain'

export default function SopBlockView({ block }: { block: SopBlock }) {
  return (
    <div className="border-ih-border bg-ih-surface my-4 mb-7 overflow-hidden rounded-sm border font-sans">
      <div className="sc-on-dark bg-ih-navy flex items-center justify-between gap-4 px-5 py-3.5 text-[12px] font-medium tracking-[0.08em] text-white uppercase">
        <span>{block.header}</span>
        <span>
          <strong className="font-semibold text-white tabular-nums">{block.completion}</strong>
        </span>
      </div>
      {block.phases.map((phase, pi) => (
        <div key={pi}>
          <div className="mono border-ih-border text-ih-muted border-t px-5 pt-4 pb-2 text-[10.5px] tracking-[0.12em] uppercase [&:first-of-type]:border-t-0">
            {phase.name}
          </div>
          {phase.rows.map((row, ri) => (
            <div
              key={ri}
              className="border-ih-border grid grid-cols-[24px_1fr_90px_120px] items-center gap-4.5 border-b border-dashed px-5 py-3 text-sm last:border-b-0 max-md:grid-cols-[24px_1fr]"
            >
              <div
                className={`grid size-[18px] place-items-center rounded-[3px] border-[1.5px] text-xs font-semibold ${
                  row.done
                    ? 'border-ih-success bg-ih-success text-white'
                    : 'border-ih-border-strong bg-ih-surface'
                }`}
                aria-label={row.done ? 'Done' : 'Pending'}
              >
                {row.done ? '✓' : ''}
              </div>
              <div>
                <strong className="text-ih-ink font-medium">{row.task}</strong>
                <small className="text-ih-muted mt-0.5 block text-xs">{row.detail}</small>
              </div>
              <div className="mono text-ih-muted text-[11px] tracking-[0.04em] max-md:hidden">
                {row.who}
              </div>
              <div className="mono border-ih-border bg-ih-bg text-ih-muted rounded-sm border px-2 py-0.5 text-center text-[11px] max-md:hidden">
                {row.tool}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
