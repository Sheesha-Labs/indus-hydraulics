import type { SopBlock } from '@indus/domain'

export default function SopBlockView({ block }: { block: SopBlock }) {
  return (
    <div className="my-4 mb-7 overflow-hidden rounded-sm border border-ih-border bg-ih-surface font-sans">
      <div className="mono flex items-center justify-between bg-ih-navy px-5 py-3.5 text-[11px] uppercase tracking-[0.1em] text-white">
        <span>{block.header}</span>
        <span>
          <strong className="font-medium text-ih-accent">{block.completion}</strong>
        </span>
      </div>
      {block.phases.map((phase, pi) => (
        <div key={pi}>
          <div className="mono border-t border-ih-border px-5 pb-2 pt-4 text-[10.5px] uppercase tracking-[0.12em] text-ih-muted [&:first-of-type]:border-t-0">
            {phase.name}
          </div>
          {phase.rows.map((row, ri) => (
            <div
              key={ri}
              className="grid grid-cols-[24px_1fr_90px_120px] items-center gap-4.5 border-b border-dashed border-ih-border px-5 py-3 text-sm last:border-b-0 max-md:grid-cols-[24px_1fr]"
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
                <strong className="font-medium text-ih-ink">{row.task}</strong>
                <small className="mt-0.5 block text-xs text-ih-muted">{row.detail}</small>
              </div>
              <div className="mono text-[11px] tracking-[0.04em] text-ih-muted max-md:hidden">
                {row.who}
              </div>
              <div className="mono rounded-sm border border-ih-border bg-ih-bg px-2 py-0.5 text-center text-[11px] text-ih-muted max-md:hidden">
                {row.tool}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
