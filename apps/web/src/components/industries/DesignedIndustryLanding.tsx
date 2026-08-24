import Link from 'next/link'
import type { DesignedIndustryPage } from '@indus/domain'
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Eyebrow,
  HairlineCell,
  HairlineGrid,
  Note,
  SectionHead,
  Stat,
} from '@indus/ui'
import DrawingCta from '../designed/DrawingCta'
import DesignedEnquiryForm from '../designed/DesignedEnquiryForm'
import { submitIndustryEnquiry } from '../../app/(storefront)/industries/actions'
import DesignedFigure from '../designed/DesignedFigure'
import { ArrowRightIcon, CheckIcon, DocIcon, MailIcon } from '../designed/icons'

/**
 * The designed industry page — ten bands, one conversion.
 *
 * WHAT THE READER IS DOING. This is a lead page for an engineer specifying a
 * build, not a product listing. It carries no prices and no add-to-quote. The
 * only action is "send us the drawing", and every CTA on the page resolves to
 * the one enquiry card in the review band. The prototype pointed the hero's
 * primary button at the product-families anchor; that was carried over from the
 * source page and is corrected here.
 *
 * ONE NAVY PANEL IN THE BODY, and it is the risk band. That is a house
 * convention across the industry pages — the dark band marks the single most
 * important technical argument, and a second one costs the first its emphasis.
 * The footer's navy does not count; it is chrome.
 *
 * NO SHADOWS. Surfaces separate with 1px rules. `shadow-1` exists and is
 * deliberately unused here.
 *
 * THE HAIRLINE BANDS (buyers, risks, steps) get their column count from
 * utilities rather than `HairlineGrid`'s `columns` prop, because that prop sets
 * `grid-template-columns` inline and would beat every breakpoint below it.
 */

/** Shared by the two "Submit drawing or BOM" buttons and the form's file input. */
const ENQUIRY_ANCHOR = 'project-enquiry'
const FILE_INPUT_ID = 'industry-enquiry-file'

const SECTION = 'mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12'
/** 72px vertical rhythm; consecutive bands drop the top so the head does the work. */
const BAND = 'py-14 lg:py-[72px]'
const BAND_TIGHT = 'pb-14 lg:pb-[72px]'
const LEDE = 'max-w-[900px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]'

export default function DesignedIndustryLanding({
  page,
  yearsInBusiness,
  contactPhone,
  contactEmail,
  whatsappHref,
  mailtoHref,
}: {
  page: DesignedIndustryPage
  /** Feeds the `{years}` token in the stat row — never frozen into the copy. */
  yearsInBusiness: number
  contactPhone: string | null
  contactEmail: string | null
  whatsappHref: string | null
  mailtoHref: string
}) {
  const { hero, architecture, buyers, locations, families, qc, risk, review, closing, related } = page

  return (
    <div>
      {/* ─── 1 · HERO ─────────────────────────────────────────────────── */}
      <section className="border-b border-ih-border bg-ih-surface">
        <div className={`${SECTION} pb-12 pt-7 lg:pb-[52px]`}>
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'INDUSTRIES', href: '/industries' },
              { label: page.breadcrumbLabel.toUpperCase() },
            ]}
          />

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.18fr_1fr] lg:gap-14">
            {/* Image first on a phone: the copy block is tall, and a reader who
                has to scroll past three paragraphs to reach the photograph has
                already decided what the page is without seeing it. */}
            <DesignedFigure
              image={hero.image}
              priority
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="order-first lg:order-last"
            />

            <div>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
              <h1 className="mt-[18px] text-balance font-serif text-[32px] font-normal leading-[1.04] tracking-[-0.01em] sm:text-[40px] lg:text-[52px]">
                {hero.headingLead} <em>{hero.headingEmphasis}</em>.
              </h1>
              <p className="mt-[18px] max-w-[600px] text-[15px] leading-[1.6] text-ih-ink-2 sm:text-[16px]">
                {hero.lede}
              </p>

              <ul className="mt-[26px] flex list-none flex-col gap-[11px] p-0">
                {hero.checks.map((check) => (
                  <li key={check} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 shrink-0 text-ih-accent" />
                    <span className="text-[13.5px] leading-[1.5] text-ih-ink-2">{check}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-[30px] flex flex-wrap gap-2.5">
                <Button asChild kind="primary" size="lg">
                  <a href={`#${ENQUIRY_ANCHOR}`}>
                    Request a project quote
                    <ArrowRightIcon />
                  </a>
                </Button>
                <DrawingCta
                  anchorId={ENQUIRY_ANCHOR}
                  fileInputId={FILE_INPUT_ID}
                  size="lg"
                  icon={<DocIcon />}
                >
                  Submit drawing or BOM
                </DrawingCta>
              </div>
            </div>
          </div>

          <div className="mt-11 grid max-w-[1000px] grid-cols-2 gap-7 sm:grid-cols-4">
            {hero.stats.map((stat) => (
              <Stat
                key={stat.label}
                value={stat.value.replace('{years}', String(yearsInBusiness))}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2 · ARCHITECTURE DIAGRAM ─────────────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <DesignedFigure
            image={architecture.image}
            sizes="(max-width: 1023px) 100vw, 55vw"
            caption={architecture.caption}
          />
          <div>
            <Eyebrow>{architecture.eyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[30px]">
              {architecture.heading}
            </h2>
            <Note className="mt-5 text-[13px]">
              <strong className="font-medium">{architecture.noteLabel}</strong> {architecture.note}
            </Note>
            {/*
              A liability line, not a caption. It sits next to the diagram
              because that is the claim it qualifies: we locate equipment on the
              drawing, we do not certify the coolant against it.
            */}
            <p className="mt-[18px] text-[14px] leading-[1.65] text-ih-ink-2">
              {architecture.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3 · PROJECT FIT ──────────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={buyers.eyebrow} title={buyers.heading} className="mb-4" />
        <p className={`${LEDE} mb-7`}>{buyers.lede}</p>

        <HairlineGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {buyers.items.map((buyer) => (
            <HairlineCell key={buyer.title} className="flex flex-col gap-2.5 px-6 py-[26px]">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                {buyer.kicker}
              </p>
              <h3 className="text-[18px] font-medium leading-[1.25] tracking-[-0.02em]">
                {buyer.title}
              </h3>
              <p className="text-[12.5px] leading-[1.6] text-ih-muted">{buyer.body}</p>
            </HairlineCell>
          ))}
        </HairlineGrid>
      </section>

      {/* ─── 4 · SYSTEM LOCATIONS ─────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={locations.eyebrow} title={locations.heading} className="mb-4" />
        <p className={`${LEDE} mb-7`}>{locations.lede}</p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {locations.items.map((location) => (
            <Card key={location.number} className="flex flex-col">
              <DesignedFigure
                image={location.image}
                flush
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 24vw"
              >
                <Badge kind="navy" square className="absolute left-3 top-3 z-[1]">
                  {location.number}
                </Badge>
              </DesignedFigure>

              <div className="flex flex-1 flex-col gap-[11px] p-[22px]">
                <h3 className="text-[17px] font-medium leading-[1.28] tracking-[-0.02em]">
                  {location.title}
                </h3>
                <p className="flex-1 text-[12.5px] leading-[1.6] text-ih-muted">{location.body}</p>
                <div className="border-t border-ih-border pt-[13px]">
                  <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ih-muted">
                    Relevant products
                  </p>
                  {/*
                    Badges, not links. These name a stainless range the
                    catalogue does not carry yet — see the note on
                    `IndustryLocation.relevant`.
                  */}
                  <div className="flex flex-wrap gap-1.5">
                    {location.relevant.map((item) => (
                      <Badge key={item} kind="steel" className="text-[10.5px]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 5 · PRODUCT FAMILIES ─────────────────────────────────────── */}
      <section id="product-families" className={`${SECTION} ${BAND_TIGHT} scroll-mt-24`}>
        <SectionHead
          eyebrow={families.eyebrow}
          title={families.heading}
          className="mb-4 flex-wrap gap-4"
          action={
            <Button asChild kind="outline">
              <Link href="/c">
                Full catalogue
                <ArrowRightIcon />
              </Link>
            </Button>
          }
        />
        <p className={`${LEDE} mb-7`}>{families.lede}</p>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {families.items.map((family) => (
            <Card key={family.title} className="grid grid-cols-1 sm:grid-cols-[300px_minmax(0,1fr)]">
              <DesignedFigure
                image={family.image}
                flush
                fill
                sizes="(max-width: 639px) 100vw, 300px"
              />

              <div className="flex flex-col gap-3 px-[26px] py-6">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                  {family.kicker}
                </p>
                <h3 className="text-[21px] font-medium leading-[1.2] tracking-[-0.02em]">
                  {family.title}
                </h3>
                <ul className="flex list-none flex-col gap-2 p-0">
                  {family.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckIcon size={13} strokeWidth={2.4} className="mt-0.5 shrink-0 text-ih-accent" />
                      <span className="text-[12.5px] leading-[1.5] text-ih-ink-2">{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1 text-[12.5px] leading-[1.6] text-ih-muted">
                  <strong className="font-medium text-ih-ink-2">Includes:</strong> {family.includes}
                </p>
                {/*
                  The designed link here reads "View <family> →" and points at a
                  catalogue category. Those categories do not exist yet, so the
                  link says what it actually does: it goes to the enquiry form,
                  which is where a reader who wants this family has to end up
                  either way. Restore the catalogue target when the range lands.
                */}
                <a
                  href={`#${ENQUIRY_ANCHOR}`}
                  className="mt-auto inline-flex items-center gap-1.5 border-t border-ih-border pt-3 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
                >
                  Enquire about {family.title.toLowerCase()}
                  <ArrowRightIcon size={14} />
                </a>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-5 flex flex-col items-start gap-5 bg-ih-steel-soft px-[26px] py-[22px] lg:flex-row lg:items-center lg:gap-6">
          <DocIcon size={22} className="shrink-0 text-ih-accent" />
          <p className="flex-1 text-[13.5px] leading-[1.6] text-ih-ink-2">
            <strong className="font-medium">{families.stripLabel}</strong> {families.strip}
          </p>
          <DrawingCta
            anchorId={ENQUIRY_ANCHOR}
            fileInputId={FILE_INPUT_ID}
            kind="primary"
            iconAfter={<ArrowRightIcon />}
          >
            Submit drawing or BOM
          </DrawingCta>
        </Card>

        {/*
          The sibling designed page. A reader deciding on these four families is
          often the same one who wants to know how they are made, and the
          manufacturing page is the only place on the site that answers it.
        */}
        <Card className="mt-5 flex flex-col gap-2 bg-ih-surface-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-[13px] leading-[1.55] text-ih-ink-2">{related.body}</p>
          <Link
            href={related.href}
            className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
          >
            {related.label}
            <ArrowRightIcon size={14} />
          </Link>
        </Card>
      </section>

      {/* ─── 6 · ENGINEERING & QC ─────────────────────────────────────── */}
      <section className={`${SECTION} ${BAND_TIGHT}`}>
        <SectionHead eyebrow={qc.eyebrow} title={qc.heading} className="mb-4" />
        <p className={`${LEDE} mb-7`}>{qc.lede}</p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {qc.items.map((step) => (
            <div key={step.number}>
              <DesignedFigure
                image={step.image}
                caption={step.image.alt}
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 24vw"
              />
              <div className="mt-4 border-t-2 border-ih-accent pt-4">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-muted">
                  {step.number} · {step.kicker}
                </p>
                <h3 className="mt-2.5 text-[17px] font-medium leading-[1.28] tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-[1.6] text-ih-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7 · PROJECT RISK CONTROL — the one navy panel ────────────── */}
      <section className="bg-ih-navy">
        <div className={`${SECTION} py-14 lg:py-[56px]`}>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-[52px]">
            <div>
              <Eyebrow className="text-ih-steel">{risk.eyebrow}</Eyebrow>
              <h2 className="mt-4 max-w-[640px] text-balance font-serif text-[27px] font-normal leading-[1.14] tracking-[-0.01em] text-white sm:text-[34px]">
                {risk.headingLead} <em>{risk.headingEmphasis}</em>.
              </h2>
              <p className="mt-4 max-w-[620px] text-[14px] leading-[1.65] text-white/80">
                {risk.body}
              </p>

              <HairlineGrid tone="navy" className="mt-7 grid-cols-1 sm:grid-cols-2">
                {risk.items.map((item) => (
                  <HairlineCell
                    key={item.number}
                    tone="navy"
                    className="flex flex-col gap-2.5 px-[22px] pb-5 pt-[22px]"
                  >
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-ih-steel">
                      {item.number} · {item.risk}
                    </p>
                    <p className="text-[12.5px] leading-[1.55] text-white/85">
                      <strong className="font-medium text-white">Control:</strong> {item.control}
                    </p>
                    <p className="mt-auto border-t border-white/12 pt-2.5 text-[11.5px] leading-[1.5] text-white/65">
                      <strong className="font-medium text-white/85">
                        Project record:
                      </strong>{' '}
                      {item.record}
                    </p>
                  </HairlineCell>
                ))}
              </HairlineGrid>

              <Button asChild kind="onnavy" className="mt-6">
                <Link href={risk.ctaHref}>
                  {risk.ctaLabel}
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>

            <DesignedFigure image={risk.image} sizes="(max-width: 1023px) 100vw, 34vw" />
          </div>
        </div>
      </section>

      {/* ─── 8 · START YOUR PROJECT REVIEW ────────────────────────────── */}
      <section className={`${SECTION} ${BAND}`}>
        <SectionHead eyebrow={review.eyebrow} title={review.heading} className="mb-4" />
        <p className={`${LEDE} mb-8`}>{review.lede}</p>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
          <HairlineGrid className="grid-cols-1 sm:grid-cols-2">
            {review.steps.map((step) => (
              <HairlineCell key={step.kicker} className="flex flex-col gap-2.5 px-[26px] pb-6 pt-[26px]">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">
                  {step.kicker}
                </p>
                <h3 className="text-[18px] font-medium leading-[1.25] tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="text-[12.5px] leading-[1.6] text-ih-muted">{step.body}</p>
              </HairlineCell>
            ))}
          </HairlineGrid>

          <DesignedEnquiryForm
            action={submitIndustryEnquiry}
            hiddenFields={{ industrySlug: page.slug }}
            anchorId={ENQUIRY_ANCHOR}
            fileInputId={FILE_INPUT_ID}
            title={review.formTitle}
            body={review.formBody}
            choice={{
              name: 'application',
              label: 'Application',
              options: review.applications,
              // Empty by default so the choice is deliberate. A pre-selected
              // first option is the one nobody notices is wrong until the
              // enquiry has been routed to the wrong engineer.
              defaultValue: '',
            }}
            description={{
              name: 'description',
              label: 'Project description',
              placeholder:
                'Material, sizes, end connections, quantity, inspection and documentation required',
              hint: 'A drawing or BOM attached below counts instead.',
            }}
            attachments={{
              label: 'Drop drawing, BOM or specification',
              hint: 'PDF · DWG · DXF · STEP · XLSX · ZIP — up to 25 MB each',
            }}
            submitLabel="Get a quote"
            confirmation="It is with the project desk. We review manufacturability, dimensions, end connections, material and the inspection scope before we quote, and come back within one business day. Anything you attached came through with it."
            spec={review.spec}
            contactEmail={contactEmail}
          />
        </div>
      </section>

      {/* ─── 9 · CLOSING CTA ──────────────────────────────────────────── */}
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
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-medium text-ih-accent hover:underline">
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
