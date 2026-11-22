import { OptionGroup } from '@indus/ops-ui/assistant'
import { Card, Note } from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { X1Exception } from '@indus/ops-ui/templates'
import { useId } from 'react'
import { COMPANIES, HEADERS, TEMPLATES } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 'x1'
const href = (q: string) => specimenHref(SLUG, q)
const X = TEMPLATES.exception

/**
 * A drafted email in the side column (boards 195–200): what it is, who it goes to from which mailbox, the
 * body, and its own primary. Approve and send is a person's button; Edit opens the composer.
 */
function DraftedEmail({
  id,
  label,
  to,
  body,
}: {
  id: string
  label: string
  to: string
  body: readonly string[]
}) {
  const headingId = useId()
  return (
    <article
      data-part="drafted-email"
      aria-labelledby={headingId}
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2.5 border px-[18px] py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="io-eyebrow">
          {label}
        </h2>
        <span className="text-io-ink-3 text-[12px]">{to}</span>
      </div>
      <Note tone="plain" className="flex flex-col gap-1.5 px-3.5 py-3">
        {body.map((line) => (
          <span key={line} className="text-io-ink">
            {line}
          </span>
        ))}
      </Note>
      <div className="flex gap-2">
        <ButtonLink variant="primary" size="sm" href={href(`send=${id}`)}>
          Approve and send
        </ButtonLink>
        <ButtonLink size="sm" href={href(`edit=${id}`)}>
          Edit
        </ButtonLink>
      </div>
    </article>
  )
}

/**
 * X1 · Exception page: a neutral "Supplier can't deliver" (board 197's shape). The decision is a radio
 * group of options with their effects; each drafted email carries its own primary; the header has none.
 */
export default function X1Specimen() {
  return (
    <X1Exception
      header={
        <PageHeader
          crumb={X.crumb}
          title={X.title}
          chip={{ label: 'Supplier issue', tone: 'bad' }}
        />
      }
      main={
        <>
          <Card eyebrow="What happened">
            <Note tone="plain" className="text-io-ink px-3.5 py-3">
              {X.quote}
            </Note>
          </Card>
          <OptionGroup
            name="supplier-issue"
            legend="What to do about line 8"
            defaultValue="resource"
            items={[
              {
                value: 'wait',
                title: 'Wait',
                sub: 'Replacement model from the same supplier, 14 weeks · margin 20% → 20% · client date +10 wk',
              },
              {
                value: 'resource',
                title: 'Re-source',
                sub: `Second-best from Compare: ${COMPANIES.supplier}, AED 3,500, 3 weeks · margin 20% → 13% · client date +1 wk`,
                suggested: true,
              },
              {
                value: 'partial',
                title: 'Partial',
                sub: `8 now from ${COMPANIES.supplier}, 6 later · margin → 16% · split delivery`,
              },
            ]}
          />
          <Card
            eyebrow="Documents"
            items={[
              {
                key: 'd1',
                mark: 'n',
                title: 'Supplier PO cancellation · INDUS/PO10003-C',
                sub: 'Line 8 only; the supplier’s other lines stay',
                right: { label: 'Draft', href: href('doc=cancellation') },
              },
              {
                key: 'd2',
                mark: 'warn',
                title: 'Advance refund request · GBP 2,700',
                sub: '30% advance paid 2 Oct on line 8',
                right: { label: 'Draft', href: href('doc=refund') },
              },
            ]}
          />
        </>
      }
      side={
        <>
          <DraftedEmail
            id="client"
            label="Client update"
            to="To Client Contact · sales@"
            body={[
              'Dear Client Contact,',
              'The pressure transmitters on line 8 will now arrive one week later, on 8 December, from an alternative source with the same specification. All other lines are on schedule.',
              'Best regards,',
              'Owner Sample',
            ]}
          />
          <DraftedEmail
            id="supplier"
            label="Supplier cancellation"
            to="To Supplier Contact · purchase@"
            body={[
              'Dear Supplier Contact,',
              `Please cancel line 8 of ${HEADERS.orderRef}'s purchase order and refund the advance paid on it. The other lines stay as ordered.`,
              'Best regards,',
              'Helper Example',
            ]}
          />
          <Card
            eyebrow="Also drafted"
            items={[
              {
                key: 'a1',
                mark: 'n',
                title: 'Replacement PO to the new source',
                sub: 'Waits for your choice above',
              },
            ]}
          />
        </>
      }
    />
  )
}
