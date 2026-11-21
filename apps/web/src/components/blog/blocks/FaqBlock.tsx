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
    <section
      aria-label={block.heading ?? 'Frequently asked questions'}
      className="border-ih-border mt-8 border-t pt-7"
    >
      <h2 className="text-ih-ink mb-3 font-serif text-[26px] leading-[1.1] font-normal tracking-[-0.01em] min-[761px]:text-[32px]">
        {block.heading ?? 'Frequently asked questions'}
      </h2>
      <dl className="m-0 grid grid-cols-1 gap-x-10 min-[761px]:grid-cols-2">
        {block.items.map((item, i) => (
          <div key={i} className="border-ih-border border-b py-[18px]">
            <dt className="text-ih-ink text-[16px] leading-[1.4] font-semibold">{item.question}</dt>
            <dd className="text-ih-ink-2 m-0 mt-1.5 text-[15px] leading-[1.65]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
