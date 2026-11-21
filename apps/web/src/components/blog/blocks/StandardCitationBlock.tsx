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
    <figure className="border-ih-border bg-ih-surface m-0 rounded-lg border px-5 py-[18px]">
      <figcaption className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <cite className="text-ih-ink font-mono text-[14px] font-medium not-italic">
          {block.url ? (
            <a
              href={block.url}
              rel="nofollow noopener"
              target="_blank"
              className="text-ih-accent hover:text-ih-accent-hover inline-flex min-h-10 items-center underline decoration-1 underline-offset-[3px] transition-colors duration-150 motion-reduce:transition-none"
            >
              {block.standard}
            </a>
          ) : (
            block.standard
          )}
        </cite>
        <span className="border-ih-border-strong text-ih-muted rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em]">
          {block.publisher}
        </span>
        {meta && (
          <span className="text-ih-muted font-mono text-[10px] tracking-[0.06em]">{meta}</span>
        )}
      </figcaption>
      <p className="text-ih-ink mt-2 text-[15px] leading-[1.4] font-medium">{block.title}</p>
      <p className="text-ih-ink-2 mt-1.5 text-[14px] leading-[1.6]">{block.summary}</p>
    </figure>
  )
}
