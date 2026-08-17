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
  return (
    <figure className="my-6 rounded-lg border border-ih-border-strong bg-ih-surface p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <cite className="mono text-[13px] font-medium not-italic text-ih-ink">{block.standard}</cite>
        <span className="mono text-[10.5px] uppercase tracking-[0.12em] text-ih-muted">
          {block.publisher}
          {block.edition ? ` · ${block.edition}` : ''}
          {block.clause ? ` · ${block.clause}` : ''}
        </span>
      </figcaption>
      <p className="mb-2 text-[14px] font-medium leading-[1.45] text-ih-ink">{block.title}</p>
      <p className="text-[14px] leading-[1.6] text-ih-ink-2">{block.summary}</p>
      {block.url && (
        <a
          href={block.url}
          rel="nofollow noopener"
          target="_blank"
          className="mono mt-3 inline-block text-[11.5px] text-ih-accent hover:underline"
        >
          View the standard ↗
        </a>
      )}
    </figure>
  )
}
