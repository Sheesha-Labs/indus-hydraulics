import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseDetail } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseDetail
}

/**
 * Hero block on /services/[slug]: pill row (topic + region + case meta),
 * H1 with optional italic-accent phrase, serif deck, hero figure with
 * caption strip overlay.
 */
export default function CaseHero({ case: c }: Props) {
  return (
    <section className="pt-10">
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <span className="mono bg-ih-accent px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-white">
          {c.topicLabel}
        </span>
        {c.region ? (
          <span className="mono bg-ih-navy px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-white">
            {c.region}
          </span>
        ) : null}
        <span className="mono text-[11px] uppercase tracking-[0.12em] text-ih-muted">
          CASE NO. {c.caseNumber}
          {c.caseDateLabel ? ` · ${c.caseDateLabel}` : ''}
        </span>
      </div>

      <h1 className="my-2 mb-5 max-w-[1080px] text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl xl:text-[72px]">
        {c.titleAccent ? renderTitleWithAccent(c.title, c.titleAccent) : c.title}
      </h1>

      <p className="mb-8 max-w-[720px] font-serif text-[22px] leading-[1.5] text-ih-muted">
        {c.deck}
      </p>

      <figure className="relative mt-4 border border-ih-border">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          placeholderLabel={`"${c.title}\\nhero 1320×560"`}
          className="aspect-[21/9]"
          priority
          sizes="(min-width: 1100px) 1300px, 100vw"
        />
        {(c.heroImageCaption || c.heroImageCredit) ? (
          <figcaption className="mono absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-[oklch(0_0_0/0.7)] to-transparent px-5 py-4 text-[11.5px] tracking-[0.06em] text-white">
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
