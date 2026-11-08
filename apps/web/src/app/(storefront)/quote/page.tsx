import type { Metadata } from 'next'
import QuoteBuilderClient from '../../../components/QuoteBuilderClient'

export const metadata: Metadata = { title: 'Quote Builder' }

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-8 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase mb-1.5">
            Quote-builder
          </div>
          <h1 className="font-serif text-[clamp(28px,4vw,36px)] font-normal tracking-[-0.01em]">Your shortlist</h1>
          <p className="text-ih-muted max-w-[600px] mt-2 text-[14px] leading-[1.5]">
            We don&apos;t sell ex-stock at list price. Build your shortlist, send us a request, and our engineers reply within 4 working hours with availability, lead times and final pricing.
          </p>
        </div>
      </div>

      <QuoteBuilderClient />
    </div>
  )
}
