import type { ComparisonTableBlock } from '@indus/domain'

/**
 * Real table markup, never an image. Most competitor spec charts in this
 * niche are trapped in JPEGs and PDFs, and an answer engine cannot cite what
 * it cannot parse — so semantic `<th scope>` and a caption are doing SEO work
 * as much as accessibility work.
 *
 * Scrolls inside its own container: a seven-column pressure table on a phone
 * must not make the whole page scroll sideways.
 */
export default function ComparisonTableBlockView({ block }: { block: ComparisonTableBlock }) {
  const [rowHeader, ...colHeaders] = block.columns

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-ih-border bg-ih-surface font-sans text-[13.5px]">
        {block.caption && (
          <caption className="mono caption-top pb-2.5 text-left text-[10.5px] uppercase tracking-[0.14em] text-ih-muted">
            {block.caption}
          </caption>
        )}
        <thead>
          <tr>
            <th
              scope="col"
              className="mono border-b border-ih-border bg-ih-surface-2 px-3.5 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
            >
              {rowHeader}
            </th>
            {colHeaders.map((h) => (
              <th
                key={h}
                scope="col"
                className="mono border-b border-ih-border bg-ih-surface-2 px-3.5 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => {
            const [label, ...values] = row.cells
            return (
              <tr
                key={i}
                className={
                  row.highlight ? '[&_td]:bg-ih-accent-soft [&_th]:bg-ih-accent-soft [&_td]:font-medium' : ''
                }
              >
                <th
                  scope="row"
                  className="border-b border-ih-border px-3.5 py-2.5 text-left font-medium text-ih-ink"
                >
                  {label}
                </th>
                {values.map((cell, j) => (
                  <td key={j} className="border-b border-ih-border px-3.5 py-2.5 text-ih-ink-2">
                    {cell}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
