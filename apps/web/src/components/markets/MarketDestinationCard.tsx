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
      className="group border-ih-border bg-ih-surface hover:border-ih-accent flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <div className="border-ih-border bg-ih-surface-2 group-hover:bg-ih-surface relative border-b transition-colors">
        <MarketThumb thumbnail={thumbnail} countryName={card.label} slug={card.slug} />
        {card.mode && (
          <span className="mono text-ih-accent absolute top-2 right-[9px] rounded-[3px] bg-white/[0.88] px-[5px] py-0.5 text-[9px] tracking-[0.08em]">
            {card.mode}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[5px] px-[15px] pt-[13px] pb-[15px]">
        <span className="group-hover:text-ih-accent text-[14.5px] leading-[1.25] font-medium tracking-[-0.01em]">
          {card.label}
        </span>
        {card.transit ? (
          <span className="mono text-ih-ink-2 text-[10px] tracking-[0.04em]">{card.transit}</span>
        ) : (
          <span className="mono text-ih-muted-2 text-[10px] tracking-[0.04em] uppercase">
            Quoted per consignment
          </span>
        )}
        <span className="text-ih-accent mt-auto pt-1 text-[11.5px]">
          Market page <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
