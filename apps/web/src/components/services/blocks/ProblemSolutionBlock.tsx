import type { ProblemSolutionBlock } from '@indus/domain'

export default function ProblemSolutionBlockView({ block }: { block: ProblemSolutionBlock }) {
  return (
    <div className="my-6 mb-8 grid grid-cols-1 gap-3 font-sans md:grid-cols-2">
      <div className="rounded-sm border border-ih-border border-t-[3px] border-t-[oklch(0.55_0.15_30)] bg-ih-surface px-5 pb-5 pt-5">
        <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-[oklch(0.5_0.15_30)]">
          ⚠ {block.problem.label}
        </div>
        <h4 className="mb-2 text-[17px] tracking-[-0.01em] text-ih-ink">
          {block.problem.title}
        </h4>
        <p className="m-0 text-sm leading-[1.55] text-ih-ink-2">{block.problem.body}</p>
      </div>
      <div className="rounded-sm border border-ih-border border-t-[3px] border-t-ih-success bg-ih-surface px-5 pb-5 pt-5">
        <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-ih-success">
          ✓ {block.solution.label}
        </div>
        <h4 className="mb-2 text-[17px] tracking-[-0.01em] text-ih-ink">
          {block.solution.title}
        </h4>
        <p className="m-0 text-sm leading-[1.55] text-ih-ink-2">{block.solution.body}</p>
      </div>
    </div>
  )
}
