import type { ProblemSolutionBlock } from '@indus/domain'

export default function ProblemSolutionBlockView({ block }: { block: ProblemSolutionBlock }) {
  return (
    <div className="my-6 mb-8 grid grid-cols-1 gap-3 font-sans md:grid-cols-2">
      <div className="border-ih-border bg-ih-surface rounded-sm border border-t-[3px] border-t-[oklch(0.55_0.15_30)] px-5 pt-5 pb-5">
        <div className="mono mb-2 text-[10.5px] tracking-[0.14em] text-[oklch(0.5_0.15_30)] uppercase">
          ⚠ {block.problem.label}
        </div>
        <h4 className="text-ih-ink mb-2 text-[17px] tracking-[-0.01em]">{block.problem.title}</h4>
        <p className="text-ih-ink-2 m-0 text-sm leading-[1.55]">{block.problem.body}</p>
      </div>
      <div className="border-ih-border border-t-ih-success bg-ih-surface rounded-sm border border-t-[3px] px-5 pt-5 pb-5">
        <div className="mono text-ih-success mb-2 text-[10.5px] tracking-[0.14em] uppercase">
          ✓ {block.solution.label}
        </div>
        <h4 className="text-ih-ink mb-2 text-[17px] tracking-[-0.01em]">{block.solution.title}</h4>
        <p className="text-ih-ink-2 m-0 text-sm leading-[1.55]">{block.solution.body}</p>
      </div>
    </div>
  )
}
