import type { DownloadBlock } from '@indus/domain'

export default function DownloadBlockView({ block }: { block: DownloadBlock }) {
  return (
    <section className="my-6">
      {block.heading && (
        <p className="mono mb-2.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          {block.heading}
        </p>
      )}
      <ul className="flex list-none flex-col gap-2 p-0">
        {block.items.map((item, i) => (
          <li key={i}>
            <a
              href={item.url}
              className="flex items-center justify-between gap-4 rounded-md border border-ih-border bg-ih-surface px-4 py-3 text-[14px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent"
            >
              <span className="font-medium">{item.label}</span>
              <span className="mono shrink-0 text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                {item.format ? `${item.format} · ` : ''}
                {item.size}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
