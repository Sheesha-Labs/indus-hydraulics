import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'
import RfqSubmitForm from '../../../components/RfqSubmitForm'

export const metadata: Metadata = { title: 'Request a Quote' }

export default async function QuoteSubmitPage() {
  const session = await auth()
  const isAuthenticated = !!session?.user?.accountId

  // Authenticated users see their saved ship-to addresses in the form.
  // Anonymous users get an empty list — the form hides the address dropdown
  // when none are passed and captures the destination via the project
  // details / message fields instead.
  const addresses = isAuthenticated
    ? await db.accountAddress.findMany({
        where: { accountId: session!.user.accountId, kind: 'ship_to' },
        select: { id: true, label: true, lines: true, city: true, countryCode: true },
        orderBy: [{ isDefaultShip: 'desc' }, { createdAt: 'asc' }],
      })
    : []

  const mappedAddresses = addresses.map((a) => ({
    id: a.id,
    label: a.label,
    lines: (a.lines as string[]) ?? [],
    city: a.city,
    countryCode: a.countryCode,
  }))

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-8 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] mb-2">
        <Link href={`/quote`} className="hover:text-[var(--color-primary)] uppercase">Quote</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)] uppercase">RFQ Form</span>
      </div>

      <h1 className="text-[36px] font-semibold tracking-[-0.02em] mb-2">Request a quote</h1>
      <p className="text-[var(--color-muted)] max-w-[640px] mb-8 leading-[1.5]">
        Fill this once and our applications team replies with availability, lead time and a fixed-price quote. No hidden fees, no auto-renewing terms.
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8 font-mono text-[11px] tracking-[0.08em]">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-primary)] text-[var(--color-elevated)]">
          <span className="w-[18px] h-[18px] bg-[var(--color-accent)] text-white rounded-full grid place-items-center text-[10px]">1</span>
          LINES
        </div>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-primary)] text-[var(--color-elevated)]">
          <span className="w-[18px] h-[18px] bg-[var(--color-accent)] text-white rounded-full grid place-items-center text-[10px]">2</span>
          DETAILS
        </div>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-muted)]">
          <span className="w-[18px] h-[18px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full grid place-items-center text-[10px]">3</span>
          REVIEW
        </div>
      </div>

      <RfqSubmitForm addresses={mappedAddresses} isAuthenticated={isAuthenticated} />
    </div>
  )
}
