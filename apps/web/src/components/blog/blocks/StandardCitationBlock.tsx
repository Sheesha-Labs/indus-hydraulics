import type { StandardCitationBlock } from '@indus/domain'

/**
 * A structured reference to a published standard.
 *
 * This block exists because the hose shelf-life figures circulating across
 * this industry are misattributed to SAE when they originate in ARPM IP-11-1.
 * Showing designation, publisher, edition and clause together makes an
 * article's sourcing checkable at a glance — which is most of why a page ends
 * up being the one an assistant trusts.
 */
export default function StandardCitationBlockView({ block }: { block: StandardCitationBlock }) {
  const meta = [block.clause, block.edition].filter(Boolean).join(' · ')
  return (
    <figure className="m-0 rounded-lg border border-ih-border bg-ih-surface px-5 py-[18px]">
      <figcaption className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <cite className="font-mono text-[14px] font-medium not-italic text-ih-ink">
          {block.url ? (
            <a
              href={block.url}
              rel="nofollow noopener"
              target="_blank"
              className="inline-flex min-h-10 items-center text-ih-accent underline decoration-1 underline-offset-[3px] transition-colors duration-150 hover:text-ih-accent-hover motion-reduce:transition-none"
            >
              {block.standard}
            </a>
          ) : (
            block.standard
          )}
        </cite>
        <span className="rounded-sm border border-ih-border-strong px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-ih-muted">
          {block.publisher}
        </span>
        {meta && <span className="font-mono text-[10px] tracking-[0.06em] text-ih-muted">{meta}</span>}
      </figcaption>
      <p className="mt-2 text-[15px] font-medium leading-[1.4] text-ih-ink">{block.title}</p>
      <p className="mt-1.5 text-[14px] leading-[1.6] text-ih-ink-2">{block.summary}</p>
    </figure>
  )
}
