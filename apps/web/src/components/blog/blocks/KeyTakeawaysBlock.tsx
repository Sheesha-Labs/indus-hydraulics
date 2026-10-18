import type { AsOfStampBlock, KeyTakeawaysBlock } from '@indus/domain'
import { AsOfStampLine } from './AsOfStampBlock'

/**
 * The navy "At a glance" panel. On an article page it is lifted to the top of
 * the reading column with the first `as_of_stamp` inside it, so the summary
 * and how fresh its figures are read as one thing.
 *
 * Still a plain ordered list of short sentences underneath — that is what an
 * answer engine lifts when it summarises the page, so the decoration is all in
 * the classes, never in extra wrapping markup.
 */
export default function KeyTakeawaysBlockView({
  block,
  stamp,
}: {
  block: KeyTakeawaysBlock
  stamp?: AsOfStampBlock | undefined
}) {
  const heading = block.heading ?? 'Key takeaways'
  return (
    <section aria-label={heading} className="rounded-lg bg-ih-navy p-5 min-[761px]:px-[26px] min-[761px]:py-6">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-steel">At a glance</p>
      <h2 className="mt-1.5 font-serif text-[24px] font-normal leading-[1.15] tracking-[-0.01em] text-white min-[761px]:text-[30px]">
        {heading}
      </h2>
      <ol className="m-0 mt-3.5 grid list-none grid-cols-1 p-0 min-[761px]:grid-cols-2 min-[761px]:gap-x-8">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 border-t border-white/14 py-[11px] text-[15px] leading-[1.55] text-ih-on-navy-strong"
          >
            <span aria-hidden="true" className="pt-[3px] font-mono text-[11.5px] text-ih-steel">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      {stamp && <AsOfStampLine block={stamp} tone="navy" />}
    </section>
  )
}
