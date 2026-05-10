import type { SectionHeadBlock } from '@indus/domain'

export default function SectionHeadBlockView({ block }: { block: SectionHeadBlock }) {
  return (
    <div
      id={block.anchor}
      className="mb-4 mt-14 flex scroll-mt-6 items-baseline gap-3.5 border-t border-[var(--color-border)] pt-4 first:mt-0 first:border-t-0 first:pt-0"
    >
      <span className="mono text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">
        {block.number}
      </span>
      <h2 className="m-0 flex-1 font-sans text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-primary)]">
        {block.title}
      </h2>
    </div>
  )
}
