import Link from 'next/link'
import type { DecisionTreeBlock } from '@indus/domain'
import { ArrowRightIcon } from '../../designed/icons'

/**
 * Branching selection logic as an ordered list of condition → outcome pairs,
 * not a drawn flowchart. An SVG tree is prettier and unreadable on a phone,
 * unparseable by an answer engine, and impossible to translate. This shape
 * survives all three.
 */
export default function DecisionTreeBlockView({ block }: { block: DecisionTreeBlock }) {
  return (
    <section
      aria-label={block.heading}
      className="border-ih-border bg-ih-surface min-w-0 rounded-lg border p-[18px] min-[761px]:p-6"
    >
      <h3 className="text-ih-ink text-[19px] font-semibold tracking-[-0.015em]">{block.heading}</h3>
      {block.intro && (
        <p className="text-ih-ink-2 mt-1.5 text-[14.5px] leading-[1.6]">{block.intro}</p>
      )}
      <ol className="mt-[18px] flex list-none flex-col p-0">
        {block.branches.map((branch, i) => (
          <li
            key={i}
            className="border-ih-border grid grid-cols-[28px_minmax(0,1fr)] gap-x-2.5 gap-y-2 border-t py-4 min-[761px]:grid-cols-[36px_minmax(0,1fr)_minmax(0,1.15fr)] min-[761px]:gap-5"
          >
            <span aria-hidden="true" className="text-ih-muted pt-0.5 font-mono text-[12px]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-ih-ink text-[14.5px] leading-[1.5]">
              <span className="bg-ih-surface-2 text-ih-ink-2 mr-2 inline-block rounded-sm px-1.5 py-px font-mono text-[10px] font-medium tracking-[0.1em] uppercase">
                If
              </span>
              {branch.condition}
            </p>
            <div className="col-start-2 min-w-0 min-[761px]:col-start-3">
              <p className="text-ih-accent text-[15px] font-semibold">{branch.outcome}</p>
              {branch.detail && (
                <p className="text-ih-ink-2 mt-1 text-[14px] leading-[1.6]">{branch.detail}</p>
              )}
              {branch.sku && (
                <Link
                  href={`/search?q=${encodeURIComponent(branch.sku)}`}
                  className="text-ih-accent hover:text-ih-accent-hover inline-flex min-h-10 items-center gap-1.5 font-mono text-[12px] transition-colors duration-150 hover:underline motion-reduce:transition-none"
                >
                  {branch.sku}
                  <ArrowRightIcon size={14} />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
