import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseDetail } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseDetail
}

/**
 * Hero block on /services/[slug]: pill row (topic + region + case meta),
 * H1 with optional italic-accent phrase, deck, hero figure with caption strip.
 *
 * Sized so the title AND the photo are on the first screen (owner call,
 * 2026-11-19). The H1 used to run to 72px and fill the viewport by itself.
 * It is now ~40px at desktop, the deck is Geist (it was a 22px serif), and
 * the figure's height is whatever the screen has left after the header and
 * the text, clamped between 220px and 520px, with the photo cropped to fit.
 */
export default function CaseHero({ case: c }: Props) {
  return (
    <section className="pt-6 sm:pt-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ih-accent px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white">
          {c.topicLabel}
        </span>
        {c.region ? (
          <span className="rounded-full bg-ih-navy px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white">
            {c.region}
          </span>
        ) : null}
        <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-ih-muted">
          CASE NO. {c.caseNumber}
          {c.caseDateLabel ? ` · ${c.caseDateLabel}` : ''}
        </span>
      </div>

      <h1 className="mb-3 max-w-[1120px] text-balance text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[32px] lg:text-[38px] xl:text-[42px]">
        {c.titleAccent ? renderTitleWithAccent(c.title, c.titleAccent) : c.title}
      </h1>

      <p className="mb-5 max-w-[760px] text-[15.5px] leading-[1.55] text-ih-muted sm:text-[17px]">
        {c.deck}
      </p>

      <figure className="relative overflow-hidden rounded-[var(--radius-lg)] border border-ih-border">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          placeholderLabel={`"${c.title}\\nhero 1320×560"`}
          className="h-[clamp(220px,calc(100svh-107px-330px),520px)]"
          priority
          sizes="(min-width: 1100px) 1300px, 100vw"
        />
        {(c.heroImageCaption || c.heroImageCredit) ? (
          <figcaption className="absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-[oklch(0_0_0/0.7)] to-transparent px-5 py-3.5 text-[12px] text-white">
            <span>{c.heroImageCaption ?? ''}</span>
            <span>{c.heroImageCredit ?? ''}</span>
          </figcaption>
        ) : null}
      </figure>
    </section>
  )
}

function renderTitleWithAccent(title: string, accent: string): React.ReactNode {
  const idx = title.indexOf(accent)
  if (idx < 0) return title
  return (
    <>
      {title.slice(0, idx)}
      <em className="font-normal italic text-ih-accent">{accent}</em>
      {title.slice(idx + accent.length)}
    </>
  )
}
