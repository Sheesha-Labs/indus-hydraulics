import Link from 'next/link'
import { DownloadsSchema, GalleryImageIdsSchema, SpecsAtGlanceSchema } from '@indus/domain'
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
      {props.ctaCardTitle || props.ctaCardBody ? (
        <div className="border-ih-ink bg-ih-navy rounded-sm border p-4.5 font-sans text-white">
          <div className="text-ih-steel mb-3 text-[11px] font-semibold tracking-[0.1em] uppercase">
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
          {/* /contact, not /quote: a service job starts with a conversation,
              not a parts shortlist (owner call, 2026-11-19). */}
          <Link
            href="/contact"
            className="bg-ih-accent hover:bg-ih-accent-hover mt-3 block w-full rounded-sm px-3 py-2.5 text-center text-sm font-medium text-white"
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
        <div className="border-ih-border bg-ih-surface rounded-sm border p-4.5">
          <div className="mono text-ih-muted-2 mb-3 text-[10px] tracking-[0.12em] uppercase">
            From the field
          </div>
          <p className="text-ih-ink m-0 mb-3 font-serif text-[15px] leading-[1.5] italic">
            “{props.pullQuoteText}”
          </p>
          {props.pullQuoteAuthor || props.pullQuoteRole ? (
            <div className="border-ih-border flex items-center gap-2.5 border-t pt-3">
              {/* The site favicon, as on the /services featured card. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- a route-served brand mark, not an optimisable asset */}
              <img
                src="/tab-icon.png"
                alt=""
                width={32}
                height={32}
                className="border-ih-border bg-ih-surface size-8 shrink-0 rounded-full border object-contain p-1"
              />
              <div>
                {props.pullQuoteAuthor ? (
                  <strong className="text-[13px] font-medium">{props.pullQuoteAuthor}</strong>
                ) : null}
                {props.pullQuoteRole || props.pullQuoteLocation ? (
                  <small className="mono text-ih-muted mt-0.5 block text-[10px] tracking-[0.06em] uppercase">
                    {[props.pullQuoteRole, props.pullQuoteLocation].filter(Boolean).join(' · ')}
                  </small>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {specs.length > 0 ? (
        <div className="border-ih-border bg-ih-surface rounded-sm border p-4.5">
          <div className="mono text-ih-muted-2 mb-3 text-[10px] tracking-[0.12em] uppercase">
            Specs at a glance
          </div>
          <table className="mono w-full border-collapse text-[11.5px]">
            <tbody>
              {specs.map((row, i) => (
                <tr key={i}>
                  <td
                    className={`text-ih-muted py-1.5 ${
                      i > 0 ? 'border-ih-border border-t border-dashed' : ''
                    }`}
                  >
                    {row.label}
                  </td>
                  <td
                    className={`py-1.5 text-right ${
                      i > 0 ? 'border-ih-border border-t border-dashed' : ''
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
        <div className="border-ih-border bg-ih-surface rounded-sm border p-4.5">
          <div className="mono text-ih-muted-2 mb-3 text-[10px] tracking-[0.12em] uppercase">
            From the case file
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {props.galleryThumbs.slice(0, 6).map((t, i) => (
              <PlaceholderImage
                key={t.id}
                storagePath={t.storagePath}
                alt={t.alt ?? `Case figure ${i + 1}`}
                placeholderLabel={`FIG.0${i + 1}`}
                className="border-ih-border aspect-square border"
                sizes="120px"
              />
            ))}
          </div>
          {props.galleryTotalCount > 6 ? (
            <Link
              href="#"
              className="border-ih-border bg-ih-bg hover:border-ih-accent mt-2.5 block rounded-sm border px-3 py-2 text-center text-xs"
            >
              View {props.galleryTotalCount} photos →
            </Link>
          ) : null}
        </div>
      ) : galleryIds.length > 0 ? null : null}

      {downloads.length > 0 ? (
        <div className="border-ih-border bg-ih-surface rounded-sm border p-4.5">
          <div className="mono text-ih-muted-2 mb-3 text-[10px] tracking-[0.12em] uppercase">
            Downloads
          </div>
          <ul className="mono space-y-0 text-[11.5px]">
            {downloads.map((d, i) => (
              <li
                key={i}
                className={`flex justify-between py-2 ${
                  i < downloads.length - 1 ? 'border-ih-border border-b border-dashed' : ''
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
