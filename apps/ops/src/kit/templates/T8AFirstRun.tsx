import { Card, NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { TodayHeader } from '@indus/ops-ui/shell'
import { ProgressBar } from '@indus/ops-ui/status'
import { T8Today } from '@indus/ops-ui/templates'
import { COMPANIES, REFS, TEMPLATES } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't8a-first-run'
const href = (q: string) => specimenHref(SLUG, q)

/**
 * T8 · Today, first-run variant (board 224, no L2 board): the setup checklist takes the needs-you place;
 * the rail shows the history import and what the Assistant will do. The first sample is the one primary.
 */
export default function T8AFirstRunSpecimen() {
  const samples = [
    {
      key: 's1',
      title: `${COMPANIES.client} · RFQ ${REFS.clientRef} · turnaround spares`,
      sub: 'sales@ · 14 Sep',
    },
    { key: 's2', title: `${COMPANIES.other} · gearbox spares`, sub: 'sales@ · 21 Sep' },
    { key: 's3', title: 'Example Marine LLC · refit hoses', sub: 'Website · today' },
  ]
  return (
    <T8Today
      variant="first-run"
      header={
        <TodayHeader
          greeting={TEMPLATES.greetingFirstRun}
          assistant="running"
          notificationCount={0}
        />
      }
      setup={
        <>
          <Card
            eyebrow="Try it now"
            title="Forward any client enquiry to the console, and watch the Assistant set it up."
            text="Forward to sales@ with “+ops” or pick one below. Nothing is sent to anyone."
          >
            {samples.map((s, i) => (
              <NeedsRow
                key={s.key}
                title={s.title}
                sub={s.sub}
                actions={
                  <ButtonLink
                    size="sm"
                    {...(i === 0 ? { variant: 'primary' as const } : {})}
                    href={href(`use=${s.key}`)}
                  >
                    Use this one
                  </ButtonLink>
                }
              />
            ))}
          </Card>
          <Card
            eyebrow={`Walk-through · ${REFS.enquiry}`}
            items={[
              {
                key: 'w1',
                mark: 'ok',
                title: 'Created the enquiry from the client’s email',
                sub: `${COMPANIES.client} · client matched`,
              },
              {
                key: 'w2',
                mark: 'ok',
                title: 'Extracted 12 lines',
                sub: 'From the RFQ PDF, part numbers kept as written',
              },
              {
                key: 'w3',
                mark: 'run',
                title: 'Proposed suppliers for each trade group',
                sub: 'Example Valve and Demo Bearings for valves',
              },
              {
                key: 'w4',
                mark: 'todo',
                title: 'Your turn: approve the first RFQ',
                sub: 'It goes to Review; nothing is sent until you approve',
              },
            ]}
          />
        </>
      }
      rail={
        <>
          <Card eyebrow="Bringing in your history">
            <ProgressBar value={46} total={100} label="History import" valueText="46%" />
            <p className="text-io-ink-3 text-[12.5px] leading-[1.5]">
              Finding companies · 742 clients and 198 suppliers so far. About 1 hour 40 minutes
              left.
            </p>
          </Card>
          <Card
            eyebrow="What the Assistant will do for you"
            items={[
              {
                key: 'a1',
                mark: 'n',
                title: 'Read every enquiry that reaches sales@ and set it up with its lines',
                right: { label: 'Autopilot', href: '/autopilot' },
              },
              {
                key: 'a2',
                mark: 'n',
                title: 'Write to suppliers from purchase@ and chase them politely until they reply',
                right: { label: 'Autopilot', href: '/autopilot' },
              },
              {
                key: 'a3',
                mark: 'n',
                title:
                  'Capture their quotes and draft your quotation; you approve before anything goes to a client',
                right: { label: 'Autopilot', href: '/autopilot' },
              },
            ]}
          />
        </>
      }
    />
  )
}
