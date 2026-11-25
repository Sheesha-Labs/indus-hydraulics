import { Card, NeedsRow } from '@indus/ops-ui/card'
import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import type { ReactNode } from 'react'
import FinishSetupBanner from '../../components/setup/FinishSetupBanner'
import { CalmState } from '../../components/today/TodaySections'
import type { TodayModel } from '../../data/today'

/**
 * Board 182 · Today states (S07-T06), drawn from the parts Today uses with neutral fixtures: calm, on fire,
 * Assistant paused, mailbox disconnected, setup unfinished and the first morning after an import (S20 fills it).
 */
function Frame({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5">
      <h2 className="io-eyebrow m-0 font-normal">{eyebrow}</h2>
      {children}
    </section>
  )
}

const CALM: TodayModel = {
  greeting: '',
  state: 'calm',
  needs: { total: 0, cards: [], items: [], moreByRecord: [] },
  cameIn: [],
  late: [],
  done: [],
  doneTotal: 6,
  thisWeek: [],
  kpi: { awaiting: 0, showMoney: true },
  notifications: 0,
  paused: false,
  nextDeadline: 'Example tender, Wed 20 Nov',
  firstMorning: null,
}

export default function TodayStatesSpecimen() {
  return (
    <main data-specimen="today-states" className="bg-io-paper flex min-h-screen flex-col gap-5 p-8">
      <p className="m-0 text-[13px]">Banners follow board 220.</p>
      <div className="grid grid-cols-3 items-start gap-5">
        <CalmState model={CALM} />
        <Frame eyebrow="Everything on fire">
          <p className="m-0 text-[13px]">Needs you · 31. Top 3 first:</p>
          {[
            ['Bank change', 'Example Valve Co', 'Payments blocked'],
            ['Tender due today', 'ENQ-2026-0001', '12:00 Dubai'],
            ['PO received', 'PO-0001', 'USD 145,192'],
          ].map(([tag, title, sub], i) => (
            <NeedsRow
              key={tag}
              action={tag!}
              title={title}
              sub={sub}
              actions={
                i === 0 ? (
                  <Button size="sm" variant="primary">
                    Open
                  </Button>
                ) : (
                  <ButtonLink size="sm" href="/review">
                    Open
                  </ButtonLink>
                )
              }
            />
          ))}
          <p className="text-io-ink-3 m-0 text-[12.5px]">Then 28 more, grouped by record.</p>
        </Frame>
        <Frame eyebrow="Assistant paused">
          <Banner tone="warn" actions={<span className="font-medium underline">Resume</span>}>
            Assistant paused by you at 08:40. Nothing is sent or drafted.
          </Banner>
        </Frame>
        <Frame eyebrow="Mailbox disconnected">
          <Banner tone="bad" actions={<span className="font-medium underline">Reconnect</span>}>
            purchase@ disconnected 06:12. Supplier mail isn’t arriving.
          </Banner>
        </Frame>
        <Frame eyebrow="Setup unfinished">
          <FinishSetupBanner done={3} total={5} next="history" />
        </Frame>
        <Frame eyebrow="First morning after import">
          <h3 className="io-display m-0 text-[26px] leading-[1.2] font-normal">
            Here is what we learned from your last 12 months.
          </h3>
          <Card
            pairs={[
              { label: 'Clients', value: '700' },
              { label: 'Suppliers', value: '300' },
              { label: 'Part numbers', value: '2,900' },
              { label: 'Win rate', value: '38% by value' },
            ]}
          />
          <p className="text-io-ink-3 m-0 text-[12.5px]">Shown once, above Needs you.</p>
        </Frame>
      </div>
    </main>
  )
}
