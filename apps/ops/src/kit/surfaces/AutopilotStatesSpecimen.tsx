import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { ModalFrame } from '@indus/ops-ui/overlay'
import { AssistantPill, Banner } from '@indus/ops-ui/status'
import type { ReactNode } from 'react'

/**
 * Board 102 · Autopilot states (S07-T04), each drawn from the parts the app uses, with neutral fixtures:
 * (1) the sidebar pill and its popover, (2) paused by the Owner, (3) one mailbox disconnected, (4) the switch
 * confirmation, (5) Careful on the first day, (6) the Helper viewing. In the app they live where they belong:
 * the shell (1–3), the Autopilot page and drawer (4–6).
 */
function Card({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5">
      <h2 className="io-eyebrow m-0 font-normal">{eyebrow}</h2>
      {children}
    </section>
  )
}

export default function AutopilotStatesSpecimen() {
  return (
    <main
      data-specimen="autopilot-states"
      className="bg-io-paper grid min-h-screen grid-cols-3 content-start items-start gap-5 p-8"
    >
      <Card eyebrow="One click from anywhere · Sidebar pill">
        <div className="rounded-io-card border-io-line bg-io-card shadow-io-e2 flex w-[236px] flex-col gap-2.5 border p-3">
          <span className="text-[13px] font-medium">Assistant running</span>
          <span className="text-io-ink-3 text-[12px]">37 actions this week · last 2 min ago</span>
          <Button variant="danger" className="w-full">
            Pause everything
          </Button>
          <span className="text-io-accent text-center text-[12.5px]">Open Autopilot</span>
        </div>
        <AssistantPill status="running" />
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          Clicking the pill opens this; one more click pauses everything.
        </p>
      </Card>
      <Card eyebrow="Paused by the Owner · Banner everywhere">
        <Banner tone="warn" actions={<span className="font-medium underline">Resume</span>}>
          Assistant paused by you at 08:50. Nothing is read or sent until you resume. Mail keeps
          arriving in Gmail.
        </Banner>
        <AssistantPill status="paused" />
        <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">
          The same banner sits at the top of Today, Review, Mail and every record. Approved sends
          queue; on resume each is re-checked and stale ones come back as redrafts.
        </p>
      </Card>
      <Card eyebrow="Paused · sales@ disconnected">
        <Banner tone="bad" actions={<span className="font-medium underline">Reconnect</span>}>
          sales@ disconnected 07:40. The Assistant can’t read or send client mail. purchase@ still
          runs.
        </Banner>
        <AssistantPill status="disconnected" />
        <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">
          Mail from the gap is read in order once reconnected. Nothing addressed to clients is sent
          from another mailbox.
        </p>
      </Card>
      <Card eyebrow="Switched to Do and tell · Confirmation">
        <ModalFrame
          title="Let the Assistant chase suppliers without asking?"
          actions={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Switch to Do and tell</Button>
            </>
          }
        >
          <div className="flex flex-col gap-2 text-[13px]">
            <p className="m-0">From now on:</p>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-[18px]">
              <li>
                Chasers send from purchase@ 1 working day after reply-by, then every 2, up to 3.
              </li>
              <li>Each appears in Today and the evening summary, with 5 minutes to undo.</li>
              <li>Still asks you for new suppliers, Trial suppliers and RFQs above USD 50,000.</li>
            </ul>
          </div>
        </ModalFrame>
      </Card>
      <Card eyebrow="Careful mode · First day">
        <div className="border-io-stroke rounded-io-ctl inline-flex w-fit overflow-hidden border text-[12.5px]">
          {['Careful', 'Balanced', 'Hands-off', 'Custom'].map((m, i) => (
            <span
              key={m}
              className={cn(
                'border-io-line border-r px-3 py-1.5 last:border-r-0',
                i === 0 && 'bg-io-navy text-white'
              )}
            >
              {m}
            </span>
          ))}
        </div>
        <p className="m-0 text-[12.5px] leading-[1.5]">
          Everything except classifying and linking mail asks you. Suggestions to relax a level
          appear once you have approved 25 of a kind without edits.
        </p>
        <p className="rounded-io-card border-io-line text-io-ink-3 m-0 border border-dashed px-4 py-5 text-center text-[12.5px]">
          No history yet. The first runs show here as the Assistant reads today’s mail.
        </p>
      </Card>
      <Card eyebrow="Helper · viewing">
        <Banner tone="info">
          You can see Autopilot but not change it. Krishan can let you edit chaser rules and
          templates.
        </Banner>
        {['Chase suppliers', 'Send supplier RFQs'].map((a) => (
          <div
            key={a}
            className="rounded-io-card border-io-line flex items-center justify-between border px-3.5 py-3 text-[13px]"
          >
            {a}
            <span className="text-io-ink-3 text-[12.5px]">Draft and ask · read only</span>
          </div>
        ))}
        <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">
          The Helper cannot pause or resume the Assistant. Owner setting: Settings › Owner & Helper.
        </p>
      </Card>
    </main>
  )
}
