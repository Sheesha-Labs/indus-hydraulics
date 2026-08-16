import Link from 'next/link'
import {
  DownloadsSchema,
  GalleryImageIdsSchema,
  SpecsAtGlanceSchema,
} from '@indus/domain'
import PlaceholderImage from './PlaceholderImage'
import { mediaUrl } from '../../lib/media'

type Props = {
  ctaCardTitle: string | null
  ctaCardBody: string | null
  ctaCardPhone: string | null
  pullQuoteText: string | null
  pullQuoteAuthor: string | null
  pullQuoteRole: string | null
  pullQuoteLocation: string | null
  specsAtGlanceRaw: unknown
  galleryImageIdsRaw: unknown
  galleryTotalCount: number
  downloadsRaw: unknown
  /** Resolved gallery thumbs (id + storagePath + alt). Pre-fetched server-side. */
  galleryThumbs: Array<{ id: string; storagePath: string; alt: string | null }>
}

/**
 * Sticky right rail for /services/[slug]. Stack: dark CTA card, pull quote
 * with byline, "specs at a glance" mono table, case-file gallery (6 thumbs +
 * "View N photos" link), downloads list. Each card collapses gracefully when
 * its data is empty.
 */
export default function CaseRail(props: Props) {
  const specs = SpecsAtGlanceSchema.safeParse(props.specsAtGlanceRaw).data ?? []
  const galleryIds = GalleryImageIdsSchema.safeParse(props.galleryImageIdsRaw).data ?? []
  const downloads = DownloadsSchema.safeParse(props.downloadsRaw).data ?? []

  return (
    <aside className="space-y-3.5">
      {(props.ctaCardTitle || props.ctaCardBody) ? (
        <div className="rounded-sm border border-ih-ink bg-ih-navy p-4.5 font-sans text-white">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-ih-accent">
            Quote a similar job
          </div>
          {props.ctaCardTitle ? (
            <h4 className="mb-1.5 text-[15px] font-medium tracking-[-0.005em] text-white">
              {props.ctaCardTitle}
            </h4>
          ) : null}
          {props.ctaCardBody ? (
            <p className="m-0 text-[13px] leading-[1.5] text-[oklch(0.78_0.01_240)]">
              {props.ctaCardBody}
            </p>
          ) : null}
          <Link
            href="/quote"
            className="mt-3 block w-full rounded-sm bg-ih-accent px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-ih-accent-hover"
          >
            Open a service ticket
          </Link>
          {props.ctaCardPhone ? (
            <a
              href={`tel:${props.ctaCardPhone.replace(/[^+\d]/g, '')}`}
              className="mt-1.5 block w-full rounded-sm px-3 py-2 text-center text-sm text-[oklch(0.78_0.01_240)] hover:text-white"
            >
              {props.ctaCardPhone}
            </a>
          ) : null}
        </div>
      ) : null}

      {props.pullQuoteText ? (
        <div className="rounded-sm border border-ih-border bg-ih-surface p-4.5">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-ih-muted-2">
            From the field
          </div>
          <p className="m-0 mb-3 font-serif text-[15px] italic leading-[1.5] text-ih-ink">
            “{props.pullQuoteText}”
          </p>
          {(props.pullQuoteAuthor || props.pullQuoteRole) ? (
            <div className="flex items-center gap-2.5 border-t border-ih-border pt-3">
              <div className="size-8 rounded-full border border-ih-border bg-ih-surface-2" aria-hidden />
              <div>
                {props.pullQuoteAuthor ? <strong className="text-[13px] font-medium">{props.pullQuoteAuthor}</strong> : null}
                {(props.pullQuoteRole || props.pullQuoteLocation) ? (
                  <small className="mono mt-0.5 block text-[10px] uppercase tracking-[0.06em] text-ih-muted">
                    {[props.pullQuoteRole, props.pullQuoteLocation].filter(Boolean).join(' · ')}
                  </small>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {specs.length > 0 ? (
        <div className="rounded-sm border border-ih-border bg-ih-surface p-4.5">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-ih-muted-2">
            Specs at a glance
          </div>
          <table className="mono w-full border-collapse text-[11.5px]">
            <tbody>
              {specs.map((row, i) => (
                <tr key={i}>
                  <td
                    className={`py-1.5 text-ih-muted ${
                      i > 0 ? 'border-t border-dashed border-ih-border' : ''
                    }`}
                  >
                    {row.label}
                  </td>
                  <td
                    className={`py-1.5 text-right ${
                      i > 0 ? 'border-t border-dashed border-ih-border' : ''
                    }`}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {props.galleryThumbs.length > 0 ? (
        <div className="rounded-sm border border-ih-border bg-ih-surface p-4.5">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-ih-muted-2">
            From the case file
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {props.galleryThumbs.slice(0, 6).map((t, i) => (
              <PlaceholderImage
                key={t.id}
                storagePath={t.storagePath}
                alt={t.alt ?? `Case figure ${i + 1}`}
                placeholderLabel={`FIG.0${i + 1}`}
                className="aspect-square border border-ih-border"
                sizes="120px"
              />
            ))}
          </div>
          {props.galleryTotalCount > 6 ? (
            <Link
              href="#"
              className="mt-2.5 block rounded-sm border border-ih-border bg-ih-bg px-3 py-2 text-center text-xs hover:border-ih-accent"
            >
              View {props.galleryTotalCount} photos →
            </Link>
          ) : null}
        </div>
      ) : galleryIds.length > 0 ? null : null}

      {downloads.length > 0 ? (
        <div className="rounded-sm border border-ih-border bg-ih-surface p-4.5">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-ih-muted-2">
            Downloads
          </div>
          <ul className="mono space-y-0 text-[11.5px]">
            {downloads.map((d, i) => (
              <li
                key={i}
                className={`flex justify-between py-2 ${
                  i < downloads.length - 1 ? 'border-b border-dashed border-ih-border' : ''
                }`}
              >
                <a
                  href={d.url.startsWith('media:') ? mediaUrl(d.url.slice('media:'.length)) : d.url}
                  className="text-ih-accent hover:underline"
                >
                  {d.label}
                  {d.format ? ` (${d.format})` : ''}
                </a>
                <span className="text-ih-muted-2">{d.size}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}
