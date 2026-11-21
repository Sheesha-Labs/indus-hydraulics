import { cn } from '@indus/ops-ui/lib/cn'
import { MAIL_BODY_HOSTILE_LONG, MAIL_BODY_SUPPLIER_REPLY } from '@indus/ops-ui/fixtures/mail'
import {
  AssistantNote,
  AttachmentChip,
  MailFolder,
  MailMessage,
  RenderedEmail,
  SandboxedBody,
  ThreadRow,
  type AttachmentChipProps,
  type MailType,
} from '@indus/ops-ui/mail'
import { Chip, MAIL_TYPE_TONE } from '@indus/ops-ui/status'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { COMPANIES, MAIL, PEOPLE, REFS } from '../fixtures'
import { ComposerDemo } from './MailDemos'

/** Set to 'built' when S01-T09a lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/mail; inside the L1 mirror (section k06) they
 * are hidden so the card matches the sheet.
 */
function Row({
  name,
  code,
  note,
  full = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k06]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/** A fixed-width column of specimens (the sheet's `width:Npx; flex column; gap 10`). */
function Col({ w, children }: { w: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-2.5', w)}>{children}</div>
}

const OFFER: AttachmentChipProps[] = [
  { fileType: 'PDF', name: 'Example_Valve_Offer_0001.pdf', size: '212 KB' },
]
const DRAFT_FILES: AttachmentChipProps[] = [
  { fileType: 'PDF', name: 'INDUS-Q10001-R2.pdf', size: '2 pages' },
  { fileType: 'PDF', name: 'Datasheets.pdf', unavailable: true },
]
const CLIENT_FILES: AttachmentChipProps[] = [
  { fileType: 'XLS', name: 'Sample_RFQ_lines.xlsx', size: '38 KB' },
  { fileType: 'PDF', name: 'INDUS-Q10001.pdf', size: '2 pages' },
]
const ALL_FILES: AttachmentChipProps[] = [
  { fileType: 'PDF', name: 'Offer.pdf', size: '212 KB', href: '?file=offer' },
  { fileType: 'XLS', name: 'Lines.xlsx', size: '38 KB' },
  { fileType: 'CSV', name: 'Lines.csv', size: '4 KB' },
  { fileType: 'DOC', name: 'Terms.docx', size: '61 KB' },
  { fileType: 'IMG', name: 'Nameplate.jpg', size: '1.2 MB' },
  { fileType: 'MAIL', name: 'Forwarded.eml', size: '18 KB' },
  { fileType: 'PDF', name: 'Datasheets.pdf', unavailable: true },
]
const TYPES: MailType[] = [
  'Supplier quote',
  'Client reply',
  'New enquiry',
  'Supplier question',
  'Client PO',
  'Supplier documents',
  'Freight',
  'Payments',
  'Unsure',
  'Bounce',
  'Phishing',
]

const COMPOSER_HTML =
  '<p>Dear Sam,</p>' +
  `<p>Please find our quotation ${REFS.quotationRevised} attached for 11 of the 12 lines on your RFQ ${REFS.clientRef}. Line 4 follows by 28 Nov.</p>` +
  '<p>Kind regards,</p>' +
  `<p>${PEOPLE.owner.name}</p>`

/** Mail kit specimen: the L1 k06 mirror, then every variant and state (/_kit/mail only). */
export default async function MailSpecimen() {
  // The srcdoc frames inherit the console CSP; their base stylesheet needs this request's nonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const n = nonce ? { nonce } : {}
  return (
    <>
      {/* ---- L1 k06 mirror ---- */}
      <Row
        name="Thread row · folder"
        code='part="ThreadRow|Folder"'
        note="unread · selected · role Client | Supplier | Unknown"
      >
        <Col w="w-[400px]">
          <ThreadRow
            href="?thread=1"
            from={MAIL.supplier.name}
            senderRole="Supplier"
            company={COMPANIES.supplier}
            time="10:42"
            subject={`RE: ${REFS.supplierRfq} — offer attached`}
            type="Supplier quote"
            recordRef={`${REFS.enquiry} · ${REFS.supplierRfq}`}
            assistantNote="Captured quote: 3 of 4 lines, EUR, EXW 5 wks"
            unread
            selected
          />
          <ThreadRow
            href="?thread=2"
            from={MAIL.client.name}
            senderRole="Client"
            company={COMPANIES.client}
            time="10:31"
            subject="RE: Sample spares — line 4 trim"
            type="Client reply"
            recordRef={REFS.enquiry}
            assistantNote="Added answer to line 4; shared with supplier"
          />
        </Col>
        <Col w="w-[210px]">
          <MailFolder href="?folder=all" label="All" count={58} active />
          <MailFolder href="?folder=sales" label="sales@" count={34} />
          <MailFolder href="?folder=unsure" label="Unsure" count={3} warn />
        </Col>
        {/* /_kit/mail only (hidden in the L1 mirror), placed in row 1's free space on purpose: a sandboxed
            frame below the first viewport is never painted in an element screenshot, so the baseline would
            show it blank. One frame shows the reading height, Expand and the hostile sample. */}
        <div className="flex w-[560px] flex-col gap-1.5 in-data-[kit-section=k06]:hidden">
          <div className="border-io-line rounded-io-8 overflow-hidden border">
            <SandboxedBody
              html={MAIL_BODY_HOSTILE_LONG}
              title="Email body (hostile sample)"
              {...n}
            />
          </div>
          <p className="text-io-ink-3 text-[12px]">
            SandboxedBody “reading” (360, Expand → 720). Its script, onerror, javascript: link and
            remote image never run or load.
          </p>
        </div>
      </Row>

      <Row
        name="Message · Email"
        code='part="Message|Email"'
        note="In-console message card; client-side rendered email"
      >
        <Col w="w-[520px]">
          <MailMessage
            from={MAIL.supplier}
            to={MAIL.mailboxes.purchase}
            subject={`RE: ${REFS.supplierRfq} — offer attached`}
            bodyHtml={MAIL_BODY_SUPPLIER_REPLY}
            attachments={OFFER}
            bodyHeight="preview"
            {...n}
          />
        </Col>
        <Col w="w-[520px]">
          <RenderedEmail
            subject={`RE: ${REFS.quotationRevised} · Sample turnaround spares`}
            from={MAIL.client}
            to={MAIL.mailboxes.sales}
            time="10:42"
            body={
              <>
                <p>Dear Owner,</p>
                <p>Thank you for the quotation. We are evaluating and will revert by 28 Nov.</p>
                <p>Best regards,</p>
              </>
            }
            signature={`${MAIL.client.name} · Materials manager · ${COMPANIES.client}`}
          />
        </Col>
      </Row>

      <Row
        name="Composer · note"
        code='part="Composer|AssistantNote|Attachment"'
        note="From picks the mailbox; tbNote names the draft"
      >
        <Col w="w-[560px]">
          <ComposerDemo
            mailbox="sales"
            mailboxes={MAIL.mailboxes}
            to={[MAIL.client]}
            subject={`RE: RFQ ${REFS.clientRef} · Sample turnaround spares`}
            initialHtml={COMPOSER_HTML}
            attachments={DRAFT_FILES}
            toolbarNote="Assistant draft · edited"
            footNote="Sends from sales@ in the client thread"
          />
        </Col>
        <Col w="w-[460px]">
          <AssistantNote link={{ label: REFS.enquiry, href: '?record=enquiry' }}>
            This is a reply to {REFS.quotationRevised}. I linked it to {REFS.enquiry} and set the
            next touch to 28 Nov.
          </AssistantNote>
          <div className="flex">
            {CLIENT_FILES.map((a) => (
              <AttachmentChip key={a.name} {...a} />
            ))}
          </div>
        </Col>
      </Row>

      {/* ---- /_kit/mail only: every variant and state ---- */}
      <Row
        full
        name="Thread row · states"
        code="role · unread · type · recordRef · assistantNote"
        note="Unknown sender; read; no type or note; a Phishing flag"
      >
        <Col w="w-[400px]">
          <ThreadRow
            href="?thread=3"
            from={MAIL.unknown.name}
            senderRole="Unknown"
            company="unknown-sender.example"
            time="Yesterday"
            subject="Invoice overdue — action required"
            type="Phishing"
            assistantNote="Sender domain does not match the display name; not linked"
            unread
          />
          <ThreadRow
            href="?thread=4"
            from={PEOPLE.helper.name}
            senderRole="Internal"
            time="Mon"
            subject={`Fwd: ${REFS.order} packing list`}
          />
          <ThreadRow
            href="?thread=5"
            from={MAIL.supplier.name}
            senderRole="Supplier"
            company={COMPANIES.supplier}
            time="18 Nov"
            subject="Out of office until Monday"
            type="Unsure"
            recordRef={REFS.supplierRfq}
          />
        </Col>
        <Col w="w-[210px]">
          <MailFolder href="?folder=needs-you" label="Needs you" count={5} warn />
          <MailFolder href="?folder=suppliers" label="Suppliers" count={21} />
          <MailFolder href="?folder=sent" label="Sent" />
        </Col>
      </Row>

      <Row
        full
        name="Type chip · all types"
        code="MAIL_TYPE_TONE"
        note="Tone per type from status.ts"
      >
        {TYPES.map((t) => (
          <Chip key={t} tone={MAIL_TYPE_TONE[t]} label={t} className="h-io-tag" />
        ))}
      </Row>

      <Row
        full
        name="Composer · locked From"
        code="mailbox · mailboxLocked · cc"
        note="Supplier mail goes from purchase@ in the supplier thread"
      >
        <Col w="w-[560px]">
          <ComposerDemo
            mailbox="purchase"
            mailboxLocked
            mailboxes={MAIL.mailboxes}
            to={[MAIL.supplier]}
            cc={[{ address: 'quotes@example-valve.example' }]}
            subject={`RE: ${REFS.supplierRfq} — line 2 alternative`}
            initialHtml="<p>Dear Pat,</p><p>Thank you. Please quote the alternative for line 2 as well.</p>"
            primaryLabel="Send to supplier"
            footNote="Sends from purchase@ in the supplier thread"
          />
        </Col>
      </Row>

      <Row
        full
        name="Attachment · types"
        code="fileType · href · unavailable"
        note="PDF bad · XLS/CSV ok · DOC accent · unavailable dashed"
      >
        {ALL_FILES.map((a) => (
          <AttachmentChip key={a.name} {...a} />
        ))}
      </Row>

      <Row full name="Assistant note · no link" code="link?" note="The link is optional">
        <Col w="w-[460px]">
          <AssistantNote>
            Not linked yet: no record matches this sender. Link it from the thread.
          </AssistantNote>
        </Col>
      </Row>
    </>
  )
}
