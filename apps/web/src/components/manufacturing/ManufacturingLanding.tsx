import type { ReactNode } from 'react'
import Link from 'next/link'
import type { DesignedEnquiry, ManufacturingOemStep, ManufacturingPage } from '@indus/domain'
import {
  Breadcrumb,
  Button,
  Card,
  Eyebrow,
  HairlineCell,
  HairlineGrid,
  Note,
  SectionHead,
  SpecList,
  Stat,
} from '@indus/ui'
import DesignedFigure from '../designed/DesignedFigure'
import DrawingCta from '../designed/DrawingCta'
import {
  ArrowRightIcon,
  CheckIcon,
  DocIcon,
  GaugeIcon,
  MailIcon,
  SettingsIcon,
  TruckIcon,
  UploadIcon,
  WrenchIcon,
} from '../designed/icons'
import ManufacturingEnquiryForm from './ManufacturingEnquiryForm'

/**
 * `/manufacturing` — seven bands, one navy panel, one conversion.
 *
 * SIBLING OF THE DATA-CENTRE PAGE. Same tokens, same section rhythm, same
 * hairline grids, same enquiry card shape, same one-navy-panel rule. The two
 * should read as one family, which is why the figure, the drawing CTA and the
 * icon set live in `components/designed/` rather than in either page.
 *
 * THE WORKSHOP BLOCKS ARE PLAIN DOCUMENT FLOW. The design was originally a tab
 * switcher and was deliberately changed: all three workshops have to be
 * readable by scrolling, because they are the page's evidence and a buyer
 * should not have to discover that two thirds of it is behind a control. Do not
 * reintroduce tabs or an accordion, and do not gate any of it on scroll
 * position.
 *
 * NO SHADOWS. Surfaces separate with 1px rules.
 *
 * THE HAIRLINE BANDS take their column count from utilities rather than
 * `HairlineGrid`'s `columns` prop, because that prop sets `grid-template-columns`
 * inline and would beat every breakpoint below it.
 */

const ENQUIRY_ANCHOR = 'manufacturing-enquiry'
const FILE_INPUT_ID = 'manufacturing-enquiry-file'

const SECTION = 'mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12'
/** 72px vertical rhythm; consecutive bands drop the top so the head does the work. */
const BAND = 'py-14 lg:py-[72px]'
const BAND_TIGHT = 'pb-14 lg:pb-[72px]'
const LEDE = 'max-w-[900px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]'

/** The OEM step icons, by the record's closed union. */
const OEM_ICON: Record<ManufacturingOemStep['icon'], (props: { size?: number; className?: string }) => ReactNode> = {
  upload: UploadIcon,
  gauge: GaugeIcon,
  wrench: WrenchIcon,
  settings: SettingsIcon,
  truck: TruckIcon,
}

export default function ManufacturingLanding({
  page,
  enquiry,
  contactPhone,
  contactEmail,
  whatsappHref,
  mailtoHref,
}: {
  page: ManufacturingPage
  enquiry: DesignedEnquiry
  contactPhone: string | null
  contactEmail: string | null
  whatsappHref: string | null
  mailtoHref: string
}) {
  const { hero, workshops, process, oem, build, closing, related } = page

  return (
    <div>
      {/* ─── 1 · HERO ─────────────────────────────────────────────────── */}
      <section className="border-b border-ih-border bg-ih-surface">
        <div className={`${SECTION} pb-12 pt-7 lg:pb-[52px]`}>
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'SERVICES', href: '/services' },
              { label: page.breadcrumbLabel.toUpperCase() },
            ]}
          />

          {/*
            `items-end`, not centred: the spec table's last row is meant to sit
            on the CTA row's baseline. On a phone the columns stack and the
            alignment is moot, so it only applies from lg.
          */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-14">
            <div>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
              <h1 className="mt-[18px] text-balance font-serif text-[32px] font-normal leading-[1.04] tracking-[-0.01em] sm:text-[40px] lg:text-[54px]">
                {hero.headingLead} <em>{hero.headingEmphasis}</em>
              </h1>
              <p className="mt-[18px] max-w-[640px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]">
                {hero.lede}
              </p>

              <div className="mt-[30px] flex flex-wrap gap-2.5">
                <Button asChild kind="primary" size="lg">
                  <a href={`#${ENQUIRY_ANCHOR}`}>
                    Request a quote
                    <ArrowRightIcon />
                  </a>
                </Button>
                <DrawingCta
                  anchorId={ENQUIRY_ANCHOR}
                  fileInputId={FILE_INPUT_ID}
                  size="lg"
                  icon={<DocIcon />}
                >
                  Send drawing or sample
                </DrawingCta>
              </div>
            </div>

            <SpecList rows={hero.spec.map(([key, value]) => [key, value] as const)} />
          </div>

          <div className="mt-11 grid max-w-[1040px] grid-cols-2 gap-7 sm:grid-cols-4">
            {hero.stats.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2 · PRODUCTION WORKSHOPS ─────────────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <SectionHead eyebrow={workshops.eyebrow} title={workshops.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{workshops.lede}</p>

        <div className="flex flex-col">
          {workshops.items.map((shop, i) => (
            <div
              key={shop.name}
              className={i === 0 ? '' : 'mt-11 border-t border-ih-border pt-11'}
            >
              {/*
                The spec tag is pushed right by `ml-auto` at sm and up. Below
                that it wraps onto its own line rather than compressing the
                workshop name — `basis-full` after a wrap is what puts it there.
              */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 pb-5">
                <span className="font-mono text-[10px] tracking-[0.12em] text-ih-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[21px] font-medium tracking-[-0.02em] sm:text-[24px]">
                  {shop.name}
                </h3>
                <span className="basis-full font-mono text-[10px] tracking-[0.1em] text-ih-steel sm:basis-auto sm:ml-auto">
                  {shop.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-11">
                <DesignedFigure
                  image={shop.image}
                  caption={shop.caption}
                  sizes="(max-width: 1023px) 100vw, 46vw"
                />

                <div>
                  <ul className="flex list-none flex-col gap-[13px] p-0">
                    {shop.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5">
                        <CheckIcon size={14} strokeWidth={2.3} className="mt-1 shrink-0 text-ih-accent" />
                        <span className="text-[13.5px] leading-[1.55] text-ih-ink-2">{point}</span>
                      </li>
                    ))}
                  </ul>

                  {shop.note ? (
                    <Note className="mt-5 text-[13px]">
                      <strong className="font-medium">{shop.note.label}:</strong> {shop.note.body}
                    </Note>
                  ) : null}

                  <SpecList
                    className="mt-6"
                    rows={shop.spec.map(([key, value]) => [key, value] as const)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3 · TWELVE-STAGE PROCESS ─────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={process.eyebrow} title={process.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{process.lede}</p>

        <HairlineGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {process.items.map((stage) => (
            <HairlineCell
              key={stage.stage}
              className="flex flex-col gap-2.5 px-[22px] pb-5 pt-6"
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                Stage {stage.stage}
              </p>
              <h3 className="text-[16.5px] font-medium leading-[1.25] tracking-[-0.02em]">
                {stage.title}
              </h3>
              {/*
                `flex-1` on the body plus the pinned guarantee is what keeps
                every guarantee rule on a shared baseline across a row. Without
                it the rules stagger with the body length.
              */}
              <p className="flex-1 text-[12.5px] leading-[1.6] text-ih-muted">{stage.body}</p>
              <div className="mt-1 border-t border-ih-border pt-[11px]">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ih-accent">
                  Guarantee
                </p>
                <p className="text-[11.5px] leading-[1.5] text-ih-ink-2">{stage.guarantee}</p>
              </div>
            </HairlineCell>
          ))}
        </HairlineGrid>
      </section>

      {/* ─── 4 · OEM PROCESS — the one navy panel ─────────────────────── */}
      <section className="bg-ih-navy">
        <div className={`${SECTION} py-14 lg:py-[56px]`}>
          <div className="max-w-[780px]">
            <Eyebrow className="text-ih-steel">{oem.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-balance font-serif text-[27px] font-normal leading-[1.14] tracking-[-0.01em] text-white sm:text-[34px]">
              {oem.headingLead} <em>{oem.headingEmphasis}</em>
            </h2>
            <p className="mt-4 text-[14px] leading-[1.65] text-white/80">{oem.body}</p>
          </div>

          <HairlineGrid
            tone="navy"
            className="mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {oem.items.map((step) => {
              const Icon = OEM_ICON[step.icon]
              return (
                <HairlineCell
                  key={step.step}
                  tone="navy"
                  className="flex flex-col gap-2.5 px-[22px] py-6"
                >
                  <span className="text-ih-steel">
                    <Icon size={22} />
                  </span>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                    Step {step.step}
                  </p>
                  <h3 className="text-[16.5px] font-medium leading-[1.25] tracking-[-0.02em] text-white">
                    {step.title}
                  </h3>
                  <p className="text-[12.5px] leading-[1.55] text-white/75">{step.body}</p>
                </HairlineCell>
              )
            })}
          </HairlineGrid>

          <Button asChild kind="onnavy" className="mt-6">
            <Link href={oem.ctaHref}>
              {oem.ctaLabel}
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── 5 · START A BUILD ────────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-11">
          <div>
            <SectionHead eyebrow={build.eyebrow} title={build.heading} className="mb-4" />
            <p className="max-w-[620px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]">
              {build.lede}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {build.requirements.map((requirement) => (
                <div key={requirement.label} className="border-t-2 border-ih-accent pt-3.5">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-ih-muted">
                    {requirement.label}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-[1.6] text-ih-ink-2">{requirement.body}</p>
                </div>
              ))}
            </div>

            {/*
              The sibling page. The two were built from the same handoff family
              and a reader who came here to check the factory is often the same
              one specifying the cooling build.
            */}
            <Card className="mt-8 flex flex-col gap-2 bg-ih-surface-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-[13px] leading-[1.55] text-ih-ink-2">{related.body}</p>
              <Link
                href={related.href}
                className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
              >
                {related.label}
                <ArrowRightIcon size={14} />
              </Link>
            </Card>
          </div>

          <ManufacturingEnquiryForm
            enquiry={enquiry}
            anchorId={ENQUIRY_ANCHOR}
            fileInputId={FILE_INPUT_ID}
            title={build.formTitle}
            body={build.formBody}
            spec={build.spec}
            contactEmail={contactEmail}
          />
        </div>
      </section>

      {/* ─── 6 · CLOSING CTA ──────────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <Card className="grid grid-cols-1 items-center gap-8 bg-ih-steel-soft px-8 py-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:px-11">
          <div>
            <h2 className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[30px]">
              {closing.heading}
            </h2>
            <p className="mt-2.5 max-w-[560px] text-[14.5px] leading-[1.6] text-ih-ink-2">
              {closing.body}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Button asChild kind="primary">
                <a href={`#${ENQUIRY_ANCHOR}`}>
                  Request a quote
                  <ArrowRightIcon />
                </a>
              </Button>
              {whatsappHref && (
                <Button asChild kind="outline" className="bg-ih-surface">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    WhatsApp us
                  </a>
                </Button>
              )}
              <Button asChild kind="outline" className="bg-ih-surface">
                <a href={mailtoHref}>
                  <MailIcon />
                  Email
                </a>
              </Button>
            </div>
            <p className="mt-3.5 text-[12.5px] leading-[1.5] text-ih-muted">
              Project desk{' '}
              {contactPhone && (
                <>
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
                    className="font-medium text-ih-accent hover:underline"
                  >
                    {contactPhone}
                  </a>
                  {contactEmail ? ' · ' : null}
                </>
              )}
              {contactEmail && (
                <a href={mailtoHref} className="hover:text-ih-accent">
                  {contactEmail}
                </a>
              )}
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}
