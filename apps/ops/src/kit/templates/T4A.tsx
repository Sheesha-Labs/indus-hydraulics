import { NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T4Review } from '@indus/ops-ui/templates'
import { ASSISTANT, REFS } from '../fixtures'
import { SpecimenProposal } from './islands'
import { specimenHref } from './shared'

const SLUG = 't4a'
const href = (q: string) => specimenHref(SLUG, q)

const FILTERS = [
  { value: 'all', label: 'All', count: 14 },
  { value: 'rfqs', label: 'Supplier RFQs', count: 4 },
  { value: 'quotations', label: 'Quotations', count: 2 },
  { value: 'chasers', label: 'Chasers', count: 5 },
  { value: 'judgement', label: 'Judgement calls', count: 3 },
]

const QUEUE = [
  {
    key: 'q1',
    action: 'Send quotation',
    title: `${REFS.quotationRevised} · Sample Client`,
    sub: 'Assistant drafted · price guard 2 warnings',
    verb: 'Review',
  },
  {
    key: 'q2',
    action: 'Send RFQ',
    title: `${REFS.supplierRfq} · 5 suppliers`,
    sub: 'Bearings · Example, Sample, Demo and 2 more',
    verb: 'Review',
  },
  {
    key: 'q3',
    action: 'Relay questions',
    title: 'Demo Bearings · 2 questions on line 4',
    sub: 'Names removed before relaying',
    verb: 'Review',
  },
  {
    key: 'q4',
    action: 'Equivalent?',
    title: 'FLT-10-220 ≈ FLT-10-228',
    sub: 'Seen on 3 RFQs',
    verb: 'Decide',
  },
  {
    key: 'q5',
    action: 'Chase',
    title: 'Example Automation Co · 3 chasers, no reply',
    sub: 'Call, try another contact, or drop',
    verb: 'Open',
  },
]

const RFQ = ASSISTANT.rfq

/** The kit's RFQ proposal, its sentences cut to the board's line lengths so each row sets as it does. */
const WHY = [
  { ...RFQ.why[0]!, evidence: { ...RFQ.why[0]!.evidence } },
  {
    text: `Example and Demo quoted the same sizes on ${REFS.enquiry} in September.`,
    evidence: { ...RFQ.why[1]!.evidence },
  },
  { ...RFQ.why[2]!, evidence: { ...RFQ.why[2]!.evidence } },
]
const CHECKS = RFQ.checks.map((c) =>
  c.key === 'new' ? { ...c, text: 'First email to Demo Bearings' } : { ...c }
)

/**
 * T4a · Review queue: the RFQ proposal open. The queue rows' buttons are secondary: the open card's
 * Approve is the view's one primary (the board draws five more primaries in the queue).
 */
export default function T4ASpecimen() {
  return (
    <T4Review
      header={
        <PageHeader
          crumb="Workspace"
          title="Review · 14 waiting"
          actions={<ButtonLink href={href('batch=chasers')}>Approve all chasers</ButtonLink>}
          filters={
            <Choices
              aria-label="Review filter"
              options={FILTERS}
              value="all"
              hrefFor={(v) => href(`filter=${v}`)}
            />
          }
        />
      }
      queue={QUEUE.map((q) => (
        <NeedsRow
          key={q.key}
          action={q.action}
          title={q.title}
          sub={q.sub}
          actions={
            <ButtonLink size="sm" href={href(`open=${q.key}`)}>
              {q.verb}
            </ButtonLink>
          }
        />
      ))}
      detail={
        <SpecimenProposal
          id={RFQ.id}
          type={RFQ.type}
          record={{ label: RFQ.record, href: `/enquiries/${REFS.enquiry}` }}
          level={{ label: RFQ.level }}
          headline={RFQ.headline}
          why={WHY}
          preview={{ title: RFQ.preview.title, lines: RFQ.preview.lines.map((l) => ({ ...l })) }}
          checks={CHECKS}
          confidence={{
            level: 'Likely',
            reason: 'Demo’s bearing range comes from its website, not a past quote.',
          }}
          onApproveText={{
            text: '5 emails go from purchase@ with the Helper’s signature, Cc sales@, in 5 minutes. Reply-by 30 Sep; chasers start 1 Oct.',
          }}
          state="open"
          minutesAgo={12}
        />
      }
    />
  )
}
