import type { ReferencesBlock } from '@indus/domain'

/**
 * A numbered bibliography, closing an article that argues from the literature.
 *
 * Distinct from `standard_citation`, which is one structured reference to one
 * published standard, rendered inline where the argument leans on it. This is
 * the list at the end: twenty entries, each already formatted in the article's
 * citation style, none of them a standard.
 *
 * Each entry carries a stable `id` and is rendered with a matching anchor, so
 * a body reference can link to it rather than asking the reader to scroll and
 * scan. `scroll-mt` keeps the target clear of the sticky header when it does.
 *
 * The list is `<ol>` with explicit numbering suppressed and the index rendered
 * in the margin, so the numbers stay aligned when an entry wraps to three
 * lines — which most of them do.
 */
export default function ReferencesBlockView({ block }: { block: ReferencesBlock }) {
  return (
    <section className="border-ih-border mt-8 border-t pt-7">
      <h2 className="text-ih-ink mb-4 text-[17px] font-semibold">
        {block.heading ?? 'References'}
      </h2>
      <ol className="list-none space-y-2.5 p-0">
        {block.entries.map((entry, i) => (
          <li
            key={entry.id}
            id={`ref-${entry.id}`}
            className="text-ih-ink-2 grid scroll-mt-[124px] grid-cols-[2rem_1fr] text-[14px] leading-[1.6] min-[761px]:scroll-mt-[184px]"
          >
            <span className="mono text-ih-muted text-[11.5px]">{i + 1}.</span>
            <span>
              {entry.text}
              {entry.url ? (
                <>
                  {' '}
                  <a
                    href={entry.url}
                    rel="nofollow noopener"
                    target="_blank"
                    aria-label="Open source"
                    className="mono text-ih-accent inline-flex min-h-10 min-w-10 items-center justify-center text-[11.5px] hover:underline"
                  >
                    ↗
                  </a>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
