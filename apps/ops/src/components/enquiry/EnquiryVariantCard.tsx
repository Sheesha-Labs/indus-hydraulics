'use client'

import { Button } from '@indus/ops-ui/controls'

/**
 * Board 92 · "Instead of a new enquiry, the card can say" (S08-T06): Revision (the client reference matches an
 * open enquiry) or Duplicate (the same request came in again). The verbs are the Create enquiry card's options;
 * this card states the finding and offers the one that fits.
 */
export default function EnquiryVariantCard({
  title,
  text,
  verb,
  disabled,
  onVerb,
}: {
  title: string
  text: string
  verb: string
  disabled?: boolean
  onVerb?: () => void
}) {
  return (
    <section
      aria-label={title}
      data-part="enquiry-variant"
      className="rounded-io-card border-io-line bg-io-card flex flex-col items-start gap-2.5 border px-4 py-4"
    >
      <h3 className="m-0 text-[14px] font-medium">{title}</h3>
      <p className="text-io-ink-2 m-0 text-[12.5px]">{text}</p>
      <Button variant="secondary" size="sm" disabled={disabled} onClick={onVerb}>
        {verb}
      </Button>
    </section>
  )
}
