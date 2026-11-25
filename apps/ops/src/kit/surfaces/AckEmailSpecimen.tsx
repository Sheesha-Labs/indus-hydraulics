'use client'

import { WhyDate } from '@indus/ops-ui/assistant'
import { AckAutoSent, AckAwaiting, AckSkipped } from '../../components/enquiry/AckStates'

/**
 * Board 93 · Acknowledge client (S08-T07), from the real parts with neutral fixtures: the draft in the client's
 * thread from sales@, "Why 26 Sep" (computeRevertBy's steps for received 24 Sep, closing 28 Sep), and the three
 * states. No session, no database.
 */
export default function AckEmailSpecimen() {
  return (
    <main className="bg-io-paper min-h-screen w-[1440px] px-8 py-7">
      <h1 className="sr-only">Acknowledge client</h1>
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-[22px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <p className="io-eyebrow m-0">Draft · in the client’s thread from sales@</p>
          <article className="rounded-io-card border-io-line bg-io-card border">
            <header className="border-io-line border-b px-4 py-4">
              <h2 className="m-0 text-[15px] font-normal">
                RE: RFQ SC/MM/25-1203 — compressor station spares
              </h2>
              <p className="m-0 mt-2 text-[12.5px] font-semibold">
                Owner Example &lt;sales@example.test&gt;
              </p>
              <p className="text-io-ink-2 m-0 text-[12px]">To buyer@client.example.test</p>
            </header>
            <div className="flex flex-col gap-3 px-4 py-4 text-[13px] leading-[1.55]">
              <p className="m-0">Dear Mr Buyer,</p>
              <p className="m-0">
                We have received your enquiry SC/MM/25-1203 (14 lines). Our reference is
                ENQ-2026-0433. We will revert by 26 September.
              </p>
              <p className="m-0">
                Best regards,
                <br />
                <b className="font-semibold">Owner Example</b>
                <br />
                Example Trading LLC
                <br />
                +971 00 000 0000 · sales@example.test
              </p>
              <p className="border-io-line text-io-ink-3 m-0 border-l-2 pl-3 text-[12px]">
                On 24 Sep, Sample Buyer wrote: Dear Sir, please quote your best price for the 14
                items…
              </p>
            </div>
          </article>
          <WhyDate
            title="Why 26 Sep"
            steps={[
              { label: 'Client closing date', value: '28 Sep' },
              {
                label: 'Typical supplier reply for valves and seals',
                value: '2 working days',
                note: '(last 20 RFQs)',
              },
              { label: 'Pricing and your approval', value: 'half a day' },
              {
                label: 'So we promise',
                value: '26 Sep',
                note: 'leaving 2 days’ margin before the client’s date',
              },
            ]}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3.5">
          <AckAwaiting client="Sample Client LLC" />
          <AckAutoSent at="10:09" undoLeft="3:12" />
          <AckSkipped
            text="Not sent. Example Steel asked on 3 Aug: “no need to acknowledge, just send the offer”."
            preferenceHref="#"
          />
        </div>
      </div>
    </main>
  )
}
