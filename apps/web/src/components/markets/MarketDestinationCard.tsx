import Link from 'next/link'
import type { MarketIndexCard } from '@indus/domain'
import type { MarketThumbnail } from '../../lib/market-thumbnails'
import MarketThumb from './MarketThumb'

/**
 * One destination card on `/markets`.
 *
 * ALWAYS A LINK. The design drew two card kinds — linked for a market with a
 * page, inert for one without — because it was drawn against a site where 80
 * of the 126 had no page. Here every destination has a live, indexed
 * `/markets/{slug}`, so rendering any of them unlinked would orphan a page
 * that already exists and throw away the reciprocal linking that is the whole
 * point of this index.
 *
 * The design's two card STATES survive, keyed on something the buyer actually
 * cares about: a transit band when we have one to state, "Quoted per
 * consignment" when we do not. Both are derived — see `marketTransitBand`.
 *
 * `data-mk-card` and `data-mk` are read by the toolbar's CSS filter. Keep them
 * on the outer element: the filter hides cards by attribute selector, so it
 * needs the search haystack on the same node it hides.
 */
export default function MarketDestinationCard({
  card,
  thumbnail,
}: {
  card: MarketIndexCard
  thumbnail: MarketThumbnail | null
}) {
  return (
    <Link
      href={`/markets/${card.slug}`}
      data-mk-card=""
      data-mk={card.search}
      className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
    >
      <div className="relative border-b border-ih-border bg-ih-surface-2 transition-colors group-hover:bg-ih-surface">
        <MarketThumb thumbnail={thumbnail} countryName={card.label} />
        {card.mode && (
          <span className="mono absolute right-[9px] top-2 rounded-[3px] bg-white/[0.88] px-[5px] py-0.5 text-[9px] tracking-[0.08em] text-ih-accent">
            {card.mode}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[5px] px-[15px] pb-[15px] pt-[13px]">
        <span className="text-[14.5px] font-medium leading-[1.25] tracking-[-0.01em] group-hover:text-ih-accent">
          {card.label}
        </span>
        {card.transit ? (
          <span className="mono text-[10px] tracking-[0.04em] text-ih-ink-2">{card.transit}</span>
        ) : (
          <span className="mono text-[10px] uppercase tracking-[0.04em] text-ih-muted-2">
            Quoted per consignment
          </span>
        )}
        <span className="mt-auto pt-1 text-[11.5px] text-ih-accent">
          Market page <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
