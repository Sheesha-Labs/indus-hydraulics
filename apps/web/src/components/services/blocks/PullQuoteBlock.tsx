import type { PullQuoteBlock } from '@indus/domain'

export default function PullQuoteBlockView({ block }: { block: PullQuoteBlock }) {
  return (
    <blockquote className="-mx-8 my-10 border-l-[3px] border-l-ih-accent bg-ih-surface px-8 py-7 font-serif text-2xl italic leading-[1.35] tracking-[-0.005em] text-ih-ink">
      {block.quote}
      <cite className="mono mt-3.5 block text-[11px] not-italic uppercase tracking-[0.08em] text-ih-muted">
        {block.cite}
      </cite>
    </blockquote>
  )
}
