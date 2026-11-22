import { Card, Kpi, NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { TodayHeader } from '@indus/ops-ui/shell'
import { T8Today } from '@indus/ops-ui/templates'
import { COMPANIES, HEADERS, REFS, TEMPLATES } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't8a'
const href = (q: string) => specimenHref(SLUG, q)

/**
 * T8a · Today (Owner). One primary per view: the board draws every needs-you button as a primary; here they
 * are secondary (the parity spec masks them, as T4A's queue buttons).
 */
export default function T8ASpecimen() {
  return (
    <T8Today
      header={<TodayHeader greeting={HEADERS.greeting} assistant="running" notificationCount={3} />}
      needsYou={
        <>
          <Card eyebrow={`Needs you · ${14}`} link={{ label: 'See all 14', href: '/review' }} />
          {TEMPLATES.needs.map((n) => (
            <NeedsRow
              key={n.key}
              action={n.action}
              title={n.title}
              sub={n.sub}
              actions={
                <ButtonLink size="sm" href={href(`open=${n.key}`)}>
                  {n.button}
                </ButtonLink>
              }
            />
          ))}
        </>
      }
      cameIn={
        <Card
          eyebrow="Came in since yesterday"
          items={[
            {
              key: 'c1',
              mark: 'n',
              title: '2 new enquiries',
              sub: `${REFS.enquiry} ${COMPANIES.client} · about USD 40k`,
            },
            {
              key: 'c2',
              mark: 'ok',
              title: '3 supplier quotes captured',
              sub: 'Example Valve, Demo Bearings, Sample Seals',
              right: '09:12',
            },
            {
              key: 'c3',
              mark: 'warn',
              title: '1 price above history',
              sub: 'BRG-6316-C3 · Demo Bearings +6%',
              right: 'Review',
            },
          ]}
        />
      }
      late={
        <Card
          eyebrow="Late"
          items={[
            {
              key: 'l1',
              mark: 'bad',
              title: 'Example inspection date',
              sub: `${REFS.po} · 3 days late`,
              right: { label: 'Chase', href: href('chase=l1') },
            },
            {
              key: 'l2',
              mark: 'warn',
              title: 'Sample Client · no reply',
              sub: 'INDUS/Q10002 · chaser 1 due',
              right: { label: 'Open', href: href('open=l2') },
            },
          ]}
        />
      }
      rail={
        <>
          <Kpi
            label="Awaiting decision"
            value={TEMPLATES.awaiting.value}
            sub={TEMPLATES.awaiting.sub}
          />
          <Kpi
            label="Cash in, next 7 days"
            value={TEMPLATES.cashIn.value}
            sub={TEMPLATES.cashIn.sub}
          />
          <Card
            eyebrow="Done for you"
            items={[
              { key: 'd1', mark: 'ok', title: '5 RFQs sent', sub: 'purchase@', right: '09:40' },
              { key: 'd2', mark: 'ok', title: '3 quotes captured', right: '10:42' },
              {
                key: 'd3',
                mark: 'ok',
                title: '2 chasers',
                sub: 'Example Valve, Demo Bearings',
                right: '10:05',
              },
            ]}
          />
        </>
      }
    />
  )
}
