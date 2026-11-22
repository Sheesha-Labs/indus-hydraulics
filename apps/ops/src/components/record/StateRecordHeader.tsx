import { needLabel, recordBaseHref, type RecordHeaderState } from '@indus/ops-core'
import { Card } from '@indus/ops-ui/card'
import { AssistantStrip, RecordHeader } from '@indus/ops-ui/shell'
import { recordTabItems } from '../../lib/record-tabs'

/**
 * The record cockpit's header from one `RecordHeaderState` (05 §6.2): RecordHeader with the kind's tab set
 * (ENQUIRY_TABS, ORDER_TABS, TENDER_TABS). The active tab follows the URL (RecordTabs). "Log activity" is a
 * record-local drawer, so a search param on the current page.
 */
export default function StateRecordHeader({ state }: { state: RecordHeaderState }) {
  const s = state
  return (
    <RecordHeader
      kind={s.kind}
      crumb={
        s.kind === 'order'
          ? { label: 'Orders', href: '/orders' }
          : { label: 'Enquiries', href: '/enquiries' }
      }
      client={{ label: s.clientName, href: s.clientHref }}
      reference={s.enquiryRef}
      title={s.title}
      meta={s.meta}
      stage={s.stage}
      tabs={recordTabItems(s.kind, s.ref)}
      {...(s.chip ? { chip: s.chip } : {})}
      {...(s.threadHref ? { threadHref: s.threadHref } : {})}
      logActivityHref="?log=1"
      // An action CTA (approve, send) is a client button its sprint builds; until then it opens the record.
      cta={'href' in s.cta ? s.cta : { label: s.cta.label, href: recordBaseHref(s.kind, s.ref) }}
    />
  )
}

/** The Assistant strip under the header: what it did on the record, and what needs a person. */
export function RecordStrip({ state }: { state: RecordHeaderState }) {
  return (
    <AssistantStrip
      recordKey={`record:${state.ref}`}
      did={state.did ?? 'has not acted on this record yet'}
      {...(state.need
        ? { need: { label: needLabel(state.need.count), href: state.need.href } }
        : {})}
    />
  )
}

/** The 330 rail's placeholder until S09 fills facts, the open proposal and the timeline. */
export function RecordRailSkeleton() {
  return (
    <Card
      eyebrow="Record facts"
      text="Facts, the open proposal and the record's timeline arrive in S09."
    />
  )
}
