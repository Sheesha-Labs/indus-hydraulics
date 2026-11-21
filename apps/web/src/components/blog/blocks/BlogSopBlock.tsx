import type { SopBlock } from '@indus/domain'
import { CheckIcon } from '../../designed/icons'

/**
 * The blog's view of a procedure checklist.
 *
 * Same schema as the service case studies' SOP, separate view: the article
 * redesign uses numbered step boxes and a who/tool list per row, and the case
 * studies keep their own layout untouched.
 *
 * A done step shows a tick and is announced "Done"; an open one shows its step
 * number. The state is never carried by the fill colour alone.
 */
export default function BlogSopBlockView({ block }: { block: SopBlock }) {
  return (
    <figure className="border-ih-border bg-ih-surface m-0 min-w-0 overflow-hidden rounded-lg border">
      <figcaption className="bg-ih-navy text-ih-on-navy flex justify-between gap-4 px-4 py-3 font-mono text-[10px] font-medium tracking-[0.1em] uppercase min-[761px]:px-5 min-[761px]:py-3.5 min-[761px]:text-[11px]">
        <span>{block.header}</span>
        <span className="shrink-0 text-white">{block.completion}</span>
      </figcaption>
      {block.phases.map((phase, pi) => (
        <div key={pi}>
          <p className="border-ih-border text-ih-ink border-b px-4 py-3 text-[13px] font-semibold min-[761px]:px-5">
            {phase.name}
          </p>
          <ol className="m-0 list-none p-0">
            {phase.rows.map((row, ri) => (
              <li
                key={ri}
                className="border-ih-border grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-b px-4 py-3.5 last:border-b-0 min-[761px]:grid-cols-[32px_minmax(0,1fr)_200px] min-[761px]:gap-4 min-[761px]:px-5 min-[761px]:py-4"
              >
                <span
                  className={`grid size-7 place-items-center rounded-md border font-mono text-[11px] ${
                    row.done
                      ? 'border-ih-accent bg-ih-accent text-white'
                      : 'border-ih-border-strong text-ih-muted'
                  }`}
                >
                  {row.done ? (
                    <>
                      <CheckIcon size={14} />
                      <span className="sr-only">Done</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">{String(ri + 1).padStart(2, '0')}</span>
                      <span className="sr-only">To do</span>
                    </>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-ih-ink text-[15px] font-semibold">{row.task}</p>
                  <p className="text-ih-ink-2 mt-1 text-[14px] leading-[1.6]">{row.detail}</p>
                </div>
                <dl className="col-start-2 m-0 grid grid-cols-[auto_auto] content-start justify-start gap-4 min-[761px]:col-start-3 min-[761px]:grid-cols-2 min-[761px]:gap-2">
                  <div>
                    <dt className="text-ih-muted font-mono text-[9.5px] tracking-[0.12em] uppercase">
                      Who
                    </dt>
                    <dd className="text-ih-ink m-0 mt-0.5 text-[13px]">{row.who}</dd>
                  </div>
                  <div>
                    <dt className="text-ih-muted font-mono text-[9.5px] tracking-[0.12em] uppercase">
                      Tool
                    </dt>
                    <dd className="text-ih-ink m-0 mt-0.5 text-[13px]">{row.tool}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </figure>
  )
}
