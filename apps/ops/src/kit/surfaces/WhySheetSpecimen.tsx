'use client'

import { Button } from '@indus/ops-ui/controls'
import type { ReactNode } from 'react'
import Providers from '../../components/shell/Providers'
import { WhyCard } from '../../components/why/WhyDrawer'
import type { WhySpan, WhyView } from '../../data/why'
import { COMPANIES, REFS } from '../fixtures'

/**
 * Board 112 as a sheet (S06 parity): a value in context with its Why? link, above the Why? it opens, for the
 * three places the board draws (Compare, extraction, Mail), with neutral fixtures. The cards are the drawer's
 * own content (WhyCard), opened on Sources as the board shows the evidence first.
 */
const EV = '00000000-0000-7000-8000-00000000e112'

function span(over: Partial<WhySpan> & Pick<WhySpan, 'key' | 'doc' | 'text' | 'match'>): WhySpan {
  return {
    reasonIndex: 0,
    sourceKind: 'pdf',
    fileType: 'PDF',
    meta: '',
    location: '',
    openHref: '#open',
    changed: false,
    pageOnly: false,
    ...over,
  }
}

function view(over: Partial<WhyView> & Pick<WhyView, 'eyebrow' | 'title' | 'spans'>): WhyView {
  return {
    id: EV,
    initialTab: 'sources',
    activeSpan: over.spans[0]?.key ?? null,
    reasons: [],
    alternatives: [],
    checks: [],
    confidence: { level: 'Sure' },
    footnote: null,
    noQuote: null,
    history: [],
    correction: null,
    overridden: null,
    ...over,
  }
}

const COMPARE = view({
  eyebrow: 'Why? · Compare',
  title: `Selected ${COMPANIES.supplier} at USD 1,690 ea for line 1.`,
  spans: [
    span({
      key: 'q',
      doc: 'EXV-Q-10001 · PDF page 2, row 3',
      text: 'Item 01 · Gate valve 6" CL300 WCB RF · 8 pcs · EUR 1,560.00 · 14 weeks ex works',
      match: 'Item 01 · Gate valve 6" CL300 WCB RF · 8 pcs · EUR 1,560.00 · 14 weeks ex works',
    }),
    span({
      key: 'past',
      reasonIndex: 1,
      sourceKind: 'quotation',
      fileType: 'DOC',
      doc: `${REFS.quotationRevised} · May 2026 · won`,
      text: `Same valve to ${COMPANIES.client} from ${COMPANIES.supplier}; delivered on time.`,
      match: 'delivered on time',
    }),
  ],
  alternatives: [
    {
      key: 'b',
      label: `${COMPANIES.other} USD 1,840 · 10 wks`,
      why: '8.9% dearer. Faster, but 14 weeks still meets the client’s delivery date',
    },
    { key: 'c', label: 'No third quote', why: 'The third supplier does not carry gate valves' },
  ],
  confidence: { level: 'Sure', reason: 'two quotes, lowest meets the client date' },
})

const EXTRACTION = view({
  eyebrow: 'Why? · Extraction',
  title: 'Read line 7’s part number as 4SH-12-1/2-08.',
  spans: [
    span({
      key: 'scan',
      doc: 'RFQ-0921.pdf · page 1, line 7 · scan',
      text: '4SH-12-1/2-O8',
      match: '4SH-12-1/2-O8',
      pageOnly: false,
    }),
    span({
      key: 'desc',
      reasonIndex: 1,
      doc: 'Line 7 description, same page',
      text: 'Hose 3/4" 4SH, crimped both ends, -08 JIC female',
      match: '-08 JIC female',
    }),
  ],
  alternatives: [
    {
      key: 'a',
      label: '4SH-12-1/2-O8 as printed',
      why: '“O8” is not a valid dash size; the description says -08',
    },
    { key: 'b', label: '4SH-12-1/2-03', why: 'Dash 03 does not exist for 3/4" hose' },
  ],
  confidence: {
    level: 'Unsure',
    reason:
      'the last character is smudged. A clearer copy or the client confirming would raise it.',
  },
})

const MAIL = view({
  eyebrow: 'Why? · Mail',
  title: 'Classified this email as a supplier price list, not an enquiry.',
  spans: [
    span({
      key: 'mail',
      sourceKind: 'email',
      fileType: 'MAIL',
      doc: 'Email · 23 Sep 07:58 · sales@example-bearings.test',
      text: '“Dear team, please find attached our updated price list for Q4. Stock on 22-series spherical rollers is good.”',
      match: 'please find attached our updated price list for Q4',
    }),
    span({
      key: 'company',
      reasonIndex: 1,
      sourceKind: 'company',
      fileType: 'DOC',
      doc: `Supplier record · ${COMPANIES.other}`,
      text: 'Domain example-bearings.test is on a Stockist supplier · 3 past quotes.',
      match: 'Stockist supplier',
    }),
  ],
  alternatives: [
    {
      key: 'a',
      label: 'Client enquiry',
      why: 'No request to quote; the sender is a known supplier',
    },
    {
      key: 'b',
      label: 'Supplier quote on an open RFQ',
      why: 'No IH-RFQ reference and no line prices for our items',
    },
  ],
})

function Context({ children }: { children: ReactNode }) {
  return (
    <div className="bg-io-card border-io-line rounded-io-card flex flex-col gap-2 border px-[14px] py-3 text-[13px]">
      {children}
    </div>
  )
}

function WhyChip() {
  return (
    <span className="border-io-accent-line text-io-accent rounded-io-pill border px-2 py-0.5 text-[11px]">
      Why?
    </span>
  )
}

export default function WhySheetSpecimen() {
  const keep = (
    <Button variant="primary" size="sm">
      Keep
    </Button>
  )
  return (
    <Providers>
      <div className="bg-io-ground min-h-[940px] w-[1440px] px-[33px] pt-[28px] pb-10">
        <p className="text-io-ink-2 m-0 flex items-center gap-2 text-[13px]">
          Every value the Assistant set carries <WhyChip />. It opens the same drawer everywhere:
          decision, evidence with the source highlighted, alternatives and why they lost,
          confidence, and a way to change it.
        </p>
        <div className="mt-[18px] grid grid-cols-3 items-start gap-[21px]">
          {[
            {
              eyebrow: `In context · Compare · ${REFS.enquiry} line 1`,
              line: (
                <span className="flex items-center gap-3">
                  Gate valve 6&quot; CL300 · 8 EA
                  <span className="bg-io-accent-tint text-io-accent rounded-io-tag px-2 py-1">
                    EXV $1,690 <WhyChip />
                  </span>
                </span>
              ),
              view: COMPARE,
            },
            {
              eyebrow: 'In context · Extraction · RFQ-0921.pdf',
              line: (
                <span className="flex items-center gap-3">
                  07 · Part no. 4SH-12-1/2-08 <WhyChip />
                </span>
              ),
              view: EXTRACTION,
            },
            {
              eyebrow: 'In context · Mail · purchase@',
              line: (
                <span className="flex items-center gap-3">
                  Sales Team · RE: Price list Q4 <WhyChip />
                </span>
              ),
              view: MAIL,
            },
          ].map((c) => (
            <div key={c.eyebrow} className="flex flex-col gap-3">
              <Context>
                <span className="io-eyebrow">{c.eyebrow}</span>
                {c.line}
              </Context>
              <WhyCard view={c.view} keep={keep} />
            </div>
          ))}
        </div>
      </div>
    </Providers>
  )
}
