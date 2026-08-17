import type { KeyTakeawaysBlock } from '@indus/domain'

/**
 * Opens the article. Deliberately plain markup — a `<ul>` of short sentences
 * is what an answer engine lifts when it summarises the page, and wrapping it
 * in decorative spans only gets in the way.
 */
export default function KeyTakeawaysBlockView({ block }: { block: KeyTakeawaysBlock }) {
  return (
    <aside className="my-6 rounded-lg border border-ih-border bg-ih-surface-2 p-5">
      <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
        {block.heading ?? 'Key takeaways'}
      </p>
      <ul className="flex list-none flex-col gap-2.5 p-0">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[14.5px] leading-[1.55] text-ih-ink-2">
            <span aria-hidden="true" className="mono shrink-0 text-[11px] text-ih-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
