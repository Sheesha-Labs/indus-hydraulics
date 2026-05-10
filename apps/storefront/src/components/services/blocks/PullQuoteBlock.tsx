import type { PullQuoteBlock } from '@indus/domain'

export default function PullQuoteBlockView({ block }: { block: PullQuoteBlock }) {
  return (
    <blockquote className="-mx-8 my-10 border-l-[3px] border-l-[var(--color-accent)] bg-[var(--color-elevated)] px-8 py-7 font-serif text-2xl italic leading-[1.35] tracking-[-0.005em] text-[var(--color-primary)]">
      {block.quote}
      <cite className="mono mt-3.5 block text-[11px] not-italic uppercase tracking-[0.08em] text-[var(--color-muted)]">
        {block.cite}
      </cite>
    </blockquote>
  )
}
