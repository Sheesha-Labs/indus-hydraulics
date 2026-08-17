import type { FaqBlock } from '@indus/domain'

/**
 * Native `<details>` rather than a hand-rolled accordion. packages/ui has no
 * Accordion primitive, and CLAUDE.md §10.5 requires any new overlay or
 * disclosure to own its focus handling — `<details>` already does, keyboard
 * and screen-reader behaviour included, with no client JS.
 *
 * The same items feed FAQPage JSON-LD from the page, read back out of the
 * blocks rather than stored twice, so the markup and the structured data
 * cannot drift apart.
 */
export default function FaqBlockView({ block }: { block: FaqBlock }) {
  return (
    <section className="my-8">
      {block.heading && (
        <h2 className="mb-4 text-[20px] font-semibold tracking-tight text-ih-ink">{block.heading}</h2>
      )}
      <div className="flex flex-col border-t border-ih-border">
        {block.items.map((item, i) => (
          <details key={i} className="group border-b border-ih-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[14.5px] font-medium text-ih-ink marker:content-none hover:text-ih-accent">
              {item.question}
              <span
                aria-hidden="true"
                className="mono shrink-0 text-[15px] text-ih-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-4 pr-8 text-[14px] leading-[1.65] text-ih-ink-2">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
