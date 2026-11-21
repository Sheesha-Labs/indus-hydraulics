import type { SectionHeadBlock } from '@indus/domain'

export default function SectionHeadBlockView({ block }: { block: SectionHeadBlock }) {
  return (
    <div
      id={block.anchor}
      className="border-ih-border mt-14 mb-4 flex scroll-mt-6 items-baseline gap-3.5 border-t pt-4 first:mt-0 first:border-t-0 first:pt-0"
    >
      <span className="mono text-ih-accent text-xs tracking-[0.12em] uppercase">
        {block.number}
      </span>
      <h2 className="text-ih-ink m-0 flex-1 font-sans text-3xl leading-[1.1] font-semibold tracking-[-0.02em]">
        {block.title}
      </h2>
    </div>
  )
}
