'use client'

import Link from 'next/link'

/**
 * What replaces a market form once it has been submitted.
 *
 * Deliberately NOT a redirect. The reader is thousands of pixels down a page
 * they scrolled through to get here; navigating away and expecting them back
 * turns a conversion into a bounce. The form dissolves into this in place, and
 * they can follow the tracking link or carry on reading.
 *
 * It says what happens next and gives the reference, because the two things a
 * buyer wants immediately after sending a part list are proof it arrived and
 * something to quote back at us.
 */
export function MarketEnquiryResult({
  code,
  token,
  marketName,
}: {
  code: string
  /** Signed, single-purpose: lets an anonymous submitter open their own RFQ. */
  token: string
  marketName: string
}) {
  return (
    <div className="flex flex-col items-start gap-4" role="status" aria-live="polite">
      <span className="mono text-[10px] uppercase tracking-[0.14em] text-ih-accent">
        Enquiry received · {code}
      </span>
      <p className="max-w-[52ch] text-[15px] leading-[1.65] text-ih-ink-2">
        It is with the Dubai export desk. Someone will come back on the {marketName} lane with a
        priced Estimate, the Incoterm stated rather than assumed, and the document set listed line
        by line.
      </p>
      <Link
        href={`/quote/${code}?token=${encodeURIComponent(token)}`}
        className="text-[13.5px] text-ih-accent underline underline-offset-4 hover:text-ih-accent-hover"
      >
        Track this enquiry →
      </Link>
      <p className="text-[12.5px] text-ih-muted">
        A copy is on its way to the address you gave. If it does not arrive, check the spam folder
        before assuming the enquiry did not land.
      </p>
    </div>
  )
}
