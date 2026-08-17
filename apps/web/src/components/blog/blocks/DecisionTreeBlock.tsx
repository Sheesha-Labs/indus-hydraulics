import Link from 'next/link'
import type { DecisionTreeBlock } from '@indus/domain'

/**
 * Branching selection logic as an ordered list of condition → outcome pairs,
 * not a drawn flowchart. An SVG tree is prettier and unreadable on a phone,
 * unparseable by an answer engine, and impossible to translate. This shape
 * survives all three.
 */
export default function DecisionTreeBlockView({ block }: { block: DecisionTreeBlock }) {
  return (
    <section className="my-8 rounded-lg border border-ih-border bg-ih-surface p-5">
      <h3 className="mb-1.5 text-[17px] font-semibold tracking-tight text-ih-ink">{block.heading}</h3>
      {block.intro && <p className="mb-4 text-[14px] leading-[1.6] text-ih-muted">{block.intro}</p>}
      <ol className="flex list-none flex-col gap-0 p-0">
        {block.branches.map((branch, i) => (
          <li key={i} className="border-t border-ih-border py-3.5 first:border-t-0 first:pt-0">
            <p className="mono mb-1 text-[10.5px] uppercase tracking-[0.12em] text-ih-muted">
              If · {branch.condition}
            </p>
            <p className="text-[14.5px] font-medium text-ih-ink">{branch.outcome}</p>
            {branch.detail && (
              <p className="mt-1 text-[13.5px] leading-[1.55] text-ih-ink-2">{branch.detail}</p>
            )}
            {branch.sku && (
              <Link
                href={`/search?q=${encodeURIComponent(branch.sku)}`}
                className="mono mt-1.5 inline-block text-[11.5px] text-ih-accent hover:underline"
              >
                {branch.sku} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
