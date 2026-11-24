import { SourceQuote } from '@indus/ops-ui/assistant'
import { Banner } from '@indus/ops-ui/status'
import type { WhySpan } from '../../data/why'
import { registerSourceRenderer, rendererFor, type SourceRendererProps } from './source-renderers'

/**
 * Why? › Sources (S06-T05, board 112 "Evidence"): one source card per span, the matched text highlighted, the
 * span the link pointed at outlined. A source whose text changed since it was read says so.
 */
function EmailSource({ span, active }: SourceRendererProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {span.changed ? (
        <Banner tone="warn" icon="warn" title="Source changed since it was read">
          The email’s text is not what the Assistant read; the quote is shown as it was cited.
        </Banner>
      ) : null}
      <SourceQuote
        fileType={span.fileType}
        doc={span.doc}
        meta={span.meta}
        text={span.text}
        match={span.match}
        {...(span.matchAt !== undefined ? { matchAt: span.matchAt } : {})}
        location={span.location}
        openHref={span.openHref}
        active={active}
      />
    </div>
  )
}

function PageOnlySource({ span }: SourceRendererProps) {
  return (
    <figure
      data-part="source"
      className="border-io-line rounded-io-card bg-io-card m-0 flex flex-col overflow-hidden border"
    >
      <figcaption className="border-io-line text-io-ink-3 border-b px-3.5 py-2.5 text-[12.5px]">
        {span.doc} {span.meta ? `· ${span.meta}` : ''}
      </figcaption>
      <p className="text-io-ink-2 m-0 px-4 py-3.5 text-[13px]">Read from a scanned page</p>
    </figure>
  )
}

/** Any kind without a renderer yet: the quote as cited. */
function QuoteSource({ span, active }: SourceRendererProps) {
  return (
    <SourceQuote
      fileType={span.fileType}
      doc={span.doc}
      meta={span.meta}
      text={span.text}
      match={span.match}
      location={span.location}
      openHref={span.openHref}
      active={active}
    />
  )
}

registerSourceRenderer('email', EmailSource)
registerSourceRenderer('page_only', PageOnlySource)

export default function SourcePanel({
  spans,
  activeSpan,
  noQuote,
}: {
  spans: WhySpan[]
  activeSpan: string | null
  noQuote: string | null
}) {
  if (spans.length === 0) {
    return (
      <p className="text-io-ink-3 m-0 text-[12.5px]" data-part="no-quote">
        {noQuote ?? 'No sources recorded.'}
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      {spans.map((s) => {
        const R = rendererFor(s) ?? QuoteSource
        return (
          <div key={s.key} id={`span-${s.key}`}>
            <R span={s} active={activeSpan === null ? spans.length === 1 : s.key === activeSpan} />
          </div>
        )
      })}
    </div>
  )
}
