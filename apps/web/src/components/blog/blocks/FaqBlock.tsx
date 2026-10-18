import type { FaqBlock } from '@indus/domain'

/**
 * Every question and answer fully open — no accordion. The answers are
 * therefore in the HTML a crawler reads with no interaction, which is what the
 * FAQPage JSON-LD built from the same block claims, and the block needs no
 * client JavaScript or hand-rolled disclosure behaviour at all.
 *
 * The same items feed that JSON-LD from the page, read back out of the blocks
 * rather than stored twice, so the markup and the structured data cannot drift.
 */
export default function FaqBlockView({ block }: { block: FaqBlock }) {
  return (
    <section aria-label={block.heading ?? 'Frequently asked questions'} className="mt-8 border-t border-ih-border pt-7">
      <h2 className="mb-3 font-serif text-[26px] font-normal leading-[1.1] tracking-[-0.01em] text-ih-ink min-[761px]:text-[32px]">
        {block.heading ?? 'Frequently asked questions'}
      </h2>
      <dl className="m-0 grid grid-cols-1 gap-x-10 min-[761px]:grid-cols-2">
        {block.items.map((item, i) => (
          <div key={i} className="border-b border-ih-border py-[18px]">
            <dt className="text-[16px] font-semibold leading-[1.4] text-ih-ink">{item.question}</dt>
            <dd className="m-0 mt-1.5 text-[15px] leading-[1.65] text-ih-ink-2">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
