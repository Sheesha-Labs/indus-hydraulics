import Link from 'next/link'
import type { DesignedEnquiry, QualityControlPage, QualityFrame } from '@indus/domain'
import {
  Breadcrumb,
  Button,
  Card,
  Eyebrow,
  HairlineCell,
  HairlineGrid,
  SectionHead,
  SpecList,
  Stat,
} from '@indus/ui'
import DesignedEnquiryForm from '../designed/DesignedEnquiryForm'
import DesignedFigure from '../designed/DesignedFigure'
import DrawingCta from '../designed/DrawingCta'
import { ArrowRightIcon, DocIcon, MailIcon } from '../designed/icons'
import { submitQualityControlEnquiry } from '../../app/(storefront)/quality-control/actions'

/**
 * `/quality-control` — seven bands, one navy panel, one conversion.
 *
 * THIRD IN THE DESIGNED-PAGE FAMILY, and the most image-dense: 32 frames, and
 * on this page the photographs ARE the argument. A QA buyer reads them as
 * closely as the copy, which is why every one carries real alt text and why the
 * contact-sheet captions were rewritten against the actual images rather than
 * inherited from the handoff's guesses. See the note in `quality-control-page`.
 *
 * THE CERTIFICATE GALLERY IS DELIBERATELY ABSENT. The navy records panel makes
 * the documentation argument instead. Do not reinstate the gallery.
 *
 * THE STAGE BLOCKS ARE PLAIN DOCUMENT FLOW — the same change the manufacturing
 * page made, for the same reason: all twelve checks have to be readable by
 * scrolling. No tabs, no accordion.
 *
 * ONLY THE HERO IS EAGER. Everything below it lazy-loads and reserves its space
 * from the declared ratio, so nothing shifts as 32 frames arrive.
 */

const ENQUIRY_ANCHOR = 'inspection-enquiry'
const FILE_INPUT_ID = 'inspection-enquiry-file'

const SECTION = 'mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12'
const BAND = 'py-14 lg:py-[72px]'
const BAND_TIGHT = 'pb-14 lg:pb-[72px]'
const LEDE = 'max-w-[900px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]'

/**
 * One contact-sheet frame. The caption doubles as the visible label and sits
 * under the frame; the alt text on the image says the same thing, because on
 * this page the caption is a claim about what the photograph shows.
 */
function ContactFrame({ frame, sizes }: { frame: QualityFrame; sizes: string }) {
  return <DesignedFigure image={frame.image} caption={frame.caption} sizes={sizes} />
}

export default function QualityControlLanding({
  page,
  enquiry,
  contactPhone,
  contactEmail,
  whatsappHref,
  mailtoHref,
}: {
  page: QualityControlPage
  enquiry: DesignedEnquiry
  contactPhone: string | null
  contactEmail: string | null
  whatsappHref: string | null
  mailtoHref: string
}) {
  const { hero, lab, dimensional, stages, records, scope, closing, related } = page

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

          {/* `items-end` from lg: the spec table's last row is meant to sit on
              the CTA row's baseline. Below lg the columns stack and it is moot. */}
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
                    Request inspection documents
                    <ArrowRightIcon />
                  </a>
                </Button>
                <DrawingCta
                  anchorId={ENQUIRY_ANCHOR}
                  fileInputId={FILE_INPUT_ID}
                  size="lg"
                  icon={<DocIcon />}
                >
                  Define an inspection scope
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

      {/* ─── 2 · TESTING LABORATORY ───────────────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <SectionHead eyebrow={lab.eyebrow} title={lab.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{lab.lede}</p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lab.items.map((instrument) => (
            <Card key={instrument.name} className="flex flex-col">
              <DesignedFigure
                image={instrument.image}
                flush
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 24vw"
              />
              <div className="flex flex-col gap-[7px] px-5 pb-5 pt-[18px]">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                  {instrument.category}
                </p>
                <h3 className="text-[15.5px] font-medium leading-[1.3] tracking-[-0.02em]">
                  {instrument.name}
                </h3>
                <p className="text-[12px] leading-[1.55] text-ih-muted">{instrument.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 3 · DIMENSIONAL INSPECTION ───────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={dimensional.eyebrow} title={dimensional.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{dimensional.lede}</p>

        {/*
          Two uniform rows, not a masonry. The eight assets are four portraits
          and four landscapes, so each row is one orientation and every frame in
          it resolves to the same height — no column balancing, no stretched
          "fill" frame, and no ragged bottom edge. `column-count`, CSS masonry
          and computed `grid-auto-rows` spans all reintroduce the ragged edge
          when frame heights differ this much; none of them is used here.
        */}
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {dimensional.portraitRow.map((frame) => (
            <ContactFrame
              key={frame.image.src}
              frame={frame}
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 24vw"
            />
          ))}
        </div>
        <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {dimensional.landscapeRow.map((frame) => (
            <ContactFrame
              key={frame.image.src}
              frame={frame}
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 24vw"
            />
          ))}
        </div>
      </section>

      {/* ─── 4 · INSPECTION STAGES ────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={stages.eyebrow} title={stages.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{stages.lede}</p>

        <div className="flex flex-col">
          {stages.items.map((stage, i) => (
            <div key={stage.number} className={i === 0 ? '' : 'mt-10 border-t border-ih-border pt-10'}>
              {/*
                The stage tag is pushed right from sm up; below that it wraps to
                its own line rather than compressing the stage name.
              */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 pb-2">
                <span className="font-mono text-[10px] tracking-[0.12em] text-ih-accent">
                  {stage.number}
                </span>
                <h3 className="text-[21px] font-medium tracking-[-0.02em] sm:text-[24px]">
                  {stage.name}
                </h3>
                <span className="basis-full font-mono text-[10px] tracking-[0.1em] text-ih-steel sm:ml-auto sm:basis-auto">
                  {stage.tag}
                </span>
              </div>
              <p className="max-w-[720px] pb-6 text-[14px] leading-[1.6] text-ih-ink-2">
                {stage.intro}
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stage.checks.map((check) => (
                  <Card key={check.title} className="flex flex-col">
                    <DesignedFigure
                      image={check.image}
                      flush
                      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 24vw"
                    />
                    <div className="flex flex-col gap-[9px] px-[22px] pb-[22px] pt-5">
                      <h4 className="text-[15.5px] font-medium leading-[1.3] tracking-[-0.02em]">
                        {check.title}
                      </h4>
                      <p className="text-[12.5px] leading-[1.6] text-ih-muted">{check.body}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5 · WHAT TRAVELS WITH THE BATCH — the one navy panel ─────── */}
      <section className="bg-ih-navy">
        <div className={`${SECTION} py-14 lg:py-[56px]`}>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-[52px]">
            <div>
              <Eyebrow className="text-ih-steel">{records.eyebrow}</Eyebrow>
              <h2 className="mt-4 max-w-[620px] text-balance font-serif text-[27px] font-normal leading-[1.14] tracking-[-0.01em] text-white sm:text-[34px]">
                {records.headingLead} <em>{records.headingEmphasis}</em>.
              </h2>
              <p className="mt-4 max-w-[620px] text-[14px] leading-[1.65] text-white/80">
                {records.body}
              </p>

              <HairlineGrid tone="navy" className="mt-7 grid-cols-1 sm:grid-cols-2">
                {records.items.map((record) => (
                  <HairlineCell
                    key={record.code}
                    tone="navy"
                    className="flex flex-col gap-2.5 px-[22px] pb-5 pt-[22px]"
                  >
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                      {record.code}
                    </p>
                    <h3 className="text-[16px] font-medium leading-[1.25] tracking-[-0.02em] text-white">
                      {record.title}
                    </h3>
                    <p className="text-[12.5px] leading-[1.55] text-white/75">{record.body}</p>
                  </HairlineCell>
                ))}
              </HairlineGrid>

              <Button asChild kind="onnavy" className="mt-6">
                <Link href={records.ctaHref}>
                  {records.ctaLabel}
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>

            <DesignedFigure image={records.image} sizes="(max-width: 1023px) 100vw, 34vw" />
          </div>
        </div>
      </section>

      {/* ─── 6 · DEFINE YOUR INSPECTION SCOPE ─────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-11">
          <div>
            <SectionHead eyebrow={scope.eyebrow} title={scope.heading} className="mb-4" />
            <p className="max-w-[620px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]">
              {scope.lede}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {scope.requirements.map((requirement) => (
                <div key={requirement.label} className="border-t-2 border-ih-accent pt-3.5">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-ih-muted">
                    {requirement.label}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-[1.6] text-ih-ink-2">{requirement.body}</p>
                </div>
              ))}
            </div>

            {/* The two sibling pages. A reader checking the inspection regime is
                usually the same one weighing the factory and the range. */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((link) => (
                <Card key={link.href} className="flex flex-col gap-2 bg-ih-surface-2 p-5">
                  <p className="flex-1 text-[13px] leading-[1.55] text-ih-ink-2">{link.body}</p>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
                  >
                    {link.label}
                    <ArrowRightIcon size={14} />
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          <DesignedEnquiryForm
            action={submitQualityControlEnquiry}
            anchorId={ENQUIRY_ANCHOR}
            fileInputId={FILE_INPUT_ID}
            title={scope.formTitle}
            body={scope.formBody}
            choice={{
              name: 'documents',
              label: enquiry.choiceLabel,
              options: enquiry.choices,
              defaultValue: enquiry.choices[0] ?? '',
            }}
            description={{
              name: 'scope',
              label: 'Scope description',
              placeholder:
                'Standard, material grade, critical dimensions, tests required and acceptance criteria',
              hint: 'A specification or ITP attached below counts instead.',
            }}
            attachments={{
              label: 'Drop specification, drawing or ITP',
              hint: 'PDF · DWG · DXF · DOCX · XLSX · ZIP — up to 25 MB each',
            }}
            submitLabel="Send enquiry"
            confirmation="It is with the quality desk. We confirm the checks, the methods and the acceptance criteria that will apply to your order, and come back within one business day. Anything you attached came through with it."
            spec={scope.spec}
            contactEmail={contactEmail}
          />
        </div>
      </section>

      {/* ─── 7 · CLOSING CTA ──────────────────────────────────────────── */}
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
              {closing.deskLabel}{' '}
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
