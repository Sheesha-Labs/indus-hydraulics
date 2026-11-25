'use client'

import { Highlight, ProposalCard } from '@indus/ops-ui/assistant'
import { ToastProvider } from '@indus/ops-ui/overlay'
import CoverEmailTerms from '../../components/enquiry/CoverEmailTerms'
import EnquiryVariantCard from '../../components/enquiry/EnquiryVariantCard'
import ManualEnquiry from '../../components/intake/ManualEnquiry'

/**
 * Board 92 · Create enquiry from email (S08-T06), from the real parts with neutral fixtures: the forwarded email
 * with the sender and the terms #4 read marked, the terms card, the manual "New enquiry without an email" card,
 * the Create enquiry ProposalCard and the two things the card can say instead. No session, no database; the
 * verbs do nothing here.
 */
/** A fixed moment for the card's age: the sheet renders the same every time. */
const CREATED = new Date('2026-09-24T06:03:00Z')
const noop = async () => ({ success: true as const, data: undefined })
const approve = async () => ({ success: true as const, data: {} })
const BODY =
  'Dear Sir, please quote your best price for the 14 items in the attached RFQ, C&F Kuwait Port. Payment 100% LC/TT. Please list any deviations, otherwise 100% compliance will be assumed. Closing date 28 September.'
const MARKS = [
  'C&F Kuwait Port',
  '100% LC/TT',
  'Please list any deviations, otherwise 100% compliance will be assumed.',
  '28 September',
]

function Marked({ text }: { text: string }) {
  // Each term the Assistant read, marked where it sits in the client's sentence.
  const out: Array<string | { m: string }> = []
  let rest = text
  for (const m of MARKS) {
    const i = rest.indexOf(m)
    if (i < 0) continue
    out.push(rest.slice(0, i), { m })
    rest = rest.slice(i + m.length)
  }
  out.push(rest)
  return (
    <>
      {out.map((p, i) =>
        typeof p === 'string' ? p : <Highlight key={i} text={p.m} match={p.m} />
      )}
    </>
  )
}

export default function CreateEnquirySpecimen() {
  return (
    <ToastProvider>
      <main className="bg-io-paper min-h-screen w-[1440px] px-8 py-7">
        <h1 className="sr-only">Create enquiry from email</h1>
        <div className="grid grid-cols-[minmax(0,1fr)_460px] items-start gap-[22px]">
          <div className="flex min-w-0 flex-col gap-4">
            <article className="rounded-io-card border-io-line bg-io-card border">
              <header className="border-io-line border-b px-4 py-3.5">
                <h2 className="m-0 text-[15px] font-medium">
                  Fwd: RFQ SC/MM/26-1203 — compressor station spares
                </h2>
                <p className="text-io-ink-2 m-0 mt-1 text-[12.5px]">
                  Owner Example &lt;sales@&gt; → purchase@ · 24 Sep 10:05
                </p>
              </header>
              <div className="flex flex-col gap-3 px-4 py-4 text-[13px] leading-[1.6]">
                <p className="m-0">Please address.</p>
                <div className="bg-io-fill border-io-accent border-l-2 px-3 py-2">
                  <p className="text-io-ink-2 m-0 text-[12px]">
                    ---------- Forwarded message ---------
                  </p>
                  <p className="text-io-ink-2 m-0 text-[12px]">
                    From:{' '}
                    <span className="border-io-navy text-io-ink rounded-io-tag border px-0.5">
                      Sample Buyer &lt;buyer@client.example.test&gt;
                    </span>{' '}
                    24 Sep 08:14
                  </p>
                  <p className="m-0">
                    <Marked text={BODY} />
                  </p>
                </div>
                <span className="rounded-io-ctl border-io-stroke inline-flex w-fit items-center gap-2 border px-2.5 py-1.5 text-[12.5px]">
                  RFQ_SC-MM-26-1203.pdf · 3 pages · 14 lines read
                </span>
              </div>
            </article>
            <CoverEmailTerms
              terms={[
                { label: 'Incoterm', value: 'C&F Kuwait Port' },
                { label: 'Payment', value: '100% LC/TT' },
                { label: 'Compliance', value: 'List deviations, or 100% compliance is assumed' },
                { label: 'Closing date', value: '28 Sep · 4 days' },
              ]}
            />
            <p className="text-io-ink-3 m-0 text-[10.5px] tracking-[0.12em] uppercase">
              Manual · Enquiries › New enquiry
            </p>
            <ManualEnquiry
              batchId={null}
              hasFiles
              clients={[]}
              facts={{ clientCompanyId: null, clientRef: null, deadline: null }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <ProposalCard
              id="A-26-09-24-0012"
              type="Create enquiry"
              record={{ label: 'from Mail · purchase@', href: '#' }}
              level={{ label: 'Asks you' }}
              createdAt={CREATED}
              headline="Create enquiry ENQ-2026-0433 for Sample Client LLC from this email · 14 lines from RFQ.pdf · deadline 28 Sep."
              why={[
                {
                  text: 'Forwarded by Owner Example; the original sender is Sample Buyer, an existing client contact.',
                  evidence: {
                    label: 'Forward header',
                    evidenceId: 'sp_00000000-0000-7000-8000-000000000921',
                  },
                },
                {
                  text: 'Client reference SC/MM/26-1203 has not been seen before.',
                  evidence: {
                    label: 'Enquiries search',
                    evidenceId: 'sp_00000000-0000-7000-8000-000000000922',
                  },
                },
              ]}
              checks={[
                { key: 'lines', mark: 'ok', text: '14 lines read from the PDF', right: '2 Unsure' },
                { key: 'terms', mark: 'ok', text: 'Cover-email terms captured', right: '4 found' },
                {
                  key: 'deadline',
                  mark: 'warn',
                  text: 'Deadline in 4 days',
                  right: 'under a week',
                },
              ]}
              confidence={{ level: 'Sure' }}
              onApproveText={{
                text: 'Creates the enquiry, links this thread, drafts the acknowledgement and starts grouping lines for supplier RFQs.',
              }}
              state="open"
              actions={{ approve, reject: noop, later: noop, edit: { href: '#' } }}
            />
            <p className="text-io-ink-3 m-0 mt-2 text-[10.5px] tracking-[0.12em] uppercase">
              Instead of a new enquiry, the card can say
            </p>
            <EnquiryVariantCard
              title="Looks like revision R2 of ENQ-2026-0419"
              text="Client ref matches SC/MM/26-1187; quantities changed on 2 lines."
              verb="Open revision impact"
            />
            <EnquiryVariantCard
              title="Duplicate"
              text="The same RFQ came through the website form 10 minutes earlier."
              verb="Merge"
            />
          </div>
        </div>
      </main>
    </ToastProvider>
  )
}
