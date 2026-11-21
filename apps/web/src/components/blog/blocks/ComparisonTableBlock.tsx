import type { ComparisonTableBlock } from '@indus/domain'

/**
 * Real table markup, never an image. Most competitor spec charts in this
 * niche are trapped in JPEGs and PDFs, and an answer engine cannot cite what
 * it cannot parse — so semantic `<th scope>` and a caption are doing SEO work
 * as much as accessibility work.
 *
 * Wide screens: a bordered table that scrolls inside its own container, so a
 * seven-column pressure table never makes the page scroll sideways.
 *
 * 760px and below: one card per row. The SAME markup, re-displayed — the row
 * header becomes the card title and each cell labels itself from `data-k`.
 * Nothing is duplicated in the DOM, so the table a crawler reads is the table
 * a phone reader sees.
 *
 * `highlight` has no label field, and what it means varies by post, so a
 * highlighted row carries a neutral "Highlighted" tag next to its header —
 * the warm ground is never the only signal.
 */
const ROW_CELL =
  'border-b border-ih-border px-4 py-[13px] text-left align-top max-[760px]:px-3.5 max-[760px]:py-[9px]'

export default function ComparisonTableBlockView({ block }: { block: ComparisonTableBlock }) {
  return (
    <figure className="m-0 min-w-0">
      {block.caption && (
        <figcaption className="text-ih-ink-2 mb-2.5 text-[13.5px] font-medium">
          {block.caption}
        </figcaption>
      )}
      <div
        tabIndex={0}
        role="region"
        aria-label={block.caption ?? 'Comparison table'}
        className="border-ih-border bg-ih-surface overflow-x-auto rounded-lg border max-[760px]:overflow-visible max-[760px]:rounded-none max-[760px]:border-0 max-[760px]:bg-transparent"
      >
        <table className="w-full border-collapse text-[14px] leading-[1.45] max-[760px]:block">
          <thead className="max-[760px]:hidden">
            <tr>
              {block.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-ih-border bg-ih-surface-2 text-ih-muted border-b px-4 py-3 text-left font-mono text-[10.5px] font-medium tracking-[0.1em] whitespace-nowrap uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="max-[760px]:flex max-[760px]:flex-col max-[760px]:gap-2.5">
            {block.rows.map((row, i) => {
              const [label, ...values] = row.cells
              return (
                <tr
                  key={i}
                  className={`max-[760px]:bg-ih-surface max-[760px]:block max-[760px]:overflow-hidden max-[760px]:rounded-lg max-[760px]:border [&:last-child>*]:border-b-0 ${
                    row.highlight
                      ? 'min-[761px]:[&>*]:bg-ih-highlight max-[760px]:border-ih-warning-line'
                      : 'max-[760px]:border-ih-border'
                  }`}
                >
                  <th
                    scope="row"
                    className={`${ROW_CELL} text-ih-ink font-semibold max-[760px]:block max-[760px]:border-b! max-[760px]:py-3 min-[761px]:whitespace-nowrap ${
                      row.highlight ? 'max-[760px]:bg-ih-highlight' : ''
                    }`}
                  >
                    {label}
                    {row.highlight && (
                      <span className="bg-ih-highlight-tag text-ih-highlight-ink ml-2 inline-block rounded-sm px-1.5 py-0.5 align-middle font-mono text-[9.5px] font-medium tracking-[0.08em] uppercase">
                        Highlighted
                      </span>
                    )}
                  </th>
                  {values.map((cell, j) => (
                    <td
                      key={j}
                      data-k={block.columns[j + 1]}
                      className={`${ROW_CELL} text-ih-ink-2 max-[760px]:before:text-ih-muted max-[760px]:grid max-[760px]:grid-cols-[112px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:before:pt-0.5 max-[760px]:before:font-mono max-[760px]:before:text-[10px] max-[760px]:before:tracking-[0.08em] max-[760px]:before:uppercase max-[760px]:before:content-[attr(data-k)] max-[760px]:last:border-b-0`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
