import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button, Eyebrow } from '@indus/ui'
import { ArrowRightIcon, CheckIcon, MailIcon } from '../designed/icons'
import type { ResourceContact, ResourceCtaCopy } from '../../lib/resources-content'

/**
 * The furniture every page in the resources section shares.
 *
 * One gutter, one breadcrumb strip, one numbered-section head and one navy
 * band, so the hub and the four reference pages read as a set rather than five
 * pages that happen to link to each other.
 */

/** Horizontal rhythm: 20 / 32 / 48px, the same steps as /markets. */
export const RESOURCE_GUTTER = 'px-5 sm:px-8 lg:px-12'
export const RESOURCE_WIDTH = 'mx-auto max-w-[1440px]'

/**
 * Clears the sticky site header (107px) with room to spare, so an in-page link
 * lands on its heading rather than under the header.
 */
export const ANCHOR_OFFSET = 'scroll-mt-[124px]'

export function ResourceBreadcrumbStrip({
  trail,
  meta,
}: {
  trail: readonly { label: string; href?: string }[]
  meta?: string
}) {
  return (
    <div className={`border-b border-ih-border bg-ih-surface py-3 ${RESOURCE_GUTTER}`}>
      <div className={`${RESOURCE_WIDTH} flex flex-wrap items-center justify-between gap-x-6 gap-y-2`}>
        <nav aria-label="Breadcrumb">
          <ol className="mono flex flex-wrap items-center gap-2 text-[12px] text-ih-muted">
            {trail.map((item, i) => {
              const last = i === trail.length - 1
              return (
                <li key={item.label} className="flex items-center gap-2">
                  {i > 0 ? (
                    <span aria-hidden="true" className="opacity-50">
                      /
                    </span>
                  ) : null}
                  {item.href && !last ? (
                    <Link href={item.href} className="hover:text-ih-accent">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-ih-ink-2" aria-current={last ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        {meta ? <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">{meta}</span> : null}
      </div>
    </div>
  )
}

/**
 * A numbered section: `/01` in accent mono, a serif H2, an optional lede.
 * The numbers are real — each page's sections are read in order.
 */
export function ResourceSection({
  id,
  number,
  eyebrow,
  title,
  lede,
  children,
  className = '',
}: {
  id: string
  number: string
  eyebrow?: string | null
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`${ANCHOR_OFFSET} ${className}`}>
      <div className="border-b border-ih-border pb-[13px]">
        <span aria-hidden="true" className="mb-2 block font-mono text-[11px] tracking-[0.06em] text-ih-accent">
          {number}
        </span>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2
          id={`${id}-heading`}
          className="max-w-[760px] text-balance font-serif text-[28px] font-normal leading-[1.12] tracking-[-0.01em] sm:text-[32px]"
        >
          {title}
        </h2>
      </div>
      {lede ? <p className="mt-4 max-w-[760px] text-[15px] leading-[1.65] text-ih-ink-2">{lede}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/**
 * The hub's section heads — the same `/01` spine as `ResourceSection`, without
 * the rule (the hub draws it under the head-and-intro row instead). Not the
 * shared `SectionHead`: its serif title inherits the body line-height, which
 * opens a wide gap between the lines of a two-line headline.
 */
export function HubSectionHead({ number, eyebrow, title }: { number: string; eyebrow?: string | null; title: ReactNode }) {
  return (
    <div>
      <span aria-hidden="true" className="mb-2 block font-mono text-[11px] tracking-[0.06em] text-ih-accent">
        {number}
      </span>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="max-w-[680px] text-balance font-serif text-[28px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[34px]">
        {title}
      </h2>
    </div>
  )
}

/**
 * The one navy band per page: what to send when a chart does not settle it.
 *
 * Copy is the `cta` section of Pages & Blocks · Resources, shared by all five
 * pages. Buttons build from store settings and a button with no value behind
 * it is dropped rather than shipped dead.
 */
export function ResourceCtaBand({ copy, contact }: { copy: ResourceCtaCopy; contact: ResourceContact }) {
  return (
    <section aria-labelledby="resource-cta-heading" className={`bg-ih-navy py-14 lg:py-[60px] ${RESOURCE_GUTTER}`}>
      <div
        className={`${RESOURCE_WIDTH} grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14`}
      >
        <div>
          {copy.eyebrow ? <Eyebrow className="text-ih-steel">{copy.eyebrow}</Eyebrow> : null}
          <h2
            id="resource-cta-heading"
            className="mt-3.5 max-w-[640px] text-balance font-serif text-[30px] font-normal leading-[1.08] tracking-[-0.01em] text-white sm:text-[40px]"
          >
            {copy.heading} {copy.headingEmphasis ? <em>{copy.headingEmphasis}</em> : null}
          </h2>
          {copy.body ? (
            <p className="mt-4 max-w-[600px] text-[15px] leading-[1.65] text-[oklch(0.84_0.02_250)]">{copy.body}</p>
          ) : null}

          <div className="mt-[26px] flex flex-wrap gap-2.5">
            {contact.whatsappHref && copy.whatsappLabel ? (
              <Button asChild kind="onnavy" size="lg">
                <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                  {copy.whatsappLabel}
                  <ArrowRightIcon />
                </a>
              </Button>
            ) : null}
            {copy.emailLabel ? (
              <Button asChild kind="onnavy" size="lg">
                <a href={contact.mailtoHref}>
                  <MailIcon />
                  {copy.emailLabel}
                </a>
              </Button>
            ) : null}
          </div>

          {contact.phone && copy.phonePrefix ? (
            <p className="mono mt-[22px] text-[11px] uppercase tracking-[0.08em] text-[oklch(0.75_0.03_250)]">
              {copy.phonePrefix}{' '}
              <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="underline underline-offset-4 hover:text-white">
                {contact.phone}
              </a>
            </p>
          ) : null}
        </div>

        {copy.checklist.length > 0 ? (
          <div className="rounded-lg border border-white/15 bg-ih-navy-2 px-6 pb-6 pt-5">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-steel">What to send</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {copy.checklist.map((item) => (
                <li key={item} className="flex gap-3 text-[14px] leading-[1.5] text-white/90">
                  <span className="mt-[3px] text-ih-steel">
                    <CheckIcon size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
