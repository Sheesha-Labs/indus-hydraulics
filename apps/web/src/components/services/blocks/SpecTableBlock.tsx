import type { SpecTableBlock } from '@indus/domain'

export default function SpecTableBlockView({ block }: { block: SpecTableBlock }) {
  return (
    // A spec table cannot always fit a phone, and shrinking the type to make
    // it fit makes it unreadable. Per CLAUDE.md §2, wide content scrolls inside
    // its OWN container so the page body never scrolls sideways.
    <div className="my-4 mb-8 w-full max-w-full overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse border border-ih-border bg-ih-surface font-sans text-[13.5px]">
      <caption className="mono caption-top pb-2.5 text-left text-[10.5px] uppercase tracking-[0.14em] text-ih-muted">
        {block.caption}
      </caption>
      <thead>
        <tr>
          {['Component', 'Spec', 'As-found', 'After rebuild', 'Status'].map((h) => (
            <th
              key={h}
              className="mono border-b border-ih-border bg-ih-surface-2 px-3.5 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, i) => (
          <tr
            key={i}
            className={
              row.highlight
                ? '[&_td]:bg-ih-accent-soft [&_td]:font-medium [&_td]:text-ih-ink'
                : ''
            }
          >
            <td className="border-b border-ih-border px-3.5 py-2.5 text-left text-ih-ink-2 last:border-b-0">
              {row.component}
            </td>
            <td className="mono border-b border-ih-border px-3.5 py-2.5 text-left text-ih-ink-2 last:border-b-0">
              {row.spec}
            </td>
            <td
              className={`border-b border-ih-border px-3.5 py-2.5 text-left last:border-b-0 ${
                row.asFoundStyle === 'bad'
                  ? 'mono text-[oklch(0.5_0.15_30)]'
                  : row.asFoundStyle === 'num'
                    ? 'mono text-ih-ink-2'
                    : 'text-ih-ink-2'
              }`}
            >
              {row.asFound}
            </td>
            <td
              className={`border-b border-ih-border px-3.5 py-2.5 text-left last:border-b-0 ${
                row.afterStyle === 'good'
                  ? 'mono text-ih-success'
                  : row.afterStyle === 'num'
                    ? 'mono text-ih-ink-2'
                    : 'text-ih-ink-2'
              }`}
            >
              {row.afterRebuild}
            </td>
            <td className="border-b border-ih-border px-3.5 py-2.5 text-left text-ih-ink-2 last:border-b-0">
              {row.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}
