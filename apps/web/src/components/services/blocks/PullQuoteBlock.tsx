import type { PullQuoteBlock } from '@indus/domain'

export default function PullQuoteBlockView({ block }: { block: PullQuoteBlock }) {
  return (
    <blockquote className="border-l-ih-accent bg-ih-surface text-ih-ink -mx-8 my-10 border-l-[3px] px-8 py-7 font-serif text-2xl leading-[1.35] tracking-[-0.005em] italic">
      {block.quote}
      <cite className="mono text-ih-muted mt-3.5 block text-[11px] tracking-[0.08em] uppercase not-italic">
        {block.cite}
      </cite>
    </blockquote>
  )
}
