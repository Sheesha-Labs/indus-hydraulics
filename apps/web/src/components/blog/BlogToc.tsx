import ReadingProgress from '../services/ReadingProgress'

type Props = {
  /** Derived by `blogTocEntries` — already parsed, unlike CaseToc which re-parses. */
  entries: Array<{ anchor: string; title: string }>
  estimatedMinutes: number
}

/**
 * Sticky left TOC, built from the `section_head` blocks in the article body.
 *
 * Takes already-derived entries rather than raw JSON. CaseToc re-parses the
 * whole block array a second time purely to find its anchors; the page here
 * has parsed once already and hands the result to both the TOC and the
 * renderer.
 *
 * Renders nothing when an article has no section heads — a lone "In this
 * article" heading over an empty list is worse than no rail at all.
 */
export default function BlogToc({ entries, estimatedMinutes }: Props) {
  if (entries.length === 0) return null

  return (
    <nav className="mono text-[11.5px]" aria-label="Article contents">
      <div className="mb-1 border-b border-ih-border pb-3 uppercase tracking-[0.12em] text-ih-muted-2">
        In this article
      </div>
      {entries.map((entry, i) => (
        <a
          key={entry.anchor}
          href={`#${entry.anchor}`}
          className="flex gap-2.5 border-b border-dashed border-ih-border py-2.5 leading-[1.4] text-ih-muted hover:text-ih-accent"
        >
          <span className="w-[18px] flex-shrink-0 text-ih-muted-2">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>{entry.title.replace(/\.$/, '')}</span>
        </a>
      ))}
      <ReadingProgress estimatedMinutes={estimatedMinutes} />
    </nav>
  )
}
