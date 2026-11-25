import { SourceQuote } from '@indus/ops-ui/assistant'
import PageSvg from '../intake/PageSvg'
import { registerSourceRenderer, type SourceRendererProps } from './source-renderers'

/**
 * Why? sources for stored files (S08-T04): a PDF page with the span's box outlined, a sheet with the cited cell
 * highlighted, a Word paragraph with the quote marked, an image as received. Registered on import.
 */
function Frame({ span, children }: SourceRendererProps & { children: React.ReactNode }) {
  return (
    <figure
      data-part="source"
      className="border-io-line rounded-io-card bg-io-card m-0 flex flex-col overflow-hidden border"
    >
      <figcaption className="border-io-line text-io-ink-3 flex justify-between gap-3 border-b px-3.5 py-2.5 text-[12.5px]">
        <span className="truncate">
          {span.doc}
          {span.location ? ` · ${span.location}` : ''}
        </span>
        <a
          href={span.openHref}
          className="text-io-accent io-focus rounded-io-tag whitespace-nowrap hover:underline"
        >
          Open file ↗
        </a>
      </figcaption>
      {children}
      <p className="text-io-ink-2 border-io-line m-0 border-t px-3.5 py-2 text-[12.5px]">
        “{span.match}”
      </p>
    </figure>
  )
}

function PdfSource(props: SourceRendererProps) {
  const { span, active } = props
  if (!span.page) return <QuoteOnly {...props} />
  return (
    <Frame {...props}>
      <div className="bg-io-well p-3">
        <PageSvg
          page={span.page}
          label={`Page ${span.page.page} of ${span.doc}`}
          boxes={
            span.page.box
              ? [{ key: span.key, ord: null, box: span.page.box, tone: 'acc', active }]
              : []
          }
        />
      </div>
    </Frame>
  )
}

function SheetSource(props: SourceRendererProps) {
  const { span } = props
  if (!span.sheet) return <QuoteOnly {...props} />
  const cols = [...new Set(span.sheet.rows.flatMap((r) => r.cells.map((c) => c.c)))].sort(
    (a, b) => a.length - b.length || a.localeCompare(b)
  )
  return (
    <Frame {...props}>
      <div className="overflow-x-auto p-3">
        <table className="border-io-sheet-line w-full border-collapse text-[12px]">
          <caption className="text-io-ink-3 pb-1.5 text-left text-[11.5px]">
            Sheet {span.sheet.name}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="bg-io-fill text-io-ink-3 border-io-sheet-line border px-1.5 py-1 font-normal"
              />
              {cols.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="bg-io-fill text-io-ink-3 border-io-sheet-line border px-1.5 py-1 font-normal"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {span.sheet.rows.map((r) => (
              <tr key={r.r}>
                <th
                  scope="row"
                  className="bg-io-fill text-io-ink-3 border-io-sheet-line border px-1.5 py-1 font-normal"
                >
                  {r.r}
                </th>
                {cols.map((c) => {
                  const v = r.cells.find((x) => x.c === c)?.v ?? ''
                  const on = span.sheet!.cell === `${c}${r.r}`
                  return (
                    <td
                      key={c}
                      data-active={on ? 'true' : undefined}
                      className={
                        on
                          ? 'border-io-accent bg-io-accent-tint border-2 px-1.5 py-1'
                          : 'border-io-sheet-line border px-1.5 py-1'
                      }
                    >
                      {v}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  )
}

function ImageSource(props: SourceRendererProps) {
  const { span } = props
  if (!span.imageUrl) return <QuoteOnly {...props} />
  return (
    <Frame {...props}>
      <div className="bg-io-well p-3">
        {/* A received photo or scan, shown as it came. */}
        <img
          src={span.imageUrl}
          alt={`${span.doc}, as received`}
          className="rounded-io-paper block h-auto w-full"
        />
      </div>
    </Frame>
  )
}

function QuoteOnly({ span, active }: SourceRendererProps) {
  return (
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
  )
}

registerSourceRenderer('pdf', PdfSource)
registerSourceRenderer('sheet', SheetSource)
registerSourceRenderer('docx', QuoteOnly)
registerSourceRenderer('image', ImageSource)
