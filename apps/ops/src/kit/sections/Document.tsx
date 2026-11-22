import type { HouseDocument } from '@indus/ops-core'
import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { DocumentPage, DocumentViewer, type DocScale } from '@indus/ops-ui/document'
import {
  DN_HOUSE,
  INVOICE_HOUSE,
  letterheadFor,
  NEUTRAL_LETTERHEAD,
  PI_HOUSE,
  PO_HOUSE,
  QUOTATION_ESTIMATE,
  QUOTATION_HOUSE,
  RFQ_HOUSE,
} from '@indus/ops-ui/fixtures/documents'
import type { ReactNode } from 'react'

/** Set to 'built' when S01-T09c lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

// L1 k07, mirrored row for row: Quotation · RFQ · PO at m, PI · invoice · DN at w with stamps, then the
// viewer and a thumb. Every document is a NEUTRAL fixture on the neutral letterhead (Example Trading LLC,
// TEST BANK, TRN 000000000000000): the sheet shows the real letterhead, so the design comparison masks the
// letterhead and bank regions ([data-doc-region], tests/visual-design/l1.spec.ts).
//
// Rows marked kitOnly (the Estimate layout, the four task fixtures at m, a full-scale page, thumbs and the
// viewer with actions) show on /_kit/document and /_kit but are hidden inside the L1 mirror, so k07 keeps
// the sheet's exact rows and height.

interface RowProps {
  title: string
  code: string
  note: string
  first?: boolean
  kitOnly?: boolean
  children: ReactNode
}

/** The sheet's spec row (.cv-sr): a 200px label column, then the specimens wrapping at 12px. */
function Row({ title, code, note, first = false, kitOnly = false, children }: RowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6',
        !first && 'border-io-line-2 border-t pt-[18px]',
        kitOnly && '[[data-kit-section=k07]_&]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px]">
        <b className="text-io-ink text-[13px] leading-normal font-medium">{title}</b>
        <code className="text-io-accent text-[11.5px] leading-normal">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function House({
  data,
  scale,
  ...rest
}: {
  data: HouseDocument
  scale: DocScale
  stamp?: 'Draft' | 'Superseded' | 'Paid'
  highlightRows?: number[]
}) {
  return <DocumentPage data={data} letterhead={letterheadFor(data.kind)} scale={scale} {...rest} />
}

function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="text-io-ink-3 flex flex-col items-start gap-1.5 text-[11px]">
      {children}
      <span>{caption}</span>
    </div>
  )
}

/** Download PDF: the accessible equivalent of the scaled page. */
function DownloadPdf() {
  return (
    <Button variant="secondary" size="xs">
      Download PDF
    </Button>
  )
}

/** Document kit specimen: every part with every variant and state (L1 section k07). */
export default function DocumentSpecimen() {
  return (
    <>
      <Row
        first
        title="Quotation · RFQ · PO"
        code='doc · scale="m"'
        note="Highlight lines with highlightRows={[3]}"
      >
        <House data={QUOTATION_HOUSE} scale="m" highlightRows={[3]} />
        <House data={RFQ_HOUSE} scale="m" />
        <House data={PO_HOUSE} scale="m" />
      </Row>
      <Row title="PI · invoice · DN" code="stamp" note="Draft · Superseded · Paid">
        <House data={PI_HOUSE} scale="w" />
        <House data={INVOICE_HOUSE} scale="w" stamp="Paid" />
        <House data={DN_HOUSE} scale="w" stamp="Draft" />
      </Row>
      <Row title="Viewer · thumb" code="DocumentViewer" note="Grey well with file name and pages">
        <DocumentViewer fileName="INDUS-Q10001.pdf" pageCount={2}>
          <House data={QUOTATION_HOUSE} scale="m" />
        </DocumentViewer>
        <Captioned caption="thumb">
          <House data={INVOICE_HOUSE} scale="thumb" />
        </Captioned>
      </Row>

      <Row
        kitOnly
        title="Estimate · scale z"
        code="layout: 'estimate'"
        note="The client quotation (P13): revision -R2, Superseded overlay, highlighted line"
      >
        <DocumentPage data={QUOTATION_ESTIMATE} letterhead={NEUTRAL_LETTERHEAD} scale="z" />
        <DocumentPage
          data={QUOTATION_ESTIMATE}
          letterhead={NEUTRAL_LETTERHEAD}
          scale="z"
          stamp="Superseded"
          highlightRows={[2]}
        />
      </Row>
      <Row
        kitOnly
        title="Four fixtures · m"
        code='scale="m"'
        note="Estimate quotation, RFQ, PO and tax invoice"
      >
        <DocumentPage data={QUOTATION_ESTIMATE} letterhead={NEUTRAL_LETTERHEAD} scale="m" />
        <House data={RFQ_HOUSE} scale="m" />
        <House data={PO_HOUSE} scale="m" />
        <House data={INVOICE_HOUSE} scale="m" />
      </Row>
      <Row
        kitOnly
        title="Full scale"
        code='scale="full"'
        note="794 × 1123, the page as the PDF draws it"
      >
        <House data={RFQ_HOUSE} scale="full" />
      </Row>
      <Row kitOnly title="Thumbs" code='scale="thumb"' note="150 × 212 in lists">
        <Captioned caption="Quotation · Estimate">
          <DocumentPage data={QUOTATION_ESTIMATE} letterhead={NEUTRAL_LETTERHEAD} scale="thumb" />
        </Captioned>
        <Captioned caption="RFQ">
          <House data={RFQ_HOUSE} scale="thumb" />
        </Captioned>
        <Captioned caption="PO">
          <House data={PO_HOUSE} scale="thumb" />
        </Captioned>
        <Captioned caption="Tax invoice · Paid">
          <House data={INVOICE_HOUSE} scale="thumb" stamp="Paid" />
        </Captioned>
        <Captioned caption="Delivery note · Draft">
          <House data={DN_HOUSE} scale="thumb" stamp="Draft" />
        </Captioned>
      </Row>
      <Row
        kitOnly
        title="Viewer · caption, actions"
        code="caption · actions"
        note="Page 2 of 3 selected; Download PDF in the bar"
      >
        <DocumentViewer
          fileName="IH-RFQ-2611-P01.pdf"
          pageCount={3}
          defaultPage={2}
          caption="Preview · as the supplier receives it"
          actions={<DownloadPdf />}
        >
          <House data={RFQ_HOUSE} scale="m" />
        </DocumentViewer>
      </Row>
    </>
  )
}
