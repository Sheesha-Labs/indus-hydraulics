import { supplierDocumentFlag } from '@indus/ops-core'
import { Button } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { ReactNode } from 'react'

/**
 * Board 133 · Supplier states (S10-T07): the eight edge cases for boards 128–132 in the directory's own words, with
 * neutral names. The live states render on the profile (merged note, out of office, bouncing with a proposed
 * address, blocked, trial limit) and on the list (empty, loading); the certificate flag is supplierDocumentFlag,
 * exported for S16's Compare cell. No session, no database; the button does nothing.
 */
function Frame({ title, board, children }: { title: string; board: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-4 py-4"
    >
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="io-eyebrow m-0">{title}</h2>
        <span className="text-io-ink-3 text-[11.5px]">{board}</span>
      </header>
      {children}
    </section>
  )
}

const Lead = ({ children }: { children: ReactNode }) => (
  <p className="text-io-ink m-0 text-[13px] leading-[1.5]">{children}</p>
)
const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-io-ink-3 m-0 text-[12px] leading-[1.5]">{children}</p>
)

const TODAY = new Date(Date.UTC(2026, 11, 2))
const CERT = supplierDocumentFlag(
  [{ kind: 'approval', status: 'expired', expiresAt: new Date(Date.UTC(2026, 10, 30)) }],
  TODAY
)

export default function SupplierStatesSpecimen() {
  return (
    <main className="bg-io-paper min-h-screen w-[1440px] px-8 py-7">
      <h1 className="sr-only">Supplier states</h1>
      <p className="text-io-ink-2 m-0 mb-5 text-[13px]">Edge cases for boards 128–132.</p>
      <div className="grid grid-cols-4 items-start gap-4">
        <Frame title="New supplier · no history" board="129">
          <Lead>Example Downhole Supplies FZE · added from research 13 Nov.</Lead>
          <Note>
            RFQs and quotes: after the first RFQ. Prices: after the first quote. Orders: after the
            first PO. Reliability: after 3 replies.
          </Note>
        </Frame>
        <Frame title="Merged" board="129 · 127">
          <Lead>Example Oilfield Trading LLC</Lead>
          <Note>
            Also known as: Example OFS. Contacts, RFQs and evidence combined 13 Nov by KB. Mail from
            either name links here.
          </Note>
        </Frame>
        <Frame title="Certificate expired" board="129 · Compare">
          <Chip
            tone={CERT?.tone ?? 'bad'}
            label={CERT?.text.split(' · ')[0] ?? 'Certificate expired'}
            className="w-full"
          />
          <Lead>Example Instruments · ATEX for level gauges expired 30 Nov.</Lead>
          <Note>On Compare, this supplier’s prices show “Certificate expired”.</Note>
          <div>
            <Button size="md" variant="secondary">
              Draft request
            </Button>
          </div>
        </Frame>
        <Frame title="Out of office" board="96">
          <Chip tone="warn" label="Away until 18 Nov" className="w-full" />
          <Lead>Sample Contact · auto-reply. Chasers pause; reply-by moved to 19 Nov.</Lead>
        </Frame>
        <Frame title="Email bouncing" board="96 · 222">
          <Chip tone="bad" label="Bouncing" className="w-full" />
          <Lead>sales@example-instruments.example bounced 3 Nov.</Lead>
          <Note>Removed from RFQs. New address proposed from their contact page.</Note>
        </Frame>
        <Frame title="Blocked" board="131">
          <Chip tone="bad" label="Blocked" className="w-full" />
          <Lead>Example Valve Supply · Counterfeit · 18 Aug by KB.</Lead>
          <Note>Never suggested; an RFQ draft adding them is stopped with this reason.</Note>
        </Frame>
        <Frame title="Trial limit reached" board="130">
          <Lead>Example Hydraulics Co · 3 of 3 trial POs used.</Lead>
          <Note>Next PO waits for Approved (suggested) or a one-off approval by Krishan.</Note>
        </Frame>
        <Frame title="Directory empty / loading" board="128">
          <div role="status" aria-busy="true" className="flex flex-col gap-3">
            <span className="sr-only">Loading</span>
            <i aria-hidden="true" className="bg-io-line rounded-io-pill block h-2.5 w-[85%]" />
            <i aria-hidden="true" className="bg-io-line rounded-io-pill block h-2.5 w-[60%]" />
          </div>
          <Note>
            No suppliers yet: import from Gmail history (setup) or add one. Research adds
            Contact-only suppliers.
          </Note>
        </Frame>
      </div>
    </main>
  )
}
