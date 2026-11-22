import { ButtonLink, SearchInput } from '@indus/ops-ui/controls'
import { MAIL_BODY_SUPPLIER_REPLY } from '@indus/ops-ui/fixtures/mail'
import { AssistantNote, MailFolder, MailMessage, ThreadRow } from '@indus/ops-ui/mail'
import { PageHeader } from '@indus/ops-ui/shell'
import { T3Mail } from '@indus/ops-ui/templates'
import { headers } from 'next/headers'
import { COMPANIES, MAIL, PEOPLE, REFS } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't3a'
const href = (q: string) => specimenHref(SLUG, q)

const MAILBOX = [
  { key: 'all', label: 'All', count: 64, active: true },
  { key: 'sales', label: 'sales@', count: 38 },
  { key: 'purchase', label: 'purchase@', count: 26 },
] as const
const STATUS = [
  { key: 'unsure', label: 'Unsure', count: 3, warn: true },
  { key: 'unlinked', label: 'Not linked', count: 2 },
  { key: 'needs', label: 'Needs you', count: 4 },
  { key: 'handled', label: 'Handled by Assistant', count: 55 },
] as const

/** T3a · Three-pane mail: a supplier quote selected and open in the reading pane. */
export default async function T3ASpecimen() {
  // The message body is a sandboxed srcdoc frame; its base stylesheet needs this request's CSP nonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <T3Mail
      header={
        <PageHeader
          crumb="Workspace"
          title="Mail"
          actions={
            <ButtonLink variant="primary" href={href('compose=1')}>
              Compose
            </ButtonLink>
          }
        />
      }
      folders={
        <>
          <span className="io-eyebrow text-io-ink-3 px-2.5 py-1 text-[10.5px] leading-[14px]">
            Mailbox
          </span>
          {MAILBOX.map((f) => (
            <MailFolder
              key={f.key}
              href={href(`folder=${f.key}`)}
              label={f.label}
              count={f.count}
              {...('active' in f ? { active: f.active } : {})}
            />
          ))}
          <span className="io-eyebrow text-io-ink-3 px-2.5 pt-3 pb-1 text-[10.5px] leading-[14px]">
            Status
          </span>
          {STATUS.map((f) => (
            <MailFolder
              key={f.key}
              href={href(`folder=${f.key}`)}
              label={f.label}
              count={f.count}
              {...('warn' in f ? { warn: f.warn } : {})}
            />
          ))}
        </>
      }
      list={
        <>
          <div className="border-io-line border-b px-3.5 py-2.5">
            <SearchInput aria-label="Search mail" placeholder="Search mail" />
          </div>
          <ThreadRow
            href={href('thread=1')}
            from={MAIL.supplier.name}
            senderRole="Supplier"
            company={COMPANIES.supplier}
            time="10:42"
            subject={`RE: ${REFS.supplierRfq} — offer attached`}
            type="Supplier quote"
            recordRef={`${REFS.enquiry} · ${REFS.supplierRfq}`}
            assistantNote="Captured quote: 4 of 5 lines, EUR, EXW 6 wks"
            selected
          />
          <ThreadRow
            href={href('thread=2')}
            from={MAIL.client.name}
            senderRole="Client"
            company={COMPANIES.client}
            time="10:31"
            subject="RE: Sample spares — line 4 trim"
            type="Client reply"
            recordRef={REFS.enquiry}
            assistantNote="Added answer to line 4; shared with the supplier"
          />
          <ThreadRow
            href={href('thread=3')}
            from={PEOPLE.owner.name}
            senderRole="Client"
            company={`fwd · ${COMPANIES.client}`}
            time="10:05"
            subject={`Fwd: RFQ ${REFS.clientRef} · Please address`}
            type="New enquiry"
            assistantNote="Proposed ENQ-2026-0002 · 14 lines · deadline 28 Sep"
          />
          <ThreadRow
            href={href('thread=4')}
            from="Lee Example"
            senderRole="Supplier"
            company={COMPANIES.other}
            time="08:52"
            subject="RE: IH-RFQ-2611-P02 — two questions"
            type="Supplier question"
            recordRef={`${REFS.enquiry} · IH-RFQ-2611-P02`}
            assistantNote="2 questions relayed to the client without names"
          />
          <ThreadRow
            href={href('thread=5')}
            from="noreply@ship.example"
            senderRole="Unknown"
            time="08:10"
            subject="Shipment notification 0000000001"
            type="Unsure"
            assistantNote="Tracking number matches no order; left for you"
          />
        </>
      }
      reading={
        <>
          <AssistantNote link={{ label: 'Open capture', href: `/enquiries/${REFS.enquiry}/lines` }}>
            Captured 4 of 5 lines into {REFS.enquiry}. Line 3 is not in the supplier’s range; I
            marked it Regret for this supplier.
          </AssistantNote>
          <MailMessage
            from={MAIL.supplier}
            to={MAIL.mailboxes.purchase}
            subject={`RE: ${REFS.supplierRfq} — offer attached`}
            bodyHtml={MAIL_BODY_SUPPLIER_REPLY}
            attachments={[
              { fileType: 'PDF', name: 'Example_Valve_Offer_0001.pdf', size: '212 KB' },
            ]}
            bodyHeight="preview"
            {...(nonce ? { nonce } : {})}
          />
        </>
      }
    />
  )
}
