import type { ApproachGridBlock } from '@indus/domain'

export default function ApproachGridBlockView({ block }: { block: ApproachGridBlock }) {
  return (
    <div
      className="my-2 mb-6 grid gap-px border border-ih-border bg-ih-border font-sans"
      style={{ gridTemplateColumns: `repeat(${Math.min(block.phases.length, 4)}, 1fr)` }}
    >
      {block.phases.map((p, i) => (
        <div key={i} className="flex min-h-[220px] flex-col bg-ih-surface px-5 pb-6 pt-5">
          <span className="mono text-[11px] uppercase tracking-[0.1em] text-ih-accent">
            {p.number}
          </span>
          <h4 className="mb-2 mt-2 text-[17px] tracking-[-0.01em] leading-tight">{p.title}</h4>
          <p className="m-0 text-[13px] leading-[1.55] text-ih-muted">{p.body}</p>
          <div className="mono mt-auto border-t border-dashed border-ih-border pt-3 text-[10.5px] uppercase tracking-[0.08em] text-ih-ink">
            {p.duration}
          </div>
        </div>
      ))}
    </div>
  )
}
