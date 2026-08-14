import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '../../lib/auth'
import { isCustomerSession } from '../../lib/customer-session'
import QuoteBuilderClient from '../../components/QuoteBuilderClient'

export const metadata: Metadata = { title: 'Quote Builder' }

export default async function QuotePage() {
  // `!!session` was true for any session at all; ownership on this surface
  // is carried by accountId, so that is what "signed in" has to mean.
  const isSignedIn = isCustomerSession(await auth())

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-1.5">
            Quote-builder
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em]">Your shortlist</h1>
          <p className="text-[var(--color-muted)] max-w-[600px] mt-2 text-[14px] leading-[1.5]">
            We don&apos;t sell ex-stock at list price. Build your shortlist, send us a request, and our engineers reply within 4 working hours with availability, lead times and final pricing.
          </p>
        </div>
        <div className="flex gap-2">
          {isSignedIn && (
            <Link
              href={`/account/quotes`}
              className="h-9 px-4 flex items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
            >
              View past quotes
            </Link>
          )}
        </div>
      </div>

      <QuoteBuilderClient isSignedIn={isSignedIn} />
    </div>
  )
}
