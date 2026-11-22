import { vatRows } from '@indus/ops-core'
import { CheckList } from '@indus/ops-ui/assistant'
import { VatBlock, vatBlockRows } from '@indus/ops-ui/chart'
import { DocumentPage, DocumentViewer } from '@indus/ops-ui/document'
import { letterheadFor, QUOTATION_HOUSE } from '@indus/ops-ui/fixtures/documents'
import { T2Record, T5Document } from '@indus/ops-ui/templates'
import { MAIL, REFS } from '../fixtures'
import { SpecimenComposer } from './islands'
import { specimenRecord } from './shared'

const SUBTOTAL = '30301.60'
const PDF = `${REFS.quotationRevised.replace('/', '-')}.pdf`

const COVER_HTML =
  '<p>Dear Sam,</p>' +
  `<p>Please find our quotation ${REFS.quotationRevised} attached for 11 of the 12 lines on your RFQ ${REFS.clientRef}. Line 4 follows by 9 Oct.</p>` +
  '<p>Kind regards,</p>' +
  '<p>Owner Example</p>'

/**
 * T5a · Document on well: the enquiry's Quotation tab. T2Record with a bleed body holds T5Document: the
 * quotation page in the 560 well, then checks, the VAT totals and the cover email. Send is the Composer's
 * button, a person's.
 */
export default function T5ASpecimen() {
  const { header, strip } = specimenRecord({
    slug: 't5a',
    kind: 'enquiry',
    tab: 'quotation',
    stage: 'Quoted',
    cta: 'Approve and send',
    ctaSegment: 'quotation',
    did: `drafted ${REFS.quotationRevised} and checked 12 prices against history`,
  })
  return (
    <T2Record header={header} strip={strip} body="bleed">
      <T5Document
        well={
          <DocumentViewer fileName={PDF} pageCount={2} className="h-full w-full">
            <DocumentPage
              data={QUOTATION_HOUSE}
              letterhead={letterheadFor('quotation')}
              scale="m"
            />
          </DocumentViewer>
        }
        side={
          <>
            <CheckList
              label="Checks"
              items={[
                {
                  key: 'priced',
                  mark: 'ok',
                  text: 'Every line priced from a supplier quote',
                  right: '11 of 12',
                },
                { key: 'margin', mark: 'warn', text: 'Line 3 below history margin', right: '9.8%' },
                { key: 'follow', mark: 'warn', text: 'Line 4 to follow', right: 'by 9 Oct' },
                { key: 'vat', mark: 'ok', text: 'VAT · export zero-rated', right: 'DAP Plant 2' },
              ]}
            />
            <VatBlock
              rows={vatBlockRows(vatRows('zero_rated_export', SUBTOTAL, '0', undefined, 'USD'))}
            />
            <SpecimenComposer
              mailbox="sales"
              mailboxes={MAIL.mailboxes}
              to={[MAIL.client]}
              subject={`RE: RFQ ${REFS.clientRef} · Sample turnaround spares`}
              initialHtml={COVER_HTML}
              attachments={[{ fileType: 'PDF', name: PDF, size: '2 pages' }]}
              toolbarNote="Assistant draft"
              primaryLabel="Approve and send"
              footNote="Sends from sales@ in the client thread"
            />
          </>
        }
      />
    </T2Record>
  )
}
