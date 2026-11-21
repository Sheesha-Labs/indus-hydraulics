import {
  CheckList,
  ConfidenceLine,
  Highlight,
  OptionGroup,
  ProposalPreview,
  SourceQuote,
  WhyList,
} from '@indus/ops-ui/assistant'
import { cn } from '@indus/ops-ui/lib/cn'
import type { ReactNode } from 'react'
import { ASSISTANT, COMPANIES, REFS } from '../fixtures'
import { AssistantToasts, DemoProposal, DemoUnsure } from './AssistantDemos'

/** Set to 'built' when S01-T09b lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`): name, API and note on the left, specimens on the right. `full` rows exist
 * only on /_kit/assistant; inside the L1 mirror (section k05) they are hidden so the card matches the sheet.
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
        full && 'in-data-[kit-section=k05]:hidden'
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

/** A fixed-width column of specimens (the sheet's `<div style="width:…px">` wrappers). */
function Col({ w, children }: { w: 420 | 480 | 560 | 600; children: ReactNode }) {
  const width = { 420: 'w-[420px]', 480: 'w-[480px]', 560: 'w-[560px]', 600: 'w-[600px]' }[w]
  return <div className={cn('flex flex-col gap-2.5', width)}>{children}</div>
}

/** Assistant kit specimen: the L1 k05 mirror, then every pattern-14 variant (/_kit/assistant only). */
export default function AssistantSpecimen() {
  return (
    <AssistantToasts>
      {/* ---- L1 k05 mirror ---- */}
      <Row
        name="Proposal card"
        code='part="ProposalCard"'
        note="Default with preview, checks and confidence"
      >
        <Col w={600}>
          <DemoProposal variant="default" />
        </Col>
      </Row>

      <Row name="States" code="state · compact" note="approved · rejected · collapsed · compact">
        <Col w={480}>
          <DemoProposal variant="approved" />
          <DemoProposal variant="rejected" />
        </Col>
        <Col w={480}>
          <DemoProposal variant="collapsed" />
        </Col>
      </Row>

      <Row
        name="Option · Unsure"
        code='part="Option|Unsure"'
        note="Judgement calls; one suggested option"
      >
        <Col w={420}>
          <OptionGroup
            name="k05-option"
            items={ASSISTANT.options.map((o) => ({ ...o }))}
            defaultValue="one"
            className="gap-2.5"
          />
        </Col>
        <Col w={560}>
          <DemoUnsure />
        </Col>
      </Row>

      <Row
        name="Why? source"
        code='part="Source|Highlight"'
        note="Opened from any evidence link; the matched text is highlighted"
      >
        <Col w={420}>
          <SourceQuote
            fileType="PDF"
            doc={ASSISTANT.source.doc}
            meta={ASSISTANT.source.meta}
            text={ASSISTANT.source.text}
            match={ASSISTANT.source.match}
            location={ASSISTANT.source.location}
            openHref="#k05"
          />
        </Col>
        <span className="text-io-body">
          <Highlight text={ASSISTANT.highlight.text} match={ASSISTANT.highlight.match} />
        </span>
      </Row>

      {/* ---- /_kit/assistant only: every pattern-14 variant ---- */}
      <Row
        full
        name="Options · chosen"
        code="options · legend · value"
        note="Judgement calls (107, 125, 170): a fieldset of radio cards; the suggested one starts chosen"
      >
        <Col w={600}>
          <DemoProposal variant="judgement" />
        </Col>
      </Row>

      <Row
        full
        name="Signals · toggle · aside"
        code="signals · toggle · aside"
        note="Is it worth quoting? (P15): signal rows, a switch posted with Approve, a quiet aside"
      >
        <Col w={600}>
          <DemoProposal variant="qualify" />
        </Col>
      </Row>

      <Row
        full
        name="Reason chips"
        code="reasonChips"
        note="Regret reasons (168): one chip, sent with Approve"
      >
        <Col w={600}>
          <DemoProposal variant="regret" />
        </Col>
      </Row>

      <Row
        full
        name="Raised · preview"
        code="raised · preview"
        note="A card that just arrived (92, 103); preview only, a note on the right"
      >
        <Col w={600}>
          <DemoProposal variant="raised" />
        </Col>
      </Row>

      <Row
        full
        name="Locked level"
        code="level.locked · approveLabel · batchable"
        note="Send quotation, supplier POs, payments: approved by a click only, never ⌘↵, never batched"
      >
        <Col w={600}>
          <DemoProposal variant="locked" />
        </Col>
      </Row>

      <Row
        full
        name="Compact · batch"
        code="compact · batchable"
        note="Review rows (104, 110, 171b): open compact, and collapsed chasers that may batch"
      >
        <Col w={480}>
          <DemoProposal variant="compact" />
          <DemoProposal variant="batch" />
        </Col>
      </Row>

      <Row
        full
        name="Read only · failure"
        code="readOnly · approve → { success: false }"
        note="The Helper sees money cards without verbs; a failed approve reverts with an error toast"
      >
        <Col w={480}>
          <DemoProposal variant="readonly" />
          <DemoProposal variant="fails" />
        </Col>
      </Row>

      <Row
        full
        name="Why · Checks · Preview"
        code='part="Why|Checks|Preview"'
        note="The card's body parts on their own"
      >
        <Col w={420}>
          <WhyList reasons={ASSISTANT.rfq.why.map((w) => ({ ...w }))} />
          <CheckList items={ASSISTANT.rfq.checks.map((c) => ({ ...c }))} label="Checks" />
        </Col>
        <Col w={420}>
          <ProposalPreview
            title={ASSISTANT.rfq.preview.title}
            lines={ASSISTANT.rfq.preview.lines.map((l) => ({ ...l }))}
          />
        </Col>
      </Row>

      <Row
        full
        name="Confidence"
        code='part="Confidence" level'
        note="Always a word computed by code checks, never a percentage"
      >
        <Col w={420}>
          <ConfidenceLine level="Sure" />
          <ConfidenceLine level="Likely" reason={ASSISTANT.rfq.confidence.reason} />
          <ConfidenceLine level="Unsure" reason="Two quotes disagree on the pressure class." />
        </Col>
      </Row>

      <Row
        full
        name="Source · file types"
        code="fileType"
        note="PDF · XLS · MAIL; Highlight at rest and active"
      >
        <Col w={420}>
          <SourceQuote
            fileType="XLS"
            doc="EVC-PRICES-2026.xlsx"
            meta="Sheet 1 · row 14"
            text="BRG-6316-C3 · 24 ea · AED 418.00 · 5 weeks"
            match="5 weeks"
            location="Line 3 · lead time"
            openHref="#assistant"
          />
          <SourceQuote
            fileType="MAIL"
            doc={`Re: ${REFS.supplierRfq}`}
            meta={`${COMPANIES.supplier} · 15 Nov`}
            text="We can hold the price until 30 November if you confirm this week."
            match="until 30 November"
            location="Validity"
            openHref="#assistant"
          />
        </Col>
        <Col w={420}>
          <span className="text-io-body">
            <Highlight text="Delivery 5 weeks from order." match="5 weeks" />
          </span>
          <span className="text-io-body">
            <Highlight text="Delivery 5 weeks from order." match="5 weeks" active />
          </span>
        </Col>
      </Row>
    </AssistantToasts>
  )
}
