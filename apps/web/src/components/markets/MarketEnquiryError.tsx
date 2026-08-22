import { cn } from '@indus/ui'

/**
 * The inline error every market enquiry form shows when `submitMarketEnquiry`
 * refuses the post.
 *
 * The email fallback is conditional, and that condition is the reason this is
 * a component rather than three copies of a paragraph. Two of the action's
 * replies name the desk address in the message body itself — the honeypot's
 * "Email sales@indushydraulics.me and we will pick it up." and the
 * retired-market one — so appending the offer unconditionally printed the
 * address twice in one sentence. The guard reads the message rather than the
 * error's identity, so a new server-side string that names the address is
 * covered the day it is written, in all three forms at once.
 *
 * It compares against `contactEmail` from store settings while the action's
 * strings hardcode the address. They agree today (`seed.ts` sets the same
 * value); if settings are ever pointed elsewhere the offer reappears next to a
 * message naming a different address, which is the harmless direction to fail
 * in — a buyer is shown one address too many, never none.
 *
 * `lead` exists because the two placements phrase it differently: the short
 * cards clip it to "Or email", the mid-page form has room for a full sentence.
 */
export function MarketEnquiryError({
  error,
  contactEmail,
  lead = 'Or email',
  className,
}: {
  error: string
  contactEmail: string | null
  lead?: string
  className?: string
}) {
  return (
    <p
      role="alert"
      className={cn(
        'rounded-md border border-ih-danger bg-ih-danger-soft px-3.5 py-2.5 text-[13px] leading-[1.55] text-ih-danger-ink',
        className
      )}
    >
      {error}
      {contactEmail && !error.includes(contactEmail) && (
        <>
          {' '}
          {lead}{' '}
          <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </>
      )}
    </p>
  )
}
